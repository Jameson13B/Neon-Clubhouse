import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import {
  onAuthStateChanged,
  signInWithPhoneNumber,
  signOut,
  type ConfirmationResult,
  type RecaptchaVerifier,
  type User,
} from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import {
  formatFirebaseAuthError,
  getFirebase,
  isFirebaseConfigured,
} from "../lib/firebase"

type AuthContextValue = {
  user: User | null
  ready: boolean
  canUseAuth: boolean
  isAdmin: boolean
  /** Set when Firestore rejects reading admins/{uid} (e.g. rules not deployed). */
  adminGateError: string | null
  sendPhoneVerificationCode: (
    phoneNumber: string,
    appVerifier: RecaptchaVerifier,
  ) => Promise<void>
  confirmPhoneCode: (code: string) => Promise<void>
  resetPhoneVerification: () => void
  signOutUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminGateError, setAdminGateError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const canUseAuth = isFirebaseConfigured()
  const phoneConfirmationRef = useRef<ConfirmationResult | null>(null)

  useEffect(() => {
    if (!canUseAuth) {
      setIsAdmin(false)
      setAdminGateError(null)
      setReady(true)
      return
    }
    const { auth, db } = getFirebase()
    let cancelled = false
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      if (!u) {
        setIsAdmin(false)
        setAdminGateError(null)
        setReady(true)
        return
      }
      setReady(false)
      void (async () => {
        try {
          setAdminGateError(null)
          const snap = await getDoc(doc(db, "admins", u.uid))
          if (!cancelled) {
            setIsAdmin(snap.exists())
            if (!snap.exists()) {
              console.info(
                "[auth] No Firestore doc admins/%s — create it with this exact document ID.",
                u.uid,
              )
            }
          }
        } catch (e) {
          console.error("[auth] admins/{uid} read failed", e)
          if (!cancelled) {
            setIsAdmin(false)
            setAdminGateError(formatFirebaseAuthError(e))
          }
        } finally {
          if (!cancelled) setReady(true)
        }
      })()
    })
    return () => {
      cancelled = true
      unsub()
    }
  }, [canUseAuth])

  const resetPhoneVerification = useCallback(() => {
    phoneConfirmationRef.current = null
  }, [])

  const sendPhoneVerificationCode = useCallback(
    async (phoneNumber: string, appVerifier: RecaptchaVerifier) => {
      const { auth } = getFirebase()
      phoneConfirmationRef.current = await signInWithPhoneNumber(
        auth,
        phoneNumber.trim(),
        appVerifier,
      )
    },
    [],
  )

  const confirmPhoneCode = useCallback(async (code: string) => {
    const pending = phoneConfirmationRef.current
    if (!pending) {
      throw new Error("Request a verification code first.")
    }
    await pending.confirm(code.trim())
    phoneConfirmationRef.current = null
  }, [])

  const signOutUser = useCallback(async () => {
    phoneConfirmationRef.current = null
    const { auth } = getFirebase()
    await signOut(auth)
  }, [])

  const value = useMemo(
    () => ({
      user,
      ready,
      canUseAuth,
      isAdmin,
      adminGateError,
      sendPhoneVerificationCode,
      confirmPhoneCode,
      resetPhoneVerification,
      signOutUser,
    }),
    [
      user,
      ready,
      canUseAuth,
      isAdmin,
      adminGateError,
      sendPhoneVerificationCode,
      confirmPhoneCode,
      resetPhoneVerification,
      signOutUser,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

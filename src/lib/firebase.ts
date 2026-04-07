import { FirebaseError, initializeApp, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"

/** Turns Firebase Auth errors into short, actionable messages for the UI. */
export function formatFirebaseAuthError(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-phone-number":
        return "Invalid phone number. Use + and country code (e.g. +1 for US)."
      case "auth/missing-phone-number":
        return "Enter a phone number."
      case "auth/too-many-requests":
        return "Too many SMS attempts. Wait several minutes before trying again."
      case "auth/quota-exceeded":
        return "SMS quota exceeded. In Firebase Console, enable billing (Blaze) or use Phone test numbers under Authentication."
      case "auth/captcha-check-failed":
        return "reCAPTCHA check failed. Try again, or allow this site in ad blockers and privacy extensions."
      case "auth/network-request-failed":
        return "Network error. Check your connection and try again."
      case "auth/unauthorized-continue-uri":
      case "auth/unauthorized-domain":
        return `Domain not allowed: add "${typeof window !== "undefined" ? window.location.host : "your host"}" under Firebase → Authentication → Settings → Authorized domains.`
      case "auth/operation-not-supported-in-this-environment":
        return "Open this app over http://localhost or https://… — not as a file:// URL."
      case "auth/invalid-verification-code":
      case "auth/invalid-verification-id":
        return "Wrong or expired code. Go back and request a new one."
      case "permission-denied":
        return "Firestore denied this read. Deploy firestore.rules from this repo (admins/{uid} must allow read when signed in as that uid), or fix rules in the Firebase console."
      default:
        return `${error.message} (${error.code})`
    }
  }
  if (error instanceof Error) return error.message
  return String(error)
}

let app: FirebaseApp | null = null
let db: Firestore | null = null
let auth: Auth | null = null

export function isFirebaseConfigured(): boolean {
  const env = import.meta.env
  return Boolean(
    env.VITE_FIREBASE_API_KEY?.length &&
    env.VITE_FIREBASE_PROJECT_ID?.length &&
    env.VITE_FIREBASE_APP_ID?.length,
  )
}

export function getFirebase(): { app: FirebaseApp; db: Firestore; auth: Auth } {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase is not configured. Copy .env.example to .env and add your web app config from the Firebase console.",
    )
  }
  if (!app) {
    app = initializeApp({
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    })
    db = getFirestore(app)
    auth = getAuth(app)
  }
  return { app, db: db!, auth: auth! }
}

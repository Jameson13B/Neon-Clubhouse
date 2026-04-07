import { RecaptchaVerifier, type User } from "firebase/auth"
import { FormEvent, useLayoutEffect, useMemo, useRef, useState } from "react"
import { SetupBanner } from "../components/SetupBanner"
import { useAuth } from "../context/AuthContext"
import { formatFirebaseAuthError, getFirebase } from "../lib/firebase"
import { useProducts } from "../hooks/useProducts"
import {
  createProduct,
  removeProduct,
  updateProduct,
} from "../services/products"
import type { Product, ProductInput, ProductStatus } from "../types/product"
import { PRODUCT_STATUSES, STATUS_LABELS } from "../types/product"
import { Badge, statusTone } from "../ui/Badge"
import { Button } from "../ui/Button"
import { Card } from "../ui/Card"
import { FormField } from "../ui/FormField"
import { Input } from "../ui/Input"
import { Select } from "../ui/Select"
import { Stack } from "../ui/Stack"
import { Textarea } from "../ui/Textarea"
import { formatMoney } from "../lib/format"

function emptyForm(): ProductInput {
  return {
    name: "",
    contents: "",
    set: "",
    series: "",
    type: "",
    market: 0,
    cost: 0,
    quantity: 0,
    status: "in_stock",
    imageUrl: "",
  }
}

/**
 * Produces E.164 for Firebase (digits only after +, no spaces/punctuation).
 * - With a leading + (ASCII or fullwidth ＋): strips separators, keeps country code + subscriber.
 * - Without +: only accepts US/Canada NANP (10 digits, or 11 starting with 1).
 */
function normalizePhoneForFirebase(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  const hasLeadingPlus = trimmed.startsWith("+") || trimmed.startsWith("\uFF0B")
  const body = hasLeadingPlus ? trimmed.slice(1) : trimmed
  const digits = body.replace(/\D/g, "")
  if (!digits) return null

  if (hasLeadingPlus) {
    if (digits.length < 8 || digits.length > 15) return null
    return `+${digits}`
  }

  if (digits.length === 10) {
    return `+1${digits}`
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`
  }

  return null
}

function displayAuthIdentity(user: User | null): string {
  if (!user) return ""
  return user.phoneNumber ?? user.email ?? user.uid
}

function productToForm(p: Product): ProductInput {
  return {
    name: p.name,
    contents: p.contents,
    set: p.set,
    series: p.series,
    type: p.type,
    market: p.market,
    cost: p.cost,
    quantity: p.quantity,
    status: p.status,
    imageUrl: p.imageUrl,
  }
}

function productMatchesInventorySearch(p: Product, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const blob = [
    p.name,
    p.series,
    p.set,
    p.type,
    p.contents,
    STATUS_LABELS[p.status],
    String(p.quantity),
    formatMoney(p.cost),
    formatMoney(p.market),
  ]
    .join(" ")
    .toLowerCase()
  return blob.includes(q)
}

export function AdminPage() {
  const { products, loading, error, configured } = useProducts()
  const {
    user,
    ready,
    canUseAuth,
    isAdmin,
    adminGateError,
    sendPhoneVerificationCode,
    confirmPhoneCode,
    resetPhoneVerification,
    signOutUser,
  } = useAuth()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProductInput>(emptyForm)
  const [phone, setPhone] = useState("")
  const [smsCode, setSmsCode] = useState("")
  const [codeSent, setCodeSent] = useState(false)
  const [lastSentE164, setLastSentE164] = useState<string | null>(null)
  const [recaptchaKey, setRecaptchaKey] = useState(0)
  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null)
  const verifierRef = useRef<RecaptchaVerifier | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [inventorySearch, setInventorySearch] = useState("")

  const isAuthed = Boolean(user)

  const filteredInventory = useMemo(
    () =>
      products.filter((p) => productMatchesInventorySearch(p, inventorySearch)),
    [products, inventorySearch],
  )

  useLayoutEffect(() => {
    if (!configured || !canUseAuth || !ready || isAuthed || codeSent) {
      verifierRef.current = null
      return
    }
    const el = recaptchaContainerRef.current
    if (!el) return
    const { auth } = getFirebase()
    const verifier = new RecaptchaVerifier(auth, el, {
      size: "compact",
      callback: () => {
        /* token is picked up by verify() */
      },
    })
    verifierRef.current = verifier
    return () => {
      try {
        verifier.clear()
      } catch {
        /* ignore */
      }
      verifierRef.current = null
    }
  }, [configured, canUseAuth, ready, isAuthed, recaptchaKey, codeSent])
  const canManage = configured && canUseAuth && isAuthed && isAdmin

  const title = useMemo(
    () => (editingId ? "Edit product" : "Add product"),
    [editingId],
  )

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canManage) return
    setBusy(true)
    setMessage(null)
    try {
      if (editingId) {
        await updateProduct(editingId, form)
        setMessage("Product updated.")
      } else {
        await createProduct(form)
        setMessage("Product created.")
        setForm(emptyForm())
      }
    } catch (err) {
      setMessage((err as Error).message)
    } finally {
      setBusy(false)
      setForm(emptyForm())
      setEditingId(null)
    }
  }

  async function onDelete(id: string) {
    if (!canManage) return
    if (!window.confirm("Delete this product? This cannot be undone.")) return
    setBusy(true)
    setMessage(null)
    try {
      await removeProduct(id)
      if (editingId === id) {
        setEditingId(null)
        setForm(emptyForm())
      }
      setMessage("Product removed.")
    } catch (err) {
      setMessage((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  function startEdit(p: Product) {
    setEditingId(p.id)
    setForm(productToForm(p))
    setMessage(null)
  }

  function startNew() {
    setEditingId(null)
    setForm(emptyForm())
    setMessage(null)
  }

  async function onSendCode(e: FormEvent) {
    e.preventDefault()
    const verifier = verifierRef.current
    if (!verifier) {
      setMessage("Sign-in is not ready yet. Refresh the page and try again.")
      return
    }
    const e164 = normalizePhoneForFirebase(phone)
    if (!e164) {
      setMessage(
        "Use a full international number: start with + and your country code (e.g. US +1 555 234 5678). You can also enter 10 US digits without +.",
      )
      return
    }
    setBusy(true)
    setMessage(null)
    try {
      await sendPhoneVerificationCode(e164, verifier)
      setLastSentE164(e164)
      setCodeSent(true)
      setSmsCode("")
    } catch (errUnknown) {
      console.error("[phone auth] send code failed", errUnknown)
      setMessage(formatFirebaseAuthError(errUnknown))
      resetPhoneVerification()
      setCodeSent(false)
      setLastSentE164(null)
      setRecaptchaKey((k) => k + 1)
    } finally {
      setBusy(false)
    }
  }

  async function onConfirmCode(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMessage(null)
    try {
      await confirmPhoneCode(smsCode)
    } catch (errUnknown) {
      console.error("[phone auth] confirm code failed", errUnknown)
      setMessage(formatFirebaseAuthError(errUnknown))
    } finally {
      setBusy(false)
    }
  }

  function onUseDifferentNumber() {
    resetPhoneVerification()
    setCodeSent(false)
    setLastSentE164(null)
    setSmsCode("")
    setMessage(null)
    setRecaptchaKey((k) => k + 1)
  }

  if (!configured) {
    return (
      <Stack gap={4}>
        <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700 }}>
          Admin Dashboard
        </h1>
        <SetupBanner />
      </Stack>
    )
  }

  if (!ready) {
    return <p style={{ color: "var(--color-text-muted)" }}>Loading…</p>
  }

  return (
    <Stack gap={5}>
      <div>
        <h1 style={{ margin: "0 0 8px", fontSize: "1.75rem", fontWeight: 700 }}>
          Admin Dashboard
        </h1>
        {!isAuthed && (
          <p
            style={{
              margin: 0,
              color: "var(--color-text-muted)",
              maxWidth: 620,
            }}
          >
            Admin Only. Sign in to adjust inventory, pricing, status, and
            catalog metadata in real time.
          </p>
        )}
      </div>

      {!isAuthed ? (
        <Card padding="lg" style={{ maxWidth: 420 }}>
          {!codeSent ? (
            <form onSubmit={onSendCode}>
              <Stack gap={3}>
                <strong>Admin sign-in</strong>
                <FormField label="Phone number">
                  <Input
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="+15552345678"
                    title="International format: + then country code and number (no letters)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </FormField>
                <p
                  style={{
                    margin: 0,
                    color: "var(--color-text-muted)",
                    fontSize: "0.85rem",
                  }}
                >
                  Complete the security check, then send the code.
                </p>
                <div ref={recaptchaContainerRef} key={recaptchaKey} />
                <Button type="submit" disabled={busy} style={{ width: "100%" }}>
                  {busy ? "Sending code…" : "Send verification code"}
                </Button>
              </Stack>
            </form>
          ) : (
            <form onSubmit={onConfirmCode}>
              <Stack gap={3}>
                <strong>Enter verification code</strong>
                <p
                  style={{
                    margin: 0,
                    color: "var(--color-text-muted)",
                    fontSize: "0.9rem",
                  }}
                >
                  We sent a code to{" "}
                  <strong style={{ color: "var(--color-text)" }}>
                    {lastSentE164 ?? "your number"}
                  </strong>
                  .
                </p>
                <FormField label="SMS code">
                  <Input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value)}
                    placeholder="123456"
                    required
                  />
                </FormField>
                <Button type="submit" disabled={busy} style={{ width: "100%" }}>
                  {busy ? "Verifying…" : "Verify and sign in"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onUseDifferentNumber}
                  disabled={busy}
                >
                  Use a different number
                </Button>
              </Stack>
            </form>
          )}
        </Card>
      ) : !isAdmin ? (
        <Card padding="lg" style={{ maxWidth: 520 }}>
          <Stack gap={2}>
            <strong>Not authorized</strong>
            <p
              style={{
                margin: 0,
                color: "var(--color-text-muted)",
                fontSize: "0.95rem",
              }}
            >
              Signed in as{" "}
              <strong style={{ color: "var(--color-text)" }}>
                {displayAuthIdentity(user)}
              </strong>
              . Admin access requires a Firestore document whose{" "}
              <strong>document ID is exactly your Firebase Auth user ID</strong>{" "}
              (not your phone number), in the{" "}
              <code style={{ fontFamily: "var(--font-mono)" }}>admins</code>{" "}
              collection.
            </p>
            {user?.uid ? (
              <p
                style={{
                  margin: 0,
                  fontSize: "0.9rem",
                  color: "var(--color-text-muted)",
                }}
              >
                <span style={{ display: "block", marginBottom: 6 }}>
                  Use this document ID in Firestore:
                </span>
                <code
                  style={{
                    display: "block",
                    padding: "8px 10px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--color-surface-hover)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.82rem",
                    wordBreak: "break-all",
                    color: "var(--color-text)",
                  }}
                >
                  {user.uid}
                </code>
              </p>
            ) : null}
            {adminGateError ? (
              <p
                style={{
                  margin: 0,
                  fontSize: "0.9rem",
                  color: "var(--color-danger)",
                }}
                role="alert"
              >
                {adminGateError}
              </p>
            ) : null}
            <Button variant="secondary" onClick={() => signOutUser()}>
              Sign out
            </Button>
          </Stack>
        </Card>
      ) : (
        <Stack direction="row" justify="space-between" align="center" wrap>
          <span
            style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}
          >
            Signed in as{" "}
            <strong style={{ color: "var(--color-text)" }}>
              {displayAuthIdentity(user)}
            </strong>
          </span>
          <Button variant="secondary" onClick={() => signOutUser()}>
            Sign out
          </Button>
        </Stack>
      )}

      {message ? (
        <p
          style={{
            margin: 0,
            color:
              /permission-denied|invalid|wrong password|invalid credential|invalid-verification|missing or insufficient|network|failed|too-many|quota|reCAPTCHA|session-expired/i.test(
                message,
              )
                ? "var(--color-danger)"
                : "var(--color-success)",
          }}
          role="status"
        >
          {message}
        </p>
      ) : null}
      {error ? (
        <p style={{ margin: 0, color: "var(--color-danger)" }} role="alert">
          {error}
        </p>
      ) : null}

      {canManage ? (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 20,
            alignItems: "stretch",
          }}
        >
          <Card padding="lg" style={{ flex: "1 1 320px", minWidth: 280 }}>
            <Stack gap={3}>
              <Stack
                direction="row"
                justify="space-between"
                align="center"
                wrap
              >
                <h2 style={{ margin: 0, fontSize: "1.1rem" }}>{title}</h2>
                {editingId ? (
                  <Button variant="ghost" type="button" onClick={startNew}>
                    New product
                  </Button>
                ) : null}
              </Stack>
              <form onSubmit={onSubmit}>
                <Stack gap={3}>
                  <FormField label="Name">
                    <Input
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      required
                    />
                  </FormField>
                  <Stack direction="row" gap={3} wrap>
                    <div style={{ flex: "1 1 140px", minWidth: 0 }}>
                      <FormField label="Series">
                        <Input
                          value={form.series}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, series: e.target.value }))
                          }
                          required
                        />
                      </FormField>
                    </div>
                    <div style={{ flex: "1 1 140px", minWidth: 0 }}>
                      <FormField label="Set">
                        <Input
                          value={form.set}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, set: e.target.value }))
                          }
                          required
                        />
                      </FormField>
                    </div>
                  </Stack>
                  <FormField label="Type">
                    <Input
                      value={form.type}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, type: e.target.value }))
                      }
                      required
                    />
                  </FormField>
                  <FormField label="Contents">
                    <Textarea
                      value={form.contents}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, contents: e.target.value }))
                      }
                      rows={3}
                      placeholder="What the listing includes"
                    />
                  </FormField>
                  <FormField label="Image URL">
                    <Input
                      value={form.imageUrl}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, imageUrl: e.target.value }))
                      }
                      placeholder="https://"
                      inputMode="url"
                    />
                  </FormField>
                  <Stack direction="row" gap={3} wrap>
                    <div style={{ flex: "1 1 120px", minWidth: 0 }}>
                      <FormField label="Market / Resale (USD)">
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={form.market}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              market: parseFloat(e.target.value) || 0,
                            }))
                          }
                          required
                        />
                      </FormField>
                    </div>
                    <div style={{ flex: "1 1 120px", minWidth: 0 }}>
                      <FormField label="Cost / MSRP (USD)">
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={form.cost}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              cost: parseFloat(e.target.value) || 0,
                            }))
                          }
                          required
                        />
                      </FormField>
                    </div>
                    <div style={{ flex: "1 1 100px", minWidth: 0 }}>
                      <FormField label="Quantity">
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          value={form.quantity}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              quantity: parseInt(e.target.value, 10) || 0,
                            }))
                          }
                          required
                        />
                      </FormField>
                    </div>
                  </Stack>
                  <FormField label="Status">
                    <Select
                      value={form.status}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          status: e.target.value as ProductStatus,
                        }))
                      }
                    >
                      {PRODUCT_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                  <Stack direction="row" gap={2} wrap>
                    <Button type="submit" disabled={busy}>
                      {busy
                        ? "Saving…"
                        : editingId
                          ? "Save changes"
                          : "Add product"}
                    </Button>
                  </Stack>
                </Stack>
              </form>
            </Stack>
          </Card>

          <Card
            padding="lg"
            style={{
              flex: "1 1 360px",
              minWidth: 280,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              maxHeight: "calc(100vh - 220px)",
              overflow: "hidden",
            }}
          >
            <Stack
              gap={3}
              style={{
                flex: 1,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Inventory</h2>
              <Input
                type="search"
                placeholder="Search inventory…"
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                aria-label="Filter inventory list"
                autoComplete="off"
              />
              {loading ? (
                <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
                  Loading…
                </p>
              ) : products.length === 0 ? (
                <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
                  No products yet.
                </p>
              ) : filteredInventory.length === 0 ? (
                <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
                  No products match &quot;{inventorySearch.trim()}&quot;.
                </p>
              ) : (
                <div
                  style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    paddingRight: 4,
                    marginRight: -4,
                  }}
                >
                  <Stack gap={2}>
                    {filteredInventory.map((p) => (
                      <div
                        key={p.id}
                        style={{
                          border: "1px solid var(--color-border)",
                          borderRadius: "var(--radius-md)",
                          padding: 12,
                          background:
                            editingId === p.id
                              ? "var(--color-surface-hover)"
                              : "var(--color-bg)",
                        }}
                      >
                        <Stack gap={2}>
                          <Stack
                            direction="row"
                            justify="space-between"
                            align="flex-start"
                            wrap
                          >
                            <div>
                              <div style={{ fontWeight: 700 }}>{p.name}</div>
                              <div
                                style={{
                                  fontSize: "0.85rem",
                                  color: "var(--color-text-muted)",
                                }}
                              >
                                {p.series} · {p.set}
                                {p.type ? ` · ${p.type}` : ""} · Qty{" "}
                                {p.quantity}
                              </div>
                              {p.contents ? (
                                <div
                                  style={{
                                    fontSize: "0.8rem",
                                    color: "var(--color-text-muted)",
                                    marginTop: 4,
                                    maxWidth: "100%",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {p.contents}
                                </div>
                              ) : null}
                              <div
                                style={{ fontSize: "0.85rem", marginTop: 4 }}
                              >
                                {formatMoney(p.cost)}
                                {p.market > p.cost ? (
                                  <span
                                    style={{
                                      color: "var(--color-text-muted)",
                                      marginLeft: 8,
                                      textDecoration: "line-through",
                                    }}
                                  >
                                    {formatMoney(p.market)}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                            <Badge tone={statusTone(p.status)}>
                              {STATUS_LABELS[p.status]}
                            </Badge>
                          </Stack>
                          <Stack direction="row" gap={2} wrap>
                            <Button
                              variant="secondary"
                              type="button"
                              onClick={() => startEdit(p)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              type="button"
                              onClick={() => onDelete(p.id)}
                              disabled={busy}
                            >
                              Delete
                            </Button>
                          </Stack>
                        </Stack>
                      </div>
                    ))}
                  </Stack>
                </div>
              )}
            </Stack>
          </Card>
        </div>
      ) : null}
    </Stack>
  )
}

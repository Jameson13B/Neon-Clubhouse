import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  type Timestamp,
  type Unsubscribe,
  updateDoc,
} from "firebase/firestore"
import type { Product, ProductInput, ProductStatus } from "../types/product"
import { PRODUCT_STATUSES } from "../types/product"
import { getFirebase, isFirebaseConfigured } from "../lib/firebase"

const COLLECTION = "a10-clubhouse"

function mapDoc(id: string, data: Record<string, unknown>): Product {
  const rawStatus = data.status
  const status: ProductStatus = PRODUCT_STATUSES.includes(
    rawStatus as ProductStatus,
  )
    ? (rawStatus as ProductStatus)
    : "in_stock"

  return {
    id,
    name: String(data.name ?? ""),
    contents: String(data.contents ?? ""),
    set: String(data.set ?? ""),
    series: String(data.series ?? ""),
    type: String(data.type ?? ""),
    market: Number(data.market ?? 0),
    cost: Number(data.cost ?? 0),
    quantity: Number(data.quantity ?? 0),
    status,
    imageUrl: String(data.imageUrl ?? ""),
    updatedAt: (data.updatedAt as Timestamp | null | undefined) ?? null,
  }
}

export function subscribeProducts(
  onData: (products: Product[]) => void,
  onError?: (e: Error) => void,
): Unsubscribe | null {
  if (!isFirebaseConfigured()) {
    onData([])
    return null
  }
  const { db } = getFirebase()
  return onSnapshot(
    collection(db, COLLECTION),
    (snap) => {
      const list = snap.docs
        .map((d) => mapDoc(d.id, d.data() as Record<string, unknown>))
        .sort((a, b) => {
          const ta = a.updatedAt?.toMillis?.() ?? 0
          const tb = b.updatedAt?.toMillis?.() ?? 0
          return tb - ta
        })
      onData(list)
    },
    (err) => {
      onError?.(err as Error)
    },
  )
}

export async function createProduct(input: ProductInput): Promise<void> {
  const { db } = getFirebase()
  await addDoc(collection(db, COLLECTION), {
    ...input,
    updatedAt: serverTimestamp(),
  })
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>,
): Promise<void> {
  const { db } = getFirebase()
  await updateDoc(doc(db, COLLECTION, id), {
    ...input,
    updatedAt: serverTimestamp(),
  })
}

export async function removeProduct(id: string): Promise<void> {
  const { db } = getFirebase()
  await deleteDoc(doc(db, COLLECTION, id))
}

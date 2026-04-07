import type { Timestamp } from "firebase/firestore"

export const PRODUCT_STATUSES = [
  "in_stock",
  "sold_out",
  "in_transit",
  "locked",
] as const

export type ProductStatus = (typeof PRODUCT_STATUSES)[number]

export interface Product {
  id: string
  name: string
  contents: string
  set: string
  series: string
  type: string
  market: number
  cost: number
  quantity: number
  status: ProductStatus
  imageUrl: string
  updatedAt: Timestamp | null
}

export type ProductInput = Omit<Product, "id" | "updatedAt">

export const STATUS_LABELS: Record<ProductStatus, string> = {
  in_stock: "In stock",
  sold_out: "Sold out",
  in_transit: "In transit",
  locked: "Locked",
}

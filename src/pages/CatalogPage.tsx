import { useMemo, useState } from "react"
import { ProductCard } from "../components/ProductCard"
import { SetupBanner } from "../components/SetupBanner"
import { useProducts } from "../hooks/useProducts"
import type { Product } from "../types/product"
import { FormField } from "../ui/FormField"
import { Select } from "../ui/Select"
import { Stack } from "../ui/Stack"

const SORT_OPTIONS = [
  { value: "name-asc", label: "Name (A → Z)" },
  { value: "name-desc", label: "Name (Z → A)" },
  { value: "price-asc", label: "Price (low → high)" },
  { value: "price-desc", label: "Price (high → low)" },
  { value: "type-asc", label: "Type (A → Z)" },
  { value: "type-desc", label: "Type (Z → A)" },
] as const

type SortValue = (typeof SORT_OPTIONS)[number]["value"]

function uniqueSortedStrings(values: string[]): string[] {
  const seen = new Set<string>()
  for (const v of values) {
    const t = v.trim()
    if (t) seen.add(t)
  }
  return [...seen].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  )
}

function filterProducts(
  products: Product[],
  filters: { type: string; series: string; set: string },
): Product[] {
  return products.filter((p) => {
    if (filters.type && p.type.trim() !== filters.type) return false
    if (filters.series && p.series.trim() !== filters.series) return false
    if (filters.set && p.set.trim() !== filters.set) return false
    return true
  })
}

function sortProducts(list: Product[], sort: SortValue): Product[] {
  const next = [...list]
  const byName = (a: Product, b: Product) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  const byType = (a: Product, b: Product) =>
    a.type.localeCompare(b.type, undefined, { sensitivity: "base" }) ||
    byName(a, b)

  switch (sort) {
    case "name-asc":
      return next.sort(byName)
    case "name-desc":
      return next.sort((a, b) => byName(b, a))
    case "price-asc":
      return next.sort((a, b) => a.cost - b.cost || byName(a, b))
    case "price-desc":
      return next.sort((a, b) => b.cost - a.cost || byName(a, b))
    case "type-asc":
      return next.sort(byType)
    case "type-desc":
      return next.sort((a, b) => byType(b, a))
    default:
      return next
  }
}

export function CatalogPage() {
  const { products, loading, error, configured } = useProducts()
  const [filterType, setFilterType] = useState("")
  const [filterSeries, setFilterSeries] = useState("")
  const [filterSet, setFilterSet] = useState("")
  const [sort, setSort] = useState<SortValue>("name-asc")

  const typeOptions = useMemo(
    () => uniqueSortedStrings(products.map((p) => p.type)),
    [products],
  )
  const seriesOptions = useMemo(
    () => uniqueSortedStrings(products.map((p) => p.series)),
    [products],
  )
  const setOptions = useMemo(
    () => uniqueSortedStrings(products.map((p) => p.set)),
    [products],
  )

  const filtered = useMemo(
    () =>
      filterProducts(products, {
        type: filterType,
        series: filterSeries,
        set: filterSet,
      }),
    [products, filterType, filterSeries, filterSet],
  )

  const displayed = useMemo(
    () => sortProducts(filtered, sort),
    [filtered, sort],
  )

  const filterActive = Boolean(filterType || filterSeries || filterSet)

  return (
    <Stack gap={5}>
      <div>
        <h1 style={{ margin: "0 0 8px", fontSize: "1.75rem", fontWeight: 700 }}>
          Catalog
        </h1>
        <p
          style={{
            margin: 0,
            color: "var(--color-text-muted)",
            maxWidth: 560,
            fontStyle: "italic",
          }}
        >
          Current inventory and orders available to verified customers only.
          <br />
          Product, price, inventory, and status are subject to change at any
          time.
          <br />
          Absolutely no scalping allowed! Product limits may apply.
        </p>
      </div>

      {!configured ? <SetupBanner /> : null}
      {error ? (
        <p style={{ color: "var(--color-danger)", margin: 0 }} role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p style={{ color: "var(--color-text-muted)", margin: 0 }}>
          Loading products…
        </p>
      ) : configured && products.length === 0 ? (
        <p style={{ color: "var(--color-text-muted)", margin: 0 }}>
          No products yet. Use Admin to add your first item.
        </p>
      ) : (
        <>
          <Stack
            gap={4}
            style={{
              padding: "16px 0",
              borderTop: "1px solid var(--color-border)",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "flex-end",
                gap: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 16,
                  flex: "1 1 auto",
                  minWidth: 0,
                }}
              >
                <div
                  style={{ flex: "1 1 160px", minWidth: 140, maxWidth: 280 }}
                >
                  <FormField label="Filter by type">
                    <Select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      aria-label="Filter by type"
                    >
                      <option value="">All types</option>
                      {typeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                </div>
                <div
                  style={{ flex: "1 1 160px", minWidth: 140, maxWidth: 280 }}
                >
                  <FormField label="Filter by series">
                    <Select
                      value={filterSeries}
                      onChange={(e) => setFilterSeries(e.target.value)}
                      aria-label="Filter by series"
                    >
                      <option value="">All series</option>
                      {seriesOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                </div>
                <div
                  style={{ flex: "1 1 160px", minWidth: 140, maxWidth: 280 }}
                >
                  <FormField label="Filter by set">
                    <Select
                      value={filterSet}
                      onChange={(e) => setFilterSet(e.target.value)}
                      aria-label="Filter by set"
                    >
                      <option value="">All sets</option>
                      {setOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                </div>
              </div>
              <div
                style={{
                  flex: "0 0 auto",
                  marginLeft: "auto",
                  minWidth: 200,
                  maxWidth: 280,
                }}
              >
                <FormField label="Sort by">
                  <Select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortValue)}
                    aria-label="Sort products"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                </FormField>
              </div>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "0.9rem",
                color: "var(--color-text-muted)",
              }}
            >
              {filterActive
                ? `Showing ${displayed.length} of ${products.length} products`
                : `${displayed.length} product${displayed.length === 1 ? "" : "s"}`}
            </p>
          </Stack>

          {displayed.length === 0 ? (
            <p style={{ color: "var(--color-text-muted)", margin: 0 }}>
              No products match these filters. Try clearing a filter or choose
              &quot;All&quot;.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 20,
              }}
            >
              {displayed.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </>
      )}
    </Stack>
  )
}

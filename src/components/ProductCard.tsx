import type { Product } from "../types/product"
import { STATUS_LABELS } from "../types/product"
import { Badge, statusTone } from "../ui/Badge"
import { Card } from "../ui/Card"
import { Stack } from "../ui/Stack"
import { formatMoney } from "../lib/format"

type Props = { product: Product }

export function ProductCard({ product }: Props) {
  const discountPct =
    product.market > 0
      ? Math.round(100 - (product.cost / product.market) * 100)
      : 0

  return (
    <Card
      padding="lg"
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <div
        style={{
          aspectRatio: "16 / 10",
          borderRadius: "var(--radius-md)",
          background: `url(${product.imageUrl}) center/contain no-repeat`,
          border: "1px solid var(--color-border)",
          marginBottom: 16,
        }}
      />
      <Stack gap={2} style={{ flex: 1, justifyContent: "space-between" }}>
        <Stack gap={0} justify="space-between" align="flex-start" wrap>
          <div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--color-text-muted)",
                fontWeight: 600,
              }}
            >
              {product.series} · {product.set}
            </div>
            <h2
              style={{
                margin: "4px 0 0",
                fontSize: "1.15rem",
                fontWeight: 700,
              }}
            >
              {product.name}
            </h2>
          </div>
          {product.contents ? (
            <p
              style={{
                margin: 0,
                color: "var(--color-text-muted)",
                fontSize: "0.9rem",
                flex: 1,
              }}
            >
              Contains: {product.contents}
            </p>
          ) : null}
        </Stack>

        <Stack align="baseline" direction="row" gap={3} wrap>
          <Badge tone={statusTone(product.status)}>
            {STATUS_LABELS[product.status]}
          </Badge>
          <div
            style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}
          >
            Qty available:{" "}
            <strong style={{ color: "var(--color-text)" }}>
              {product.quantity}
            </strong>
          </div>
        </Stack>

        <Stack direction="row" align="center" gap={3} wrap>
          <span style={{ fontSize: "1.25rem", fontWeight: 700 }}>
            {formatMoney(product.cost)}
          </span>
          {product.market > product.cost ? (
            <>
              <span
                style={{
                  textDecoration: "line-through",
                  color: "var(--color-text-muted)",
                }}
              >
                {formatMoney(product.market)}
              </span>
              {discountPct > 0 ? (
                <Badge tone="success">−{discountPct}%</Badge>
              ) : null}
            </>
          ) : null}
        </Stack>
      </Stack>
    </Card>
  )
}

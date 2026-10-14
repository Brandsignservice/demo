import { X } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../data/types";
import { buildComparisonRows } from "../lib/compare";
import { formatMoney } from "../lib/format";
import ProductImage from "./ProductImage";

interface Props {
  products: Product[];
  variant?: "page" | "chat";
  onRemove?: (id: string) => void;
}

/** Side-by-side comparison. "chat" variant is compact and scrolls horizontally inside a message. */
export default function CompareTable({ products, variant = "page", onRemove }: Props) {
  const rows = buildComparisonRows(products);
  const compact = variant === "chat";

  return (
    <div className="overflow-x-auto rounded-xl border border-gold/15 bg-noir/50 scrollbar-thin">
      <table className="w-full border-collapse text-left" style={{ minWidth: compact ? 460 : 640 }}>
        <caption className="sr-only">Comparison of {products.map((p) => p.name).join(", ")}</caption>
        <thead>
          <tr>
            <th scope="col" className={`sticky left-0 z-10 bg-noir/95 ${compact ? "w-28 p-3" : "w-44 p-5"} align-bottom text-[11px] font-semibold uppercase tracking-[0.14em] text-mist`}>
              Compare
            </th>
            {products.map((p) => (
              <th scope="col" key={p.id} className={`${compact ? "p-3" : "p-5"} align-top`}>
                <div className={`flex flex-col gap-3 ${compact ? "w-36" : "w-52"}`}>
                  <Link to={`/product/${p.slug}`} className="block aspect-square overflow-hidden rounded-md bg-graphite">
                    <ProductImage src={p.image} alt={p.imageAlt} label={p.name} sizes="180px" />
                  </Link>
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/product/${p.slug}`} className="font-display text-lg leading-tight text-ivory hover:text-champagne">
                      {p.name}
                    </Link>
                    {onRemove && (
                      <button
                        type="button"
                        onClick={() => onRemove(p.id)}
                        aria-label={`Remove ${p.name}`}
                        className="rounded-full p-1 text-mist transition hover:text-champagne"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="font-display text-xl text-champagne">{formatMoney(p.price)}</p>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={`${row.label}-${i}`} className="border-t border-gold/10 align-top">
              <th scope="row" className={`sticky left-0 z-10 bg-noir/95 ${compact ? "p-3" : "p-5"} text-[12px] font-semibold text-mist`}>
                {row.label}
              </th>
              {row.values.map((v, j) => (
                <td key={j} className={`${compact ? "p-3 text-xs" : "p-5 text-sm"} leading-relaxed text-ivory/90`}>
                  {v === "Not recorded" ? <span className="italic text-mist">Not recorded</span> : v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { ArrowRight, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { products, productById } from "../data/products";
import { useCompare, MAX_COMPARE } from "../context/CompareContext";
import ProductImage from "./ProductImage";

/** Floating selection bar for the comparison feature. Hidden on the comparison page itself. */
export default function CompareTray() {
  const { ids, remove, clear, limitReached } = useCompare();
  const location = useLocation();
  if (ids.length === 0 || location.pathname.startsWith("/compare")) return null;

  const items = ids.map((id) => productById(id)).filter((p): p is (typeof products)[number] => Boolean(p));

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 md:px-6 md:pb-6 anim-fade-up" role="region" aria-label="Comparison selection">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3 rounded-2xl border border-gold/25 bg-onyx/95 p-3 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:flex-nowrap sm:gap-4 sm:p-3.5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {items.map((p) => (
            <div key={p.id} className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gold/20 bg-graphite">
              <ProductImage src={p.image} alt={p.name} label={p.name} sizes="48px" />
              <button
                type="button"
                onClick={() => remove(p.id)}
                aria-label={`Remove ${p.name} from comparison`}
                className="absolute right-0 top-0 rounded-bl-md bg-noir/80 p-0.5 text-ivory"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <p className="ml-1 min-w-0 truncate text-[13px] text-ivory/85">
            <span className="font-semibold text-champagne">{ids.length} of {MAX_COMPARE}</span>
            <span className="hidden sm:inline"> pieces selected</span>
            {limitReached && <span className="block truncate text-[11px] text-amber-200/90">Remove one to add another.</span>}
          </p>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <button type="button" onClick={clear} className="rounded-full px-3 py-2 text-[12px] font-medium text-mist transition hover:text-ivory">
            Clear
          </button>
          <Link to={`/compare`} className="btn-gold !px-5 !py-2.5 !text-[12px] flex-1 sm:flex-none" aria-disabled={ids.length < 2}>
            Compare <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}

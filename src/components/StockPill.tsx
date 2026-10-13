import type { StockStatus } from "../data/types";

const tone: Record<StockStatus, string> = {
  "In stock": "bg-emerald-300",
  "Low stock": "bg-amber-300",
  "Made to order": "bg-champagne",
};

export default function StockPill({ status, className = "" }: { status: StockStatus; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-xs text-mist ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${tone[status]}`} aria-hidden />
      {status} <span className="sr-only">(demo data)</span>
    </span>
  );
}

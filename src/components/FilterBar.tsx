import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { BUDGET_RANGES } from "../lib/filters";

export interface Filters {
  budget: string;
  style: string;
  occasion: string;
  sort: string;
}

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  styles: string[];
  occasions: string[];
  total: number;
  onClear: () => void;
}

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name A–Z" },
];

function Select({ id, label, value, onChange, children }: { id: string; label: string; value: string; onChange: (v: string) => void; children: ReactNode }) {
  return (
    <div className="relative">
      <label htmlFor={id} className="label !mb-1.5">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="field appearance-none !py-2.5 pr-10 text-sm">
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute bottom-3 right-3.5 h-4 w-4 text-gold" aria-hidden />
    </div>
  );
}

export default function FilterBar({ filters, onChange, styles, occasions, total, onClear }: Props) {
  const set = (k: keyof Filters) => (v: string) => onChange({ ...filters, [k]: v });
  const active = filters.budget !== "any" || filters.style !== "all" || filters.occasion !== "all";

  return (
    <div className="border-y border-gold/15 py-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 gap-4 sm:grid-cols-3">
          <Select id="filter-budget" label="Budget" value={filters.budget} onChange={set("budget")}>
            <option value="any">Any budget</option>
            {BUDGET_RANGES.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </Select>
          <Select id="filter-style" label="Style" value={filters.style} onChange={set("style")}>
            <option value="all">All styles</option>
            {styles.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          <Select id="filter-occasion" label="Occasion" value={filters.occasion} onChange={set("occasion")}>
            <option value="all">All occasions</option>
            {occasions.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </Select>
        </div>
        <div className="flex items-end gap-4">
          <Select id="filter-sort" label="Sort" value={filters.sort} onChange={set("sort")}>
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </Select>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-mist">
        <p aria-live="polite">{total} {total === 1 ? "piece" : "pieces"} shown</p>
        {active && (
          <button type="button" onClick={onClear} className="text-[12px] font-semibold uppercase tracking-[0.14em] text-champagne hover:underline underline-offset-4">
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

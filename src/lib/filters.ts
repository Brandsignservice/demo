import type { Budget } from "./assistant";
import { products } from "../data/products";
import type { Product } from "../data/types";

export interface BudgetRange extends Budget {
  id: string;
  label: string;
}

export const BUDGET_RANGES: BudgetRange[] = [
  { id: "under-500", label: "Under $500", max: 499.99 },
  { id: "500-1000", label: "$500 – $1,000", min: 500, max: 1000 },
  { id: "1000-2000", label: "$1,000 – $2,000", min: 1000, max: 2000 },
  { id: "over-2000", label: "Over $2,000", min: 2000 },
];

export function applyFilters(
  items: Product[],
  f: { budget: string; style: string; occasion: string; sort: string },
): Product[] {
  const range = BUDGET_RANGES.find((r) => r.id === f.budget);
  let out = items.filter((p) => {
    if (range && (range.min !== undefined && p.price < range.min)) return false;
    if (range && (range.max !== undefined && p.price > range.max)) return false;
    if (f.style !== "all" && !p.styles.includes(f.style as Product["styles"][number])) return false;
    if (f.occasion !== "all" && !p.occasions.includes(f.occasion as Product["occasions"][number])) return false;
    return true;
  });

  const featuredOrder = (p: Product) => products.indexOf(p);
  out = [...out].sort((a, b) => {
    switch (f.sort) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return featuredOrder(a) - featuredOrder(b);
    }
  });
  return out;
}

export const styleOptions = (items: Product[]): string[] =>
  [...new Set(items.flatMap((p) => p.styles))].sort();

export const occasionOptions = (items: Product[]): string[] =>
  [...new Set(items.flatMap((p) => p.occasions))].sort();

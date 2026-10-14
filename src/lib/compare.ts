import type { Product } from "../data/types";
import { categoryLabel, formatMoney } from "./format";

export interface CompareRow {
  label: string;
  values: string[];
}

/** Short certificate status for comparison tables. Never claims a certificate. */
export const certificateShort = (p: Product): string =>
  p.certification.startsWith("No gemstones") ? "Not applicable (no gemstones)" : "Not provided in demo record";

/** One-sentence answer for "does it have a certificate / what is it made of" questions. */
export const certificateSummary = (p: Product): string =>
  p.certification.startsWith("No gemstones")
    ? "There are no gemstones in this piece, so no gemstone certificate applies."
    : `Gemstone certificate: ${p.certification}`;

/** Builds the rows for a side-by-side comparison. Missing data is shown as "Not recorded". */
export function buildComparisonRows(items: Product[]): CompareRow[] {
  const rows: CompareRow[] = [
    { label: "Price (USD)", values: items.map((p) => formatMoney(p.price)) },
    { label: "Category", values: items.map((p) => categoryLabel(p.category)) },
    { label: "Materials", values: items.map((p) => p.materials.join("; ")) },
    { label: "Style", values: items.map((p) => p.styles.join(", ")) },
    { label: "Occasions", values: items.map((p) => p.occasions.join(", ")) },
    { label: "Dimensions", values: items.map((p) => p.dimensions) },
    { label: "Colours", values: items.map((p) => p.colours.join(", ")) },
    { label: "Gemstone certificate", values: items.map(certificateShort) },
    { label: "Stock (demo data)", values: items.map((p) => p.stock) },
  ];

  const specLabels: string[] = [];
  for (const p of items) for (const s of p.specs) if (!specLabels.includes(s.label)) specLabels.push(s.label);
  for (const label of specLabels) {
    rows.push({
      label,
      values: items.map((p) => p.specs.find((s) => s.label === label)?.value ?? "Not recorded"),
    });
  }

  rows.push({ label: "Care (first step)", values: items.map((p) => p.care[0]) });
  return rows;
}

import { Check, Plus } from "lucide-react";
import { useCompare } from "../context/CompareContext";

export default function CompareButton({ id, name, compact = false }: { id: string; name: string; compact?: boolean }) {
  const { has, toggle, limitReached } = useCompare();
  const active = has(id);
  const disabled = !active && limitReached;

  return (
    <button
      type="button"
      onClick={() => toggle(id)}
      aria-pressed={active}
      aria-label={active ? `Remove ${name} from comparison` : `Add ${name} to comparison`}
      title={disabled ? "You can compare up to three pieces" : undefined}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[12px] font-semibold tracking-wide transition duration-300 ease-luxe ${
        active
          ? "border-champagne bg-champagne text-noir"
          : "border-gold/30 text-ivory/85 hover:border-champagne hover:text-champagne"
      } ${disabled ? "opacity-40" : ""}`}
    >
      {active ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Plus className="h-3.5 w-3.5" aria-hidden />}
      {compact ? (active ? "Added" : "Compare") : active ? "In comparison" : "Compare"}
    </button>
  );
}

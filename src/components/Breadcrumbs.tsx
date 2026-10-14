import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[12px] text-mist">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3 w-3" aria-hidden />}
            {item.to ? (
              <Link to={item.to} className="transition hover:text-champagne">{item.label}</Link>
            ) : (
              <span aria-current="page" className="text-ivory/80">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../data/types";
import { categoryLabel, formatMoney } from "../lib/format";
import CompareButton from "./CompareButton";
import DemoLabel from "./DemoLabel";
import ProductImage from "./ProductImage";
import StockPill from "./StockPill";

interface Props {
  product: Product;
  reason?: string;
  priority?: boolean;
  className?: string;
}

export default function ProductCard({ product: p, reason, priority = false, className = "" }: Props) {
  return (
    <article className={`group flex h-full flex-col ${className}`}>
      <Link
        to={`/product/${p.slug}`}
        className="relative block aspect-square overflow-hidden rounded-sm bg-graphite"
        aria-label={`View ${p.name}`}
      >
        <ProductImage
          src={p.image}
          alt={p.imageAlt}
          label={p.name}
          priority={priority}
          className="transition duration-[1.2s] ease-luxe group-hover:scale-[1.04]"
        />
        <DemoLabel className="absolute left-3 top-3" />
      </Link>

      <div className="flex flex-1 flex-col pt-5">
        <p className="eyebrow !text-[10px]">{categoryLabel(p.category)}</p>
        <h3 className="mt-2 text-2xl leading-tight text-ivory">
          <Link to={`/product/${p.slug}`} className="transition hover:text-champagne">
            {p.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-mist">{reason ?? p.summary}</p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="font-display text-2xl text-champagne">{formatMoney(p.price)}</p>
            <StockPill status={p.stock} className="mt-1" />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Link to={`/product/${p.slug}`} className="btn-outline !px-4 !py-2.5 !text-[12px]">
            View Product <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <CompareButton id={p.id} name={p.name} />
        </div>
      </div>
    </article>
  );
}

import { Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import FilterBar, { type Filters } from "../components/FilterBar";
import ProductCard from "../components/ProductCard";
import { useChat } from "../context/ChatContext";
import { products } from "../data/products";
import type { Product } from "../data/types";
import { applyFilters, occasionOptions, styleOptions } from "../lib/filters";

type Slug = "jewellery" | "watches" | "engagement-rings" | "gifts";

const COLLECTIONS: Record<Slug, { title: string; eyebrow: string; intro: string; prompt: string; filter: (p: Product) => boolean }> = {
  jewellery: {
    title: "Jewellery",
    eyebrow: "Necklaces, earrings, bracelets",
    intro: "Everyday and occasion jewellery in gold, diamond, and pearl. Each record lists its materials, dimensions, and care.",
    prompt: "Find jewellery for me",
    filter: (p) => p.category === "jewellery",
  },
  watches: {
    title: "Watches",
    eyebrow: "Automatic, chronograph, dress",
    intro: "Automatic, chronograph, and dress watches. Narrow by budget and style, or ask the assistant to choose for you.",
    prompt: "Find a watch for me",
    filter: (p) => p.category === "watches",
  },
  "engagement-rings": {
    title: "Engagement Rings",
    eyebrow: "Solitaires, sapphires, wedding bands",
    intro: "Considered rings for proposals and milestones. Gemstone certification is shown only where it is recorded.",
    prompt: "I need an engagement ring within my budget.",
    filter: (p) => p.category === "engagement",
  },
  gifts: {
    title: "Gifts",
    eyebrow: "Gifts by occasion and budget",
    intro: "Pieces chosen for birthdays, anniversaries, and thank-you gifts. Filter by occasion and budget, or describe the recipient to the assistant.",
    prompt: "Help me find a gift",
    filter: (p) => p.giftFriendly,
  },
};

export default function CollectionPage() {
  const { category = "" } = useParams();
  const config = COLLECTIONS[category as Slug];
  if (!config) return <Navigate to="/" replace />;
  return <Collection key={category} config={config} />;
}

function Collection({ config }: { config: (typeof COLLECTIONS)[Slug] }) {
  const { open } = useChat();
  const base = useMemo(() => products.filter(config.filter), [config]);
  const [filters, setFilters] = useState<Filters>({ budget: "any", style: "all", occasion: "all", sort: "featured" });
  const items = useMemo(() => applyFilters(base, filters), [base, filters]);
  const styles = useMemo(() => styleOptions(base), [base]);
  const occasions = useMemo(() => occasionOptions(base), [base]);

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-28 pt-10 lg:px-10 lg:pt-14">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: config.title }]} />

      <header className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="anim-fade-up">
          <p className="eyebrow">{config.eyebrow}</p>
          <h1 className="mt-4 text-5xl md:text-7xl">{config.title}</h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-mist">{config.intro}</p>
        </div>
        <button type="button" onClick={() => open(config.prompt)} className="btn-outline anim-fade-up self-start lg:self-auto">
          <Sparkles className="h-4 w-4 text-champagne" aria-hidden /> Ask AUREVÉ to narrow this
        </button>
      </header>

      <div className="mt-10">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          styles={styles}
          occasions={occasions}
          total={items.length}
          onClear={() => setFilters({ budget: "any", style: "all", occasion: "all", sort: "featured" })}
        />
      </div>

      {items.length > 0 ? (
        <ul className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((p, i) => (
            <li key={p.id} className="anim-fade-up" style={{ animationDelay: `${Math.min(i, 6) * 70}ms` }}>
              <ProductCard product={p} priority={i < 2} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-16 rounded-2xl border border-gold/15 bg-onyx p-10 text-center">
          <h2 className="text-3xl">No pieces match those filters.</h2>
          <p className="mx-auto mt-3 max-w-md text-mist">Try a wider budget, or ask the assistant to suggest something close to your brief.</p>
          <button type="button" onClick={() => open(config.prompt)} className="btn-gold mt-8">
            <Sparkles className="h-4 w-4" aria-hidden /> Ask AUREVÉ AI
          </button>
          <p className="mt-6 text-sm">
            <Link to="/gifts" className="text-champagne underline-offset-4 hover:underline">Browse gifts</Link>
          </p>
        </div>
      )}
    </div>
  );
}

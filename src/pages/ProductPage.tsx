import { ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import CompareButton from "../components/CompareButton";
import DemoLabel from "../components/DemoLabel";
import ProductCard from "../components/ProductCard";
import ProductImage from "../components/ProductImage";
import Reveal from "../components/Reveal";
import StockPill from "../components/StockPill";
import { useChat } from "../context/ChatContext";
import { productById, productBySlug } from "../data/products";
import { POLICIES } from "../data/brand";
import type { Product } from "../data/types";
import { certificateSummary } from "../lib/compare";
import { categoryLabel, formatMoney, slugToPath } from "../lib/format";

const CATEGORY_TITLES: Record<Product["category"], string> = {
  jewellery: "Jewellery",
  watches: "Watches",
  engagement: "Engagement Rings",
};

export default function ProductPage() {
  const { slug = "" } = useParams();
  const product = productBySlug(slug);
  if (!product) return <Navigate to="/" replace />;
  return <ProductDetail key={product.id} product={product} />;
}

function Section({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-gold/15 bg-onyx p-7 md:p-8 ${className}`} aria-label={title}>
      <h2 className="text-2xl text-ivory">{title}</h2>
      <div className="mt-4 text-[15px] leading-relaxed text-ivory/80">{children}</div>
    </section>
  );
}

function ProductDetail({ product: p }: { product: Product }) {
  const { open } = useChat();
  const [colour, setColour] = useState(p.colours[0]);
  const pairs = p.pairsWith.map((id) => productById(id)).filter((x): x is Product => Boolean(x));
  const categoryTo = slugToPath(p.category);

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-28 pt-10 lg:px-10 lg:pt-14">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: CATEGORY_TITLES[p.category], to: categoryTo },
          { label: p.name },
        ]}
      />

      <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="relative anim-fade-in lg:sticky lg:top-28 lg:self-start">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-graphite">
            <ProductImage src={p.image} alt={p.imageAlt} label={p.name} priority sizes="(min-width: 1024px) 50vw, 100vw" />
          </div>
          <DemoLabel className="absolute left-4 top-4" />
        </div>

        <div className="flex flex-col anim-fade-up">
          <p className="eyebrow">{categoryLabel(p.category)}</p>
          <h1 className="mt-4 text-5xl leading-[1.02] md:text-6xl">{p.name}</h1>
          <p className="mt-5 font-display text-3xl text-champagne">{formatMoney(p.price)}</p>
          <p className="mt-6 text-[16px] leading-relaxed text-ivory/85">{p.summary}</p>

          <div className="mt-7 flex flex-wrap gap-2">
            {p.styles.map((s) => (
              <span key={s} className="rounded-full border border-gold/20 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-champagne/90">{s}</span>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-gold/15 bg-noir/50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <StockPill status={p.stock} />
              <span className="text-[11px] uppercase tracking-[0.14em] text-mist">Demo data</span>
            </div>
            <p className="mt-2 text-sm text-mist">{p.stockNote}</p>
          </div>

          <fieldset className="mt-8">
            <legend className="label">Colour · {colour}</legend>
            <div className="flex flex-wrap gap-2">
              {p.colours.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={colour === c}
                  onClick={() => setColour(c)}
                  className={`chip !text-[12px] ${colour === c ? "!border-champagne !bg-champagne/15 !text-ivory" : ""}`}
                >
                  {c}
                </button>
              ))}
            </div>
            <p className="mt-3 text-[12px] text-mist">Colour availability is not checked live in this demonstration.</p>
          </fieldset>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button type="button" onClick={() => open(`Tell me more about the ${p.name}`)} className="btn-gold">
              <Sparkles className="h-4 w-4" aria-hidden /> Ask AUREVÉ about this piece
            </button>
            <Link to={`/contact?product=${p.slug}`} className="btn-outline">
              Enquire about this piece <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <CompareButton id={p.id} name={p.name} />
          </div>

          <p className="mt-6 text-[12px] leading-relaxed text-mist">
            Fictional demo inventory. This is an illustrative product, so no real stock, delivery, or sale is available.
          </p>
        </div>
      </div>

      <div className="mt-20 grid gap-6 md:grid-cols-2">
        <Reveal>
          <Section title="About this piece">
            <p>{p.description}</p>
          </Section>
        </Reveal>
        <Reveal delay={80}>
          <Section title="Specifications">
            <dl className="divide-y divide-gold/10">
              {p.specs.map((s) => (
                <div key={s.label} className="grid grid-cols-[9.5rem_1fr] gap-4 py-3">
                  <dt className="text-[13px] text-mist">{s.label}</dt>
                  <dd className="text-ivory/90">{s.value}</dd>
                </div>
              ))}
              <div className="grid grid-cols-[9.5rem_1fr] gap-4 py-3">
                <dt className="text-[13px] text-mist">Dimensions</dt>
                <dd className="text-ivory/90">{p.dimensions}</dd>
              </div>
            </dl>
          </Section>
        </Reveal>
        <Reveal>
          <Section title="Materials & gemstones">
            <ul className="list-disc space-y-2 pl-5">
              {p.materials.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
            <p className="mt-5 rounded-lg border border-gold/15 bg-noir/50 px-4 py-3 text-[14px] text-ivory/85">
              {certificateSummary(p)}
            </p>
          </Section>
        </Reveal>
        <Reveal delay={80}>
          <Section title="Care instructions">
            <ul className="list-disc space-y-2 pl-5">
              {p.care.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </Section>
        </Reveal>
        <Reveal className="md:col-span-2">
          <Section title="Delivery & returns">
            <p>{POLICIES.delivery}</p>
            <p className="mt-3">{POLICIES.returns}</p>
            <p className="mt-3 text-mist">Stock for this piece: {p.stock} (demo data). {p.stockNote}</p>
          </Section>
        </Reveal>
      </div>

      {pairs.length > 0 && (
        <section className="mt-24" aria-labelledby="pairs-title">
          <Reveal>
            <p className="eyebrow">Completes the look</p>
            <h2 id="pairs-title" className="mt-4 text-4xl md:text-5xl">Pairs well with</h2>
          </Reveal>
          <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {pairs.map((pair) => (
              <ProductCard key={pair.id} product={pair} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

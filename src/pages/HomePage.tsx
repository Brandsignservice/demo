import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { ARXEN_AI_URL, BRAND, DEMO_SCENARIOS } from "../data/brand";
import { productById, productBySlug } from "../data/products";
import { useChat } from "../context/ChatContext";
import ProductCard from "../components/ProductCard";
import Reveal from "../components/Reveal";
import { formatMoney } from "../lib/format";

const featuredIds = ["gold-pendant-necklace", "classic-automatic-watch", "diamond-engagement-ring", "sapphire-ring"];

function Hero() {
  const { open } = useChat();
  return (
    <section className="relative isolate overflow-hidden" aria-labelledby="hero-title">
      <img
        src="/images/hero.webp"
        alt="A champagne-gold wristwatch beside a diamond pendant on black marble"
        width={1800}
        height={1100}
        className="absolute inset-0 -z-10 h-full w-full object-cover object-[65%_center] anim-drift"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-noir via-noir/80 to-noir/10" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-noir via-transparent to-noir/30" />

      <div className="mx-auto flex min-h-[calc(100svh-110px)] max-w-[1400px] flex-col justify-center px-5 pb-24 pt-20 lg:px-10">
        <p className="eyebrow anim-fade-up">{BRAND.tagline}</p>
        <h1 id="hero-title" className="anim-fade-up mt-6 max-w-4xl text-[54px] leading-[0.95] text-ivory sm:text-[80px] lg:text-[112px]" style={{ animationDelay: "120ms" }}>
          Find Your <em className="font-normal italic text-champagne">Perfect</em> Piece.
        </h1>
        <p className="anim-fade-up mt-7 max-w-xl text-[17px] leading-relaxed text-ivory/80 md:text-lg" style={{ animationDelay: "240ms" }}>
          {BRAND.heroSubtitle}
        </p>
        <div className="anim-fade-up mt-10 flex flex-col gap-3 sm:flex-row sm:items-center" style={{ animationDelay: "360ms" }}>
          <a href="#featured" className="btn-gold">
            Explore Collection <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
          <button type="button" onClick={() => open()} className="btn-outline">
            <Sparkles className="h-4 w-4 text-champagne" aria-hidden /> Find My Perfect Piece
          </button>
        </div>
        <p className="anim-fade-in mt-10 text-[12px] tracking-wide text-mist" style={{ animationDelay: "600ms" }}>
          Demonstration · Fictional brand · Illustrative prices in US dollars
        </p>
      </div>
    </section>
  );
}

function Scenarios() {
  const { open } = useChat();
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-24 lg:px-10" aria-labelledby="scenarios-title">
      <Reveal>
        <p className="eyebrow">Live demonstration</p>
        <h2 id="scenarios-title" className="mt-4 max-w-2xl text-4xl md:text-5xl">Start a conversation in one click.</h2>
        <p className="mt-4 max-w-xl text-mist">Each scenario opens the AUREVÉ AI assistant with a real shopping question and shows how it responds.</p>
      </Reveal>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {DEMO_SCENARIOS.map((s, i) => (
          <Reveal key={s.id} delay={i * 90}>
            <button
              type="button"
              onClick={() => open(s.prompt)}
              className="group flex h-full w-full flex-col rounded-2xl border border-gold/15 bg-onyx p-6 text-left transition duration-500 ease-luxe hover:-translate-y-1 hover:border-champagne/50 hover:shadow-[0_24px_60px_-30px_rgba(201,169,106,0.35)]"
            >
              <span className="font-display text-sm text-gold">0{i + 1}</span>
              <h3 className="mt-3 text-2xl leading-tight">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-mist">{s.blurb}</p>
              <p className="mt-6 rounded-xl border border-gold/10 bg-noir/60 px-4 py-3 font-display text-[17px] italic leading-snug text-champagne/90">
                “{s.prompt}”
              </p>
              <span className="mt-auto inline-flex items-center gap-2 pt-6 text-[12px] font-semibold uppercase tracking-[0.14em] text-ivory transition group-hover:text-champagne">
                <MessageCircle className="h-4 w-4" aria-hidden /> Start conversation
              </span>
            </button>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Featured() {
  const items = featuredIds.map((id) => productById(id)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  return (
    <section id="featured" className="scroll-mt-24 border-t border-gold/10 bg-onyx/60 py-24" aria-labelledby="featured-title">
      <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">The Edit</p>
            <h2 id="featured-title" className="mt-4 text-4xl md:text-5xl">Selected pieces</h2>
          </div>
          <Link to="/jewellery" className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-champagne hover:underline underline-offset-4">
            View the full collection <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Reveal>
        <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((p, i) => (
            <Reveal key={p.id} delay={i * 80}>
              <ProductCard product={p} priority={i === 0} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Categories() {
  const tiles = [
    { to: "/jewellery", title: "Jewellery", note: "Necklaces, earrings, bracelets", slug: "gold-pendant-necklace" },
    { to: "/watches", title: "Watches", note: "Automatic, chronograph, dress", slug: "classic-automatic-watch" },
    { to: "/engagement-rings", title: "Engagement Rings", note: "Solitaires, sapphires, bands", slug: "diamond-engagement-ring" },
    { to: "/gifts", title: "Gifts", note: "By occasion and budget", slug: "gift-necklace-set" },
  ];
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-24 lg:px-10" aria-labelledby="categories-title">
      <Reveal>
        <p className="eyebrow">Shop by category</p>
        <h2 id="categories-title" className="mt-4 text-4xl md:text-5xl">Find your starting point</h2>
      </Reveal>
      <div className="mt-12 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
        {tiles.map((t, i) => {
          const p = productBySlug(t.slug);
          return (
            <Reveal key={t.to} delay={i * 80}>
              <Link to={t.to} className="group relative block aspect-[3/4] overflow-hidden rounded-2xl bg-graphite">
                {p && (
                  <img
                    src={p.image}
                    alt=""
                    width={900}
                    height={900}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover transition duration-[1.4s] ease-luxe group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
                  <p className="font-display text-2xl leading-tight md:text-3xl">{t.title}</p>
                  <p className="mt-1.5 text-[13px] text-ivory/70">{t.note}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-champagne">
                    Explore <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" aria-hidden />
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function AssistantPreview() {
  const { open } = useChat();
  const card = productById("minimalist-dress-watch");

  return (
    <section className="bg-ivory text-noir" aria-labelledby="assistant-title">
      <div className="mx-auto grid max-w-[1400px] items-center gap-14 px-5 py-24 lg:grid-cols-2 lg:gap-20 lg:px-10">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-deep">The AUREVÉ AI assistant</p>
          <h2 id="assistant-title" className="mt-4 text-4xl md:text-5xl">Guidance that feels like a private appointment.</h2>
          <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-noir/70">
            Customers describe what they need in their own words. The assistant narrows the choice, explains why each piece suits them, and hands over to a human advisor the moment they ask.
          </p>
          <ul className="mt-8 space-y-4 text-[15px] text-noir/85">
            {[
              "Understands budget, style, occasion, and recipient",
              "Recommends real catalogue pieces, with reasons",
              "Compares products, explains materials and care",
              "Answers delivery and returns questions from policy",
              "Captures qualified enquiries for your sales team",
            ].map((line) => (
              <li key={line} className="flex gap-3">
                <span className="mt-2.5 h-px w-4 shrink-0 bg-gold-deep" aria-hidden />
                {line}
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => open("I need an elegant watch under $1,500 as a gift.")} className="btn-ink mt-10">
            <Sparkles className="h-4 w-4 text-champagne" aria-hidden /> Try this conversation
          </button>
        </Reveal>

        <Reveal delay={150}>
          <div className="relative mx-auto w-full max-w-md rounded-[28px] bg-noir p-5 text-ivory shadow-[0_40px_90px_-30px_rgba(0,0,0,0.6)] sm:p-6">
            <div className="mb-5 flex items-center justify-between border-b border-gold/15 pb-4">
              <p className="font-display text-xl">AUREVÉ AI</p>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mist">Preview</span>
            </div>
            <div className="space-y-4 text-[14px]">
              <p className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-champagne px-4 py-3 text-noir">
                I need an elegant watch under $1,500 as a gift.
              </p>
              <div className="flex gap-3">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/40 font-display text-[12px] text-champagne">A</span>
                <div className="min-w-0 flex-1 space-y-3">
                  <p className="rounded-2xl rounded-tl-md bg-graphite px-4 py-3 leading-relaxed text-ivory/90">
                    Here are 3 watches under $1,500 as a gift with an elegant feel. Their taste: classic, minimalist, or bold?
                  </p>
                  {card && (
                    <div className="flex gap-3 rounded-xl border border-gold/15 bg-onyx p-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-graphite">
                        <img src={card.image} alt="" width={900} height={900} loading="lazy" className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-display text-[17px] leading-tight">{card.name}</p>
                          <p className="shrink-0 font-semibold text-champagne">{formatMoney(card.price)}</p>
                        </div>
                        <p className="mt-1 text-[12px] leading-relaxed text-mist">An ultra-slim case and ivory dial with an understated, minimalist look. At $750 it sits within your $1,500 budget.</p>
                      </div>
                    </div>
                  )}
                  <p className="text-[12px] text-mist">Tap a suggestion or type your own question.</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ArxenSection() {
  const pillars = [
    ["Discover", "Customers find the right piece from their own words, budget, and occasion."],
    ["Get answers", "Instant, accurate answers on materials, care, delivery, and returns."],
    ["Connect", "Qualified enquiries reach your sales team, with the product of interest attached."],
  ];
  return (
    <section className="relative overflow-hidden border-t border-gold/15 bg-noir py-28" aria-labelledby="arxen-title">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(900px,90%)] -translate-x-1/2 gold-rule" aria-hidden />
      <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">ARXEN AI</p>
          <h2 id="arxen-title" className="mt-5 text-4xl md:text-6xl">A Better Shopping Experience for Your Customers.</h2>
          <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-ivory/75">
            ARXEN AI builds custom AI Shopping Assistants that help ecommerce customers discover products, get instant answers, compare options, and connect with your sales team.
          </p>
          <Link to={ARXEN_AI_URL} className="btn-gold mt-10">
            Explore AI Solutions <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Reveal>
        <div className="mx-auto mt-20 grid max-w-5xl gap-px overflow-hidden rounded-2xl border border-gold/15 bg-gold/15 md:grid-cols-3">
          {pillars.map(([title, text], i) => (
            <Reveal key={title} delay={i * 100} className="bg-onyx p-8">
              <p className="font-display text-sm text-gold">0{i + 1}</p>
              <h3 className="mt-3 text-2xl">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-mist">{text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Scenarios />
      <Featured />
      <Categories />
      <AssistantPreview />
      <ArxenSection />
    </>
  );
}

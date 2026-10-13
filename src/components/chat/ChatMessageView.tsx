import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { productById } from "../../data/products";
import { useChat, type ChatMessage } from "../../context/ChatContext";
import CompareTable from "../CompareTable";
import CompareButton from "../CompareButton";
import LeadForm from "../LeadForm";
import ProductImage from "../ProductImage";
import { formatMoney } from "../../lib/format";
import type { Chip } from "../../lib/assistant";

export default function ChatMessageView({ message, onClose }: { message: ChatMessage; onClose: () => void }) {
  const { send, typing } = useChat();

  if (message.role === "user") {
    return (
      <div className="flex justify-end anim-fade-up">
        <p className="max-w-[85%] rounded-2xl rounded-br-md bg-champagne px-4 py-3 text-[14px] leading-relaxed text-noir">
          {message.text}
        </p>
      </div>
    );
  }

  const { reply } = message;
  const cards = reply.products ?? [];
  const compareProducts = (reply.comparison ?? []).map((id) => productById(id)).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="flex gap-3 anim-fade-up">
      <div aria-hidden className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold/40 font-display text-[13px] text-champagne">
        A
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        <div className="space-y-2 rounded-2xl rounded-tl-md border border-gold/10 bg-graphite px-4 py-3.5 text-[14px] leading-relaxed text-ivory/90">
          {reply.text.map((para, i) => (
            <p key={i} className="whitespace-pre-line">{para}</p>
          ))}
        </div>

        {cards.length > 0 && !reply.comparison && (
          <ul className="space-y-2.5" aria-label="Recommended products">
            {cards.map(({ id, reason }) => {
              const p = productById(id);
              if (!p) return null;
              return (
                <li key={id} className="flex gap-3 rounded-xl border border-gold/15 bg-noir/60 p-3">
                  <Link
                    to={`/product/${p.slug}`}
                    onClick={onClose}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-graphite"
                    aria-label={`View ${p.name}`}
                  >
                    <ProductImage src={p.image} alt={p.imageAlt} label={p.name} sizes="80px" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-display text-[17px] leading-tight text-ivory">{p.name}</p>
                      <p className="shrink-0 text-sm font-semibold text-champagne">{formatMoney(p.price)}</p>
                    </div>
                    {reason && <p className="mt-1 line-clamp-3 text-[12px] leading-relaxed text-mist">{reason}</p>}
                    <div className="mt-auto flex flex-wrap items-center gap-2 pt-2.5">
                      <Link
                        to={`/product/${p.slug}`}
                        onClick={onClose}
                        className="inline-flex items-center gap-1.5 rounded-full bg-champagne px-3 py-1.5 text-[11px] font-semibold text-noir transition hover:bg-ivory"
                      >
                        View Product <ArrowRight className="h-3 w-3" aria-hidden />
                      </Link>
                      <CompareButton id={p.id} name={p.name} compact />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {reply.comparison && compareProducts.length > 1 && (
          <div className="space-y-2.5">
            <CompareTable products={compareProducts} variant="chat" />
            <Link
              to={`/compare?ids=${compareProducts.map((p) => p.id).join(",")}`}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-champagne hover:underline underline-offset-4"
            >
              Open full comparison <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        )}

        {cards.length > 0 && reply.comparison && (
          <p className="text-[12px] text-mist">Add these pieces to the comparison tray with the cards above, or open the full comparison.</p>
        )}

        {reply.leadForm && (
          <div className="rounded-2xl border border-gold/20 bg-noir/60 p-4">
            <LeadForm compact defaultProductId={cards[0]?.id ?? ""} />
          </div>
        )}

        {reply.note && <p className="text-[11px] italic text-mist">{reply.note}</p>}

        {reply.chips && reply.chips.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1" role="group" aria-label="Suggested replies">
            {reply.chips.map((c: Chip) => (
              <button key={c.label} type="button" className="chip" disabled={typing} onClick={() => send(c.prompt)}>
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { RotateCcw, Send, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useChat } from "../../context/ChatContext";
import { useCompare } from "../../context/CompareContext";
import ChatMessageView from "./ChatMessageView";

export default function ChatWidget() {
  const { isOpen, open, close, messages, typing, send, reset } = useChat();
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { ids: compareIds } = useCompare();

  // Keep the latest message in view.
  useEffect(() => {
    if (!isOpen) return;
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typing, isOpen]);

  // Focus the input when the panel opens.
  useEffect(() => {
    if (isOpen) {
      const t = window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 350);
      return () => window.clearTimeout(t);
    }
  }, [isOpen]);

  // Close the panel on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || typing) return;
    send(draft);
    setDraft("");
  };

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => open()}
          aria-haspopup="dialog"
          className={`fixed right-5 z-50 inline-flex items-center gap-2.5 rounded-full border border-champagne/40 bg-noir/90 py-3.5 pl-4 pr-5 text-[13px] font-semibold tracking-wide text-champagne shadow-[0_18px_50px_-14px_rgba(0,0,0,0.9)] backdrop-blur-xl transition duration-500 ease-luxe hover:-translate-y-0.5 hover:border-champagne hover:text-ivory md:bottom-8 md:right-8 anim-fade-up ${
            compareIds.length > 0 ? "bottom-[92px]" : "bottom-5"
          }`}
        >
          <span className="anim-halo absolute inset-0 rounded-full" aria-hidden />
          <span className="relative">✦ Ask AUREVÉ AI</span>
        </button>
      )}

      {isOpen && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="AUREVÉ AI Shopping Assistant"
          className="fixed inset-x-0 bottom-0 z-50 flex h-[92svh] flex-col overflow-hidden rounded-t-[22px] border border-gold/20 bg-onyx shadow-[0_-30px_80px_-20px_rgba(0,0,0,0.9)] anim-panel md:inset-auto md:bottom-8 md:right-8 md:h-[min(720px,calc(100vh-4rem))] md:w-[440px] md:rounded-[20px]"
        >
          <header className="flex items-center justify-between gap-3 border-b border-gold/15 bg-noir/60 px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-champagne to-gold-deep text-noir">
                <Sparkles className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="font-display text-xl leading-none text-ivory">AUREVÉ AI</p>
                <p className="mt-1 truncate text-[11px] text-mist">Shopping assistant · Demonstration</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={reset}
                className="rounded-full p-2 text-mist transition hover:bg-white/5 hover:text-ivory"
                aria-label="Start a new conversation"
                title="Start over"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={close}
                className="rounded-full p-2 text-mist transition hover:bg-white/5 hover:text-ivory"
                aria-label="Close assistant"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div className="scrollbar-thin flex-1 space-y-5 overflow-y-auto px-5 py-6" aria-live="polite" aria-relevant="additions">
            {messages.map((m) => (
              <ChatMessageView key={m.id} message={m} onClose={close} />
            ))}
            {typing && (
              <div className="flex items-center gap-3 anim-fade-in" aria-label="AUREVÉ AI is typing">
                <div aria-hidden className="flex h-7 w-7 items-center justify-center rounded-full border border-gold/40 font-display text-[13px] text-champagne">A</div>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md bg-graphite px-4 py-3.5">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={submit} className="border-t border-gold/15 bg-noir/70 p-4">
            <div className="flex items-center gap-2 rounded-full border border-gold/25 bg-noir py-1.5 pl-5 pr-1.5 focus-within:border-champagne">
              <label htmlFor="chat-input" className="sr-only">Ask about style, budget, occasion, or a piece</label>
              <input
                id="chat-input"
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask about style, budget, or a piece…"
                maxLength={300}
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent py-2 text-[14px] text-ivory placeholder:text-mist/70 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!draft.trim() || typing}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-champagne text-noir transition hover:bg-ivory disabled:opacity-40"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2.5 text-center text-[10.5px] leading-snug text-mist/80">
              Demonstration assistant: answers come from the fictional AUREVÉ demo catalogue. No live AI service, orders, or sales contact.
            </p>
          </form>
        </div>
      )}
    </>
  );
}

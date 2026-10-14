import { Link } from "react-router-dom";
import { BRAND, NAV_LINKS } from "../data/brand";
import { useChat } from "../context/ChatContext";
import Logo from "./Logo";

export default function Footer() {
  const { open } = useChat();
  return (
    <footer className="border-t border-gold/15 bg-onyx">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-16 md:grid-cols-2 lg:grid-cols-4 lg:px-10">
        <div>
          <Logo />
          <p className="mt-6 max-w-xs font-display text-xl italic text-champagne/90">“{BRAND.tagline}”</p>
        </div>

        <div>
          <h2 className="eyebrow mb-5">Explore</h2>
          <ul className="space-y-3 text-sm text-ivory/80">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="transition hover:text-champagne">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="eyebrow mb-5">Assistance</h2>
          <ul className="space-y-3 text-sm text-ivory/80">
            <li>
              <button type="button" onClick={() => open()} className="text-left transition hover:text-champagne">
                ✦ Ask AUREVÉ AI
              </button>
            </li>
            <li>
              <button type="button" onClick={() => open("Tell me about delivery and returns")} className="text-left transition hover:text-champagne">
                Delivery &amp; Returns
              </button>
            </li>
            <li>
              <Link to="/contact" className="transition hover:text-champagne">
                Speak to an advisor (demo)
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="eyebrow mb-5">About this demo</h2>
          <p className="text-sm leading-relaxed text-mist">
            A demonstration of an AI Shopping Assistant for luxury retail, designed and built by ARXEN AI. No orders, payments, or enquiries are processed.
          </p>
        </div>
      </div>

      <div className="border-t border-gold/10">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-5 py-6 text-[12px] leading-relaxed text-mist md:flex-row md:items-center md:justify-between lg:px-10">
          <p className="max-w-3xl">{BRAND.footerNotice}</p>
          <p className="shrink-0">© 2026 AUREVÉ · Demonstration</p>
        </div>
      </div>
    </footer>
  );
}

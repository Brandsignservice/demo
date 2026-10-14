import { GitCompareArrows, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { BRAND, NAV_LINKS } from "../data/brand";
import { useCompare } from "../context/CompareContext";
import Logo from "./Logo";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { ids } = useCompare();
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <div className="bg-champagne/95 px-4 py-2 text-center text-[11px] font-medium tracking-wide text-noir">
        {BRAND.demoBanner}
      </div>

      <header
        className={`sticky top-0 z-40 border-b transition duration-500 ${
          scrolled ? "border-gold/15 bg-noir/90 backdrop-blur-xl" : "border-transparent bg-noir/60 backdrop-blur-sm"
        }`}
      >
        <div className="mx-auto flex h-[76px] max-w-[1400px] items-center justify-between gap-6 px-5 lg:px-10">
          <button
            type="button"
            className="-ml-2 rounded-full p-2 text-ivory lg:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <Logo />

          <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `relative py-2 text-[13px] font-medium tracking-[0.08em] transition duration-300 after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-champagne after:transition after:duration-500 after:ease-luxe hover:text-champagne hover:after:scale-x-100 ${
                    isActive ? "text-champagne after:scale-x-100" : "text-ivory/85"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <NavLink
            to="/compare"
            className="relative -mr-2 inline-flex items-center gap-2 rounded-full p-2 text-ivory/85 transition hover:text-champagne"
            aria-label={`Compare pieces${ids.length ? `, ${ids.length} selected` : ""}`}
          >
            <GitCompareArrows className="h-5 w-5" aria-hidden />
            <span className="hidden text-[13px] font-medium sm:inline">Compare</span>
            {ids.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-champagne px-1 text-[10px] font-bold text-noir sm:static sm:h-auto sm:min-w-0 sm:bg-transparent sm:px-0 sm:text-[13px] sm:text-champagne">
                {ids.length}
              </span>
            )}
          </NavLink>
        </div>
      </header>

      {menuOpen && (
        <div id="mobile-nav" className="fixed inset-0 top-[104px] z-30 bg-noir/98 px-6 py-8 backdrop-blur-xl lg:hidden anim-fade-in">
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `border-b border-gold/10 py-4 font-display text-3xl ${isActive ? "text-champagne" : "text-ivory"}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <p className="mt-8 text-sm text-mist">Tap the ✦ Ask AUREVÉ AI button at any time to talk to the demo assistant.</p>
        </div>
      )}
    </>
  );
}

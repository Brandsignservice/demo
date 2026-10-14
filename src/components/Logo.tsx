import { Link } from "react-router-dom";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`group inline-flex flex-col leading-none ${className}`} aria-label="AUREVÉ home">
      <span className="font-display text-[26px] font-medium tracking-[0.32em] text-ivory transition group-hover:text-champagne md:text-[28px]">
        AUREVÉ
      </span>
      <span className="mt-1.5 hidden text-[9px] font-semibold uppercase tracking-[0.34em] text-gold/80 sm:block">
        Jewellery &amp; Watches
      </span>
    </Link>
  );
}

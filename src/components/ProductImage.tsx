import { useState } from "react";

interface Props {
  src: string;
  alt: string;
  label: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Product photograph with a graceful, on-brand fallback if an image is missing.
 * Images are WebP, lazy-loaded with explicit dimensions to avoid layout shift.
 */
export default function ProductImage({ src, alt, label, className = "", sizes = "(min-width: 1024px) 25vw, 50vw", priority = false }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`image-sheen flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-graphite via-onyx to-noir p-3 text-center sm:gap-3 sm:p-6 ${className}`}
      >
        <span aria-hidden className="font-display text-3xl leading-none text-gold/60 sm:text-5xl">A</span>
        <span className="font-display text-sm leading-tight text-champagne/80 sm:text-lg">{label}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={900}
      height={900}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
      className={`h-full w-full object-cover ${className}`}
    />
  );
}

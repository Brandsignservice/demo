export default function DemoLabel({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-champagne/25 bg-noir/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-champagne backdrop-blur ${className}`}
    >
      Fictional demo inventory
    </span>
  );
}

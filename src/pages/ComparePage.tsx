import { Sparkles } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import CompareTable from "../components/CompareTable";
import { useChat } from "../context/ChatContext";
import { useCompare, MAX_COMPARE } from "../context/CompareContext";
import { productById } from "../data/products";

export default function ComparePage() {
  const [params] = useSearchParams();
  const { ids, setIds, remove, clear } = useCompare();
  const { open } = useChat();
  const fromUrl = params.get("ids");

  // A shared link (?ids=a,b) sets the selection; otherwise the tray selection is shown.
  useEffect(() => {
    if (fromUrl !== null) {
      const next = fromUrl.split(",").filter((id) => productById(id)).slice(0, MAX_COMPARE);
      setIds(next);
    }
  }, [fromUrl, setIds]);

  const items = useMemo(() => ids.map((id) => productById(id)).filter((p): p is NonNullable<typeof p> => Boolean(p)), [ids]);

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-28 pt-10 lg:px-10 lg:pt-14">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Compare" }]} />

      <header className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="anim-fade-up">
          <p className="eyebrow">Compare</p>
          <h1 className="mt-4 text-5xl md:text-7xl">Side by side</h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-mist">
            Compare up to three pieces by price, materials, style, features, and care. Where a detail is not recorded in the demo data, it says so.
          </p>
        </div>
        {items.length > 0 && (
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => open(`Compare ${items.map((p) => p.name).join(" and ")}`)} className="btn-outline">
              <Sparkles className="h-4 w-4 text-champagne" aria-hidden /> Ask AUREVÉ about these
            </button>
            <button type="button" onClick={clear} className="btn-ink !bg-transparent !text-mist hover:!text-ivory">
              Clear
            </button>
          </div>
        )}
      </header>

      {items.length === 0 ? (
        <div className="mt-14 rounded-2xl border border-gold/15 bg-onyx p-10 text-center">
          <h2 className="text-3xl">Nothing to compare yet.</h2>
          <p className="mx-auto mt-3 max-w-md text-mist">Use the Compare button on any piece to add up to three. Your selection stays here while you browse.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/watches" className="btn-gold">Browse watches</Link>
            <button type="button" onClick={() => open("Compare products")} className="btn-outline">
              <Sparkles className="h-4 w-4 text-champagne" aria-hidden /> Ask AUREVÉ for a pair
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-12 space-y-6">
          {items.length === 1 && (
            <p className="rounded-xl border border-gold/15 bg-onyx px-5 py-4 text-sm text-mist">
              Add one more piece to see a comparison. <Link to="/watches" className="text-champagne underline-offset-4 hover:underline">Browse the collection</Link>.
            </p>
          )}
          <CompareTable products={items} onRemove={remove} />
        </div>
      )}
    </div>
  );
}

import { useSearchParams } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import LeadForm from "../components/LeadForm";
import { productBySlug } from "../data/products";

export default function ContactPage() {
  const [params] = useSearchParams();
  const product = productBySlug(params.get("product") ?? "");
  const arxen = params.get("enquiry") === "arxen";

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-28 pt-10 lg:px-10 lg:pt-14">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Contact" }]} />

      <div className="mt-8 grid gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
        <div className="anim-fade-up">
          <p className="eyebrow">Contact</p>
          <h1 className="mt-4 text-5xl md:text-7xl">Speak with an advisor.</h1>
          <p className="mt-6 max-w-lg text-[16px] leading-relaxed text-mist">
            In a live AUREVÉ store, this enquiry would reach a member of the client advisory team with the product of interest attached. This page demonstrates the enquiry flow only.
          </p>

          {arxen && (
            <p className="mt-8 rounded-xl border border-champagne/30 bg-champagne/[0.06] p-5 text-[15px] leading-relaxed text-ivory/90">
              You are viewing the demo enquiry for <strong className="text-champagne">ARXEN AI</strong>. Tell us about your ecommerce brand and we will follow up. This form is a demonstration and does not contact anyone.
            </p>
          )}

          <ul className="mt-10 space-y-4 text-[15px] text-ivory/80">
            <li className="flex gap-3"><span className="mt-2.5 h-px w-4 shrink-0 bg-gold" aria-hidden />Share your name, email, and product of interest.</li>
            <li className="flex gap-3"><span className="mt-2.5 h-px w-4 shrink-0 bg-gold" aria-hidden />Add an optional message about occasion, budget, or style.</li>
            <li className="flex gap-3"><span className="mt-2.5 h-px w-4 shrink-0 bg-gold" aria-hidden />Your details are not sent or stored in this demonstration.</li>
          </ul>
        </div>

        <div className="anim-fade-up" style={{ animationDelay: "120ms" }}>
          {product && (
            <p className="mb-4 text-sm text-mist">
              Enquiry about: <span className="text-champagne">{product.name}</span>
            </p>
          )}
          <LeadForm key={product?.id ?? "general"} defaultProductId={product?.id ?? ""} />
        </div>
      </div>
    </div>
  );
}

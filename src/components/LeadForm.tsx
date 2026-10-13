import { CheckCircle2 } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { products } from "../data/products";

interface Props {
  defaultProductId?: string;
  compact?: boolean;
}

interface Values {
  name: string;
  email: string;
  productId: string;
  message: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Demo enquiry form. It validates input and shows a confirmation, but nothing is
 * sent, stored, or routed to any sales team.
 */
export default function LeadForm({ defaultProductId = "", compact = false }: Props) {
  const uid = useId();
  const [values, setValues] = useState<Values>({ name: "", email: "", productId: defaultProductId, message: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [submitted, setSubmitted] = useState<Values | null>(null);

  const set = (k: keyof Values) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!values.name.trim()) next.name = "Please enter your name.";
    if (!EMAIL.test(values.email.trim())) next.email = "Please enter a valid email address.";
    if (values.message.length > 500) next.message = "Please keep your message under 500 characters.";
    setErrors(next);
    if (Object.keys(next).length === 0) setSubmitted({ ...values, name: values.name.trim(), email: values.email.trim() });
  };

  if (submitted) {
    const product = products.find((p) => p.id === submitted.productId);
    return (
      <div role="status" className="rounded-xl border border-champagne/30 bg-champagne/[0.06] p-5 anim-fade-up">
        <CheckCircle2 className="h-7 w-7 text-champagne" aria-hidden />
        <h3 className="mt-3 text-2xl text-ivory">Thank you, {submitted.name.split(" ")[0]}.</h3>
        <p className="mt-2 text-sm leading-relaxed text-ivory/85">
          This is a <strong className="font-semibold text-champagne">demonstration form</strong>. Your enquiry
          {product ? ` about the ${product.name}` : ""} has <strong className="font-semibold">not</strong> been sent to a
          sales team and has not been stored. In a live integration, this would create a qualified enquiry in your CRM.
        </p>
        <button
          type="button"
          className="mt-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-champagne underline-offset-4 hover:underline"
          onClick={() => {
            setSubmitted(null);
            setValues({ name: "", email: "", productId: defaultProductId, message: "" });
          }}
        >
          Start another demo enquiry
        </button>
      </div>
    );
  }

  const field = (id: string) => `${uid}-${id}`;

  return (
    <form onSubmit={submit} noValidate className={`space-y-4 ${compact ? "" : "rounded-2xl border border-gold/15 bg-onyx p-6 md:p-8"}`}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={field("name")} className="label">Name</label>
          <input id={field("name")} className="field" autoComplete="name" value={values.name} onChange={set("name")} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? field("name-err") : undefined} required />
          {errors.name && <p id={field("name-err")} className="mt-1.5 text-xs text-amber-200">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor={field("email")} className="label">Email</label>
          <input id={field("email")} type="email" className="field" autoComplete="email" value={values.email} onChange={set("email")} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? field("email-err") : undefined} required />
          {errors.email && <p id={field("email-err")} className="mt-1.5 text-xs text-amber-200">{errors.email}</p>}
        </div>
      </div>

      <div>
        <label htmlFor={field("product")} className="label">Product of interest</label>
        <select id={field("product")} className="field appearance-none" value={values.productId} onChange={set("productId")}>
          <option value="">General enquiry</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={field("message")} className="label">Message <span className="normal-case tracking-normal text-mist/70">(optional)</span></label>
        <textarea id={field("message")} rows={compact ? 3 : 4} className="field resize-none" value={values.message} onChange={set("message")} placeholder="For example: an anniversary gift for my wife, budget around $1,000." aria-invalid={Boolean(errors.message)} />
        {errors.message && <p className="mt-1.5 text-xs text-amber-200">{errors.message}</p>}
      </div>

      <p className="rounded-lg border border-gold/15 bg-noir/60 px-4 py-3 text-[12px] leading-relaxed text-mist">
        <strong className="font-semibold text-champagne">Demo form.</strong> Submitting does not contact a real sales team, and your details are not sent or stored.
      </p>

      <button type="submit" className="btn-gold w-full">Request advisor follow-up</button>
    </form>
  );
}

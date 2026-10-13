# AUREVÉ — AI Shopping Assistant demo

A premium, fictional luxury jewellery and watch website created by **ARXEN AI** to show UK luxury retailers how an AI Shopping Assistant can improve product discovery, answer customer questions, and capture qualified enquiries.

> AUREVÉ is a fictional demonstration brand created by ARXEN AI. All products, prices, and specifications are illustrative.

## Run it

```sh
npm install
npm run dev        # http://localhost:5173 (bound to 0.0.0.0)
npm run build      # type-checks, then produces a static site in dist/
npm run preview    # serves the production build
```

Stack: React 18, TypeScript, Vite, Tailwind CSS v4, React Router, lucide-react.

## What the demo shows

- **Home:** hero with *Find Your Perfect Piece.*, four one-click assistant scenarios, a curated edit, category tiles, an assistant preview, and the ARXEN AI section.
- **Catalogue:** 12 fictional products across Jewellery, Watches, Engagement Rings, and a curated Gifts view. Each product has a detail page with price, materials, dimensions, colours, stock status (demo data), specifications, gemstone certificate status, care instructions, delivery and returns, and matching pieces.
- **Filters:** budget, style, and occasion filters plus sorting on every collection page.
- **Comparison:** add up to three pieces from any card, then compare price, materials, style, dimensions, specifications, and care on `/compare`. Shared links work as `/compare?ids=a,b`.
- **AI Shopping Assistant:** the floating **✦ Ask AUREVÉ AI** button opens a conversation with quick actions, product cards with *View Product* links, budget and occasion follow-ups, comparisons, matching suggestions, care and material answers, delivery and returns, and a human-advisor enquiry form.
- **Enquiry form:** validated on the home assistant and on `/contact`. It is a **demonstration form**: it does not contact a sales team and does not store or send data.

## How the assistant works

The assistant runs entirely in the browser with **no external AI API**.

- `src/lib/assistant.ts` is a deterministic conversation engine. It extracts category, budget (for example `under $1,500`, `between $500 and $1,000`, `1.5k`), style, occasion, recipient, and materials, and product names from free text. It then scores and ranks products from the catalogue and gives a reason for each recommendation.
- It answers only from `src/data/products.ts`. Where a detail is not recorded, it says so. For example, the gemstone certificate is stated as "Not provided in this demo record" rather than invented.
- Conversation state carries follow-ups, such as a budget given after "Help me choose an anniversary gift", or "Classic" after a gift search.

To extend the logic, add intents or phrases in `respond()` and add product records in `src/data/products.ts`.

## Connecting a live AI service (optional, not configured)

No key is included, requested, or read by the frontend. If you later connect a model, call it from a **server-side function** (for example a serverless route) that reads the key from a server environment variable. Never place keys in `VITE_*` variables or in browser code. Keep the local engine as the fallback so the demo works offline.

## Structure

```
src/
  data/        products.ts (12 fictional products), types.ts, brand.ts (copy, nav, scenarios, policies)
  lib/         assistant.ts (conversation engine), compare.ts, filters.ts, format.ts
  context/     CompareContext.tsx (comparison tray), ChatContext.tsx (assistant conversation)
  components/  Header, Footer, ProductCard, ProductImage, CompareTray, CompareTable,
               LeadForm, FilterBar, StockPill, DemoLabel, Reveal, chat/ChatWidget, chat/ChatMessageView
  pages/       Home, Collection (jewellery, watches, engagement-rings, gifts), Product, Compare, Contact, NotFound
public/images/ hero.webp and products/*.webp (AI-generated studio imagery for fictional products)
```

## Imagery

All product and hero photographs are original, AI-generated studio images created for this fictional brand. They are not photographs of real products. Images are WebP, lazy-loaded, and sized to avoid layout shift. If an image is missing, the card shows an on-brand placeholder.

## Limitations

- Stock status, delivery, and returns are illustrative demo data. No orders, payments, or live inventory exist.
- Prices are shown in US dollars, as specified for this demo.
- Fonts (Cormorant Garamond and Manrope) load from Google Fonts. The system serif is used as a fallback offline.
- Favourites, the comparison selection, and the chat conversation reset on refresh.
- The "Explore AI Solutions" button points to the contact page with `?enquiry=arxen`. Replace `ARXEN_AI_URL` in `src/data/brand.ts` with ARXEN AI's live URL.

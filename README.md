# LUMORA HOME

A responsive, fictional luxury furniture sales demonstration for ARXEN AI, built with React and Vite.

## Run

```sh
npm install
npm run dev
```

The preview runs on port 5173. `npm run build` produces the deployable static site in `dist/`; `npm run preview` serves the production build.

## Demo features

- 12 fictional catalog products with descriptions, prices, materials, sizes, finishes, and delivery/return details.
- Category navigation, text search, sorting, favorites, product details, finish selection, and a quantity-adjustable shopping bag.
- Local, deterministic shopping assistant: budget and category filtering, compact-room recommendations, room dimensions (e.g. `10 x 12 feet`), product comparisons, matching accessories, product questions, delivery and returns.
- Four one-click conversation starters and conversation reset.
- Validated designer enquiry form with consent. Enquiries are stored only in `sessionStorage` under `lumora-demo-enquiry`. No emails, CRM requests, payments, or real orders occur.
- Responsive layouts, keyboard controls, accessible control names, and reduced-motion support.

## AI and security

No external AI API is required or configured. The assistant intentionally demonstrates common shopping flows rather than pretending to be an unrestricted language model. No API keys are included or requested. Any future AI integration must use a server-side endpoint with secrets in server environment variables, never `VITE_*` variables or browser source. `.env` files are ignored by Git.

## Assets and limitations

Furniture and lifestyle imagery are illustrative remote Unsplash photographs, not exact depictions of the fictional products. Google Fonts supplies DM Sans and Manrope, with system sans-serif fallbacks. These assets need an internet connection. The local assistant itself does not need network access. Favorites and the demo bag are kept in React state and reset on refresh; enquiry data lasts only for the current browser session.

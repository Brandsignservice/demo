export const BRAND = {
  name: "AUREVÉ",
  tagline: "Discover the pieces that define you.",
  heroHeadline: "Find Your Perfect Piece.",
  heroSubtitle:
    "Discover jewellery and watches selected around your style, budget, and occasion.",
  footerNotice:
    "AUREVÉ is a fictional demonstration brand created by ARXEN AI. All products, prices, and specifications are illustrative.",
  demoBanner:
    "Demonstration only · AUREVÉ is a fictional brand · All inventory, prices and policies are illustrative",
  currency: "USD",
};

/** Where the "Explore AI Solutions" button points. Replace with ARXEN AI's live URL when available. */
export const ARXEN_AI_URL = "/contact?enquiry=arxen";

export const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Jewellery", to: "/jewellery" },
  { label: "Watches", to: "/watches" },
  { label: "Engagement Rings", to: "/engagement-rings" },
  { label: "Gifts", to: "/gifts" },
  { label: "Contact", to: "/contact" },
] as const;

export const WELCOME_MESSAGE =
  "Welcome to AUREVÉ. I can help you discover jewellery and watches based on your style, budget, and occasion. What are you looking for?";

export const QUICK_ACTIONS = [
  { label: "Find Jewellery", prompt: "Find jewellery for me" },
  { label: "Find a Watch", prompt: "Find a watch for me" },
  { label: "Shop by Budget", prompt: "Shop by budget" },
  { label: "Find a Gift", prompt: "Help me find a gift" },
  { label: "Compare Products", prompt: "Compare products" },
  { label: "Delivery & Returns", prompt: "Tell me about delivery and returns" },
] as const;

export const DEMO_SCENARIOS = [
  {
    id: "luxury-watch",
    title: "Luxury watch under budget",
    prompt: "Find a luxury watch under $1,500.",
    blurb: "Filter by budget and style, then see why each watch fits.",
  },
  {
    id: "anniversary-gift",
    title: "Anniversary gift",
    prompt: "Help me choose an anniversary gift.",
    blurb: "A short guided conversation that narrows budget and recipient.",
  },
  {
    id: "compare-watches",
    title: "Compare two watches",
    prompt: "Compare these two watches.",
    blurb: "Pick two pieces and see price, materials and care side by side.",
  },
  {
    id: "engagement-ring",
    title: "Engagement ring in budget",
    prompt: "I need an engagement ring within my budget.",
    blurb: "Ask for a budget, then match rings and bands to it.",
  },
] as const;

export const POLICIES = {
  delivery:
    "Demo policy: insured delivery is complimentary across the UK. Delivery dates shown in this demo are illustrative and are not guaranteed.",
  returns:
    "Demo policy: unworn items in original packaging may be returned within 30 days for a refund or exchange. This is an illustrative policy for the demonstration.",
  care:
    "Care guidance is product-specific. Each piece lists its own care instructions, and any detail not recorded for a piece is shown as not recorded.",
  contact:
    "This demo cannot place orders or contact a real sales team. To speak with a human advisor, use the enquiry form and it will be shown as a demonstration only.",
};

export const BUDGET_PRESETS = [
  { label: "Under $500", prompt: "Under $500" },
  { label: "$500 – $1,000", prompt: "Between $500 and $1,000" },
  { label: "$1,000 – $2,000", prompt: "Between $1,000 and $2,000" },
  { label: "Over $2,000", prompt: "Over $2,000" },
] as const;

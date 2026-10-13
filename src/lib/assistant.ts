/*
 * AUREVÉ AI Shopping Assistant — local, deterministic conversation engine.
 *
 * No external AI API is called. The engine reads the customer's message, extracts
 * shopping criteria (category, budget, style, occasion, recipient, materials) and
 * answers only from the fictional demo catalogue in ../data/products.ts. Where a
 * detail is not recorded, it says so rather than inventing an answer.
 */
import { BUDGET_PRESETS, POLICIES, QUICK_ACTIONS } from "../data/brand";
import { products, productById } from "../data/products";
import type { Occasion, Product, Style } from "../data/types";
import { formatMoney } from "./format";
import { certificateSummary } from "./compare";

export interface Chip {
  label: string;
  prompt: string;
}

export interface Budget {
  min?: number;
  max?: number;
}

export interface Query {
  kinds: string[];
  category?: "jewellery" | "watches";
  budget: Budget;
  styles: Style[];
  occasion?: Occasion;
  gift: boolean;
  recipient?: string;
  materials: string[];
  wantsBudget: boolean;
}

export interface ConversationState {
  lastProductId?: string;
  lastQuery?: Query;
  awaiting?: "budget" | "occasion";
  pending?: Query;
  /** Product ids currently selected for comparison (mirrors the page-level tray). */
  compareIds?: string[];
}

export interface AssistantReply {
  text: string[];
  products?: { id: string; reason?: string }[];
  comparison?: string[];
  chips?: Chip[];
  leadForm?: boolean;
  note?: string;
}

export interface Turn {
  reply: AssistantReply;
  state: ConversationState;
}

/* ----------------------------------------------------------------------------
 * Text helpers
 * -------------------------------------------------------------------------- */

const norm = (s: string): string =>
  s.toLowerCase().replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ").trim();

const hasBudget = (b: Budget): boolean => b.min !== undefined || b.max !== undefined;

const article = (word: string): string => (/^[aeiou]/i.test(word) ? "an" : "a");

const emptyQuery = (): Query => ({ kinds: [], budget: {}, styles: [], gift: false, materials: [], wantsBudget: false });

/** Parses amounts such as "$1,500", "1.5k", "under 600", "between $500 and $1,000". */
export function parseBudget(t: string): Budget {
  const nums = [...t.matchAll(/([$£])?\s*(\d[\d,]*(?:\.\d+)?)\s*(k\b)?/gi)]
    .map((m) => ({
      value: Number(m[2].replace(/,/g, "")) * (m[3] ? 1000 : 1),
      cur: Boolean(m[1]),
      idx: m.index ?? 0,
      end: (m.index ?? 0) + m[0].length,
    }))
    .filter((n) => n.cur || n.value >= 50);
  if (nums.length === 0) return {};

  if (nums.length >= 2) {
    const gap = t.slice(nums[0].end, nums[1].idx);
    if (/^\s*(and|to|-|–)\s*$|between|^\s*(and|to|-|–)\s/.test(gap) || /between/.test(t.slice(Math.max(0, nums[0].idx - 12), nums[0].idx))) {
      const [a, b] = [nums[0].value, nums[1].value].sort((x, y) => x - y);
      return { min: a, max: b };
    }
  }

  const n = nums[0];
  const before = t.slice(Math.max(0, n.idx - 22), n.idx);
  if (/(over|above|more than|at least|from|minimum|upwards of|starting at|no less than)\s*$/.test(before)) {
    return { min: n.value };
  }
  if (/(under|below|less than|up to|max(imum)?|within|no more than|not more than|cheaper than|at most|budget(?: of| is)?|spend(?: up to)?|around|about|roughly|approximately|less)\s*$/.test(before)) {
    return { max: n.value };
  }
  if (/budget|afford|spend/.test(t)) return { max: n.value };
  return {};
}

const STYLE_RULES: [RegExp, Style][] = [
  [/elegan|timeless|refined|sophisticat|classy/, "Elegant"],
  [/classic|traditional/, "Classic"],
  [/minimal|understated|simple|subtle|slim/, "Minimalist"],
  [/modern|contemporary|sleek/, "Modern"],
  [/\bbold\b|statement|striking|sporty|\bsport\b|dramatic|eye-catching/, "Bold"],
  [/delicate|dainty|petite/, "Delicate"],
  [/luxury|luxurious|premium|high-?end|opulent/, "Luxury"],
];

const RELATED: Record<Style, Style[]> = {
  Elegant: ["Classic", "Luxury", "Delicate"],
  Classic: ["Elegant", "Luxury"],
  Minimalist: ["Modern", "Delicate", "Classic"],
  Modern: ["Minimalist", "Bold"],
  Bold: ["Modern", "Luxury"],
  Delicate: ["Elegant", "Minimalist"],
  Luxury: ["Elegant", "Classic", "Bold"],
};

const RECIPIENTS: [RegExp, string][] = [
  [/\bwife\b/, "your wife"],
  [/husband/, "your husband"],
  [/girlfriend/, "your girlfriend"],
  [/boyfriend/, "your boyfriend"],
  [/fianc/, "your fiancée"],
  [/\bpartner\b|spouse|significant other/, "your partner"],
  [/\bmum\b|\bmom\b|\bmother\b/, "your mum"],
  [/\bdad\b|\bfather\b/, "your dad"],
  [/daughter/, "your daughter"],
  [/\bson\b/, "your son"],
  [/sister/, "your sister"],
  [/brother/, "your brother"],
  [/\bfriend\b/, "your friend"],
  [/colleague|\bboss\b|manager/, "your colleague"],
];

const MATERIAL_WORDS = ["gold", "platinum", "silver", "steel", "diamond", "pearl", "sapphire"];

/** Pulls every shopping criterion out of a message. */
export function parseQuery(t: string): Query {
  const q = emptyQuery();

  if (/\bwatch(es)?\b|wristwatch|timepiece|chronograph/.test(t)) q.kinds.push("watch");
  if (/\brings?\b|engagement|wedding band|\bband\b|solitaire|proposal/.test(t)) q.kinds.push("ring");
  if (/necklace|pendant|\bchain\b|choker/.test(t)) q.kinds.push("necklace");
  if (/earring|\bstuds?\b/.test(t)) q.kinds.push("earrings");
  if (/bracelet|bangle/.test(t)) q.kinds.push("bracelet");
  if (/\bset\b/.test(t)) q.kinds.push("set");
  if (/jewel+ery|jewelry|\bjewels?\b|\bpieces?\b/.test(t) && !q.kinds.includes("watch")) q.category = "jewellery";
  if (q.kinds.includes("watch")) q.category = "watches";

  q.budget = parseBudget(t);
  q.wantsBudget = /budget|afford|\bspend|price range|within my/.test(t);

  for (const [re, style] of STYLE_RULES) {
    if (re.test(t) && !q.styles.includes(style)) q.styles.push(style);
  }

  if (/birthday/.test(t)) q.occasion = "Birthday";
  else if (/anniversary/.test(t)) q.occasion = "Anniversary";
  else if (/engagement|propos/.test(t)) q.occasion = "Engagement";
  else if (/wedding/.test(t)) q.occasion = "Wedding";
  else if (/formal|black tie|evening|party|gala|dinner|night out/.test(t)) q.occasion = "Formal";
  else if (/\bwork\b|office/.test(t)) q.occasion = "Work";
  else if (/everyday|daily|casual/.test(t)) q.occasion = "Everyday";
  else if (/christmas|xmas|valentine|mother|father|graduation|thank you|thank-you|congrat|promotion|retirement/.test(t)) q.occasion = "Gift";

  const forMe = /for me\b|for myself|\bmyself\b/.test(t);
  q.gift =
    !forMe &&
    /\bgift|\bpresent\b|for (my|a|an|him|her|them|someone)\b|birthday|anniversary|valentine|christmas|xmas|mother|father|graduation|thank you|surprise|wife|husband|girlfriend|boyfriend|partner|\bmum\b|\bmom\b|\bdad\b|daughter|\bson\b|sister|brother/.test(t);

  const recipient = RECIPIENTS.find(([re]) => re.test(t));
  if (recipient) q.recipient = recipient[1];

  q.materials = MATERIAL_WORDS.filter((m) => t.includes(m));
  return q;
}

const ALIASES: Record<string, RegExp> = {
  "gold-pendant-necklace": /gold pendant|pendant necklace|teardrop/,
  "diamond-stud-earrings": /diamond (stud|earring)|\bstuds?\b/,
  "pearl-drop-earrings": /pearl/,
  "gold-bracelet": /gold bracelet|chain bracelet/,
  "diamond-engagement-ring": /diamond (engagement|ring|solitaire)/,
  "sapphire-ring": /sapphire/,
  "classic-automatic-watch": /classic (automatic|watch)|automatic watch/,
  "minimalist-dress-watch": /minimalist|dress watch/,
  "luxury-chronograph-watch": /chronograph/,
  "two-tone-watch": /two-?tone/,
  "gold-wedding-band": /wedding band|wedding ring|\bband\b/,
  "gift-necklace-set": /gift (necklace )?set|necklace set/,
};

/** Products named (or clearly referred to) in the message, in order of appearance. */
export function findNamed(t: string): Product[] {
  const hits: { p: Product; idx: number }[] = [];
  for (const p of products) {
    const m = ALIASES[p.id]?.exec(t);
    if (m) hits.push({ p, idx: m.index });
  }
  return hits.sort((a, b) => a.idx - b.idx).map((h) => h.p);
}

type Topic = "certification" | "materials" | "dimensions" | "stock" | "colours" | "specs";

function topicOf(t: string): Topic | null {
  if (/certif|grading|\bgrade\b|report|authentic/.test(t)) return "certification";
  if (/material|made (of|from|with)|metal|composed|gemstone|\bstone|carat|\bct\b/.test(t)) return "materials";
  if (/dimension|diameter|\bmm\b|length|width|thick|how big|how large|measure/.test(t)) return "dimensions";
  if (/in stock|stock|availab|sold out|how many left/.test(t)) return "stock";
  if (/colou?r|finish|dial/.test(t)) return "colours";
  if (/spec|movement|water|resist|crystal|strap|clasp|fasten|feature/.test(t)) return "specs";
  return null;
}

/* ----------------------------------------------------------------------------
 * Scoring and recommendation
 * -------------------------------------------------------------------------- */

function candidates(q: Query): Product[] {
  return products.filter((p) => {
    if (q.kinds.length) return q.kinds.some((k) => p.kinds.includes(k));
    if (q.category) return p.category === q.category;
    return true;
  });
}

const inBudget = (p: Product, b: Budget): boolean =>
  (b.min === undefined || p.price >= b.min) && (b.max === undefined || p.price <= b.max);

function scoreProduct(p: Product, q: Query): number {
  let s = 0;
  for (const st of q.styles) {
    if (p.styles.includes(st)) s += 3;
    else if (RELATED[st].some((r) => p.styles.includes(r))) s += 1.5;
  }
  if (q.occasion && p.occasions.includes(q.occasion)) s += 3;
  if (q.gift && p.giftFriendly) s += 1;
  const materialText = p.materials.join(" ").toLowerCase();
  s += q.materials.filter((m) => materialText.includes(m)).length * 2;
  return s;
}

const KIND_NOUN: Record<string, string> = {
  watch: "watches",
  ring: "rings",
  necklace: "necklaces",
  earrings: "earrings",
  bracelet: "bracelets",
  set: "gift sets",
};

function describeBudget(b: Budget): string {
  if (b.min !== undefined && b.max !== undefined) return `between ${formatMoney(b.min)} and ${formatMoney(b.max)}`;
  if (b.max !== undefined) return `under ${formatMoney(b.max)}`;
  if (b.min !== undefined) return `over ${formatMoney(b.min)}`;
  return "";
}

function reasonFor(p: Product, q: Query): string {
  const parts: string[] = [p.highlight];
  const styleHits = q.styles.filter((st) => p.styles.includes(st));
  if (styleHits.length) {
    parts.push(`Its ${styleHits.map((s) => s.toLowerCase()).join(" and ")} character matches what you asked for.`);
  } else if (q.styles.length) {
    const related = q.styles.find((st) => RELATED[st].some((r) => p.styles.includes(r)));
    if (related) {
      const near = p.styles.find((s) => RELATED[related].includes(s));
      if (near) parts.push(`It has ${article(near)} ${near.toLowerCase()} feel, close to ${related.toLowerCase()}.`);
    }
  }
  if (q.occasion && p.occasions.includes(q.occasion)) {
    parts.push(`Recorded as suitable for ${q.occasion === "Gift" ? "gifting" : q.occasion.toLowerCase()}.`);
  }
  if (hasBudget(q.budget) && inBudget(p, q.budget)) {
    const scope =
      q.budget.min !== undefined && q.budget.max !== undefined
        ? `${formatMoney(q.budget.min)}–${formatMoney(q.budget.max)} range`
        : q.budget.max !== undefined
          ? `${formatMoney(q.budget.max)} budget`
          : `${formatMoney(q.budget.min ?? 0)}+ range`;
    parts.push(`At ${formatMoney(p.price)} it sits within your ${scope}.`);
  }
  return parts.join(" ");
}

const SINGULAR_NOUN: Record<string, string> = {
  watch: "watch",
  ring: "ring",
  necklace: "necklace",
  earrings: "pair of earrings",
  bracelet: "bracelet",
  set: "gift set",
};

function countPhrase(q: Query, n: number): string {
  if (n !== 1) return `Here are ${n} ${queryNoun(q)}`;
  if (q.kinds.length) return `Here is one ${SINGULAR_NOUN[q.kinds[0]] ?? "piece"}`;
  return "Here is one piece";
}

function queryNoun(q: Query): string {
  if (q.kinds.length) return q.kinds.map((k) => KIND_NOUN[k] ?? "pieces").slice(0, 2).join(" or ");
  if (q.category === "watches") return "watches";
  if (q.category === "jewellery") return "jewellery pieces";
  return "pieces";
}

function recipientPhrase(q: Query): string {
  if (q.occasion && q.occasion !== "Gift" && q.recipient) return ` for ${q.recipient}'s ${q.occasion.toLowerCase()}`;
  if (q.recipient) return ` for ${q.recipient}`;
  if (q.occasion && q.occasion !== "Gift") return ` for ${article(q.occasion)} ${q.occasion.toLowerCase()}`;
  if (q.occasion === "Gift" || q.gift) return " as a gift";
  return "";
}

function recommend(q: Query, base: ConversationState, askTaste = true): Turn {
  const pool = candidates(q);
  const ranked = pool
    .filter((p) => inBudget(p, q.budget))
    .map((p) => ({ p, s: scoreProduct(p, q) }))
    .sort((a, b) => b.s - a.s || b.p.price - a.p.price);

  const limit = q.kinds.length || hasBudget(q.budget) ? 3 : 4;
  const top = ranked.slice(0, limit).map((r) => r.p);
  const nextState: ConversationState = { ...base, lastQuery: q };

  const budgetText = hasBudget(q.budget) ? ` ${describeBudget(q.budget)}` : "";
  const styleWord = q.styles.map((s) => s.toLowerCase()).join(" and ");
  const styleText = q.styles.length ? ` with ${article(styleWord)} ${styleWord} feel` : "";

  // Nothing in range: be honest and offer the closest alternative.
  if (top.length === 0) {
    const closest = [...pool].sort((a, b) => Math.abs(a.price - (q.budget.max ?? a.price)) - Math.abs(b.price - (q.budget.max ?? b.price)))[0];
    if (!closest) {
      return {
        reply: {
          text: ["I couldn't find a match for that in the demo catalogue. Try a broader search, such as “Find a watch” or “Show me jewellery”."],
          chips: QUICK_ACTIONS.slice(0, 4).map((a) => ({ label: a.label, prompt: a.prompt })),
        },
        state: { ...nextState, lastQuery: undefined },
      };
    }
    return {
      reply: {
        text: [
          `I don't have any ${queryNoun(q)}${describeBudget(q.budget) ? ` ${describeBudget(q.budget)}` : ""} in the demo range.`,
          `The closest option is the ${closest.name} at ${formatMoney(closest.price)}.`,
        ],
        products: [{ id: closest.id, reason: reasonFor(closest, q) }],
        chips: [{ label: "Show me other budgets", prompt: "Shop by budget" }, { label: "Speak to a human advisor", prompt: "Speak to a human advisor" }],
      },
      state: { ...nextState, lastProductId: closest.id },
    };
  }

  const text: string[] = [];
  text.push(`${countPhrase(q, top.length)}${budgetText}${recipientPhrase(q)}${styleText}.`);

  // Mention the nearest item above budget, if it is close, so the customer sees the trade-off.
  if (q.budget.max !== undefined) {
    const above = pool
      .filter((p) => p.price > (q.budget.max ?? 0) && p.price <= (q.budget.max ?? 0) * 1.6)
      .sort((a, b) => a.price - b.price)[0];
    if (above && !top.includes(above)) {
      text.push(`The ${above.name} (${formatMoney(above.price)}) is just above this budget if you'd like to stretch.`);
    }
  }

  const chips: Chip[] = [];
  if (q.gift && askTaste) {
    text.push(
      q.recipient
        ? "To refine these, what is their taste: classic, minimalist, or bold?"
        : "To refine these, what is their taste: classic, minimalist, or bold? You can also tell me who it's for.",
    );
    chips.push(
      { label: "Classic", prompt: "They prefer a classic style" },
      { label: "Minimalist", prompt: "They prefer a minimalist style" },
      { label: "Bold", prompt: "They prefer a bold style" },
    );
  }
  if (!hasBudget(q.budget)) {
    chips.push(...BUDGET_PRESETS.slice(0, 3).map((b) => ({ label: b.label, prompt: b.prompt })));
  }
  if (top.length >= 2) {
    chips.push({ label: "Compare the top two", prompt: `Compare ${top[0].name} and ${top[1].name}` });
  }

  return {
    reply: {
      text,
      products: top.map((p) => ({ id: p.id, reason: reasonFor(p, q) })),
      chips: chips.slice(0, 5),
    },
    state: { ...nextState, lastProductId: top[0].id },
  };
}

function budgetQuestion(pending: Query, base: ConversationState, lead?: string): Turn {
  const subject = pending.kinds.length || pending.category
    ? queryNoun(pending)
    : pending.gift || pending.occasion
      ? "that gift"
      : "something";
  return {
    reply: {
      text: [
        lead ?? `Happy to help you find ${subject}. What budget would you like to stay within?`,
        "Choose a range below, or type one, such as “around $900”.",
      ],
      chips: BUDGET_PRESETS.map((b) => ({ label: b.label, prompt: b.prompt })),
    },
    state: { ...base, awaiting: "budget", pending },
  };
}

function occasionQuestion(pending: Query, base: ConversationState): Turn {
  return {
    reply: {
      text: ["Happy to help you choose a gift. What's the occasion?"],
      chips: [
        { label: "Birthday", prompt: "A birthday gift" },
        { label: "Anniversary", prompt: "An anniversary gift" },
        { label: "Wedding", prompt: "A wedding gift" },
        { label: "Thank you", prompt: "A thank you gift" },
      ],
    },
    state: { ...base, awaiting: "occasion", pending },
  };
}

function mergeQuery(a: Query, b: Query): Query {
  return {
    kinds: b.kinds.length ? b.kinds : a.kinds,
    category: b.category ?? a.category,
    budget: hasBudget(b.budget) ? b.budget : a.budget,
    styles: b.styles.length ? b.styles : a.styles,
    occasion: b.occasion ?? a.occasion,
    gift: a.gift || b.gift,
    recipient: b.recipient ?? a.recipient,
    materials: b.materials.length ? b.materials : a.materials,
    wantsBudget: a.wantsBudget || b.wantsBudget,
  };
}

/* ----------------------------------------------------------------------------
 * Specific intents
 * -------------------------------------------------------------------------- */

function productSummary(p: Product): string[] {
  return [
    `${p.name}. ${p.summary}`,
    `Price: ${formatMoney(p.price)}. Styles: ${p.styles.join(", ")}. Best for: ${p.occasions.join(", ").toLowerCase()}.`,
  ];
}

function productInfo(p: Product, topic: Topic | null, base: ConversationState): Turn {
  const text: string[] = [];
  switch (topic) {
    case "materials":
      text.push(`The ${p.name} is made with ${p.materials.join(", ").toLowerCase()}.`);
      text.push(certificateSummary(p));
      break;
    case "certification":
      text.push(`For the ${p.name}: ${p.certification}`);
      {
        const gem = p.specs.filter((s) => /diamond|sapphire|centre|grading|origin|treatment|weight|accent/i.test(s.label));
        if (gem.length) text.push(gem.map((s) => `${s.label}: ${s.value}`).join(". ") + ".");
      }
      break;
    case "dimensions":
      text.push(`Dimensions for the ${p.name}: ${p.dimensions}.`);
      if (p.kinds.includes("ring")) text.push("Ring sizes are not listed in this demo record, so I can't confirm a specific size.");
      break;
    case "stock":
      text.push(`Stock status for the ${p.name} (demo data): ${p.stock}.`);
      text.push(p.stockNote);
      break;
    case "colours":
      text.push(`Colour and finish options for the ${p.name} (demo record): ${p.colours.join(", ")}.`);
      break;
    case "specs":
      text.push(`Specifications for the ${p.name} (demo record):`);
      text.push(p.specs.map((s) => `• ${s.label}: ${s.value}`).join("\n"));
      break;
    default:
      text.push(...productSummary(p));
  }
  return {
    reply: {
      text,
      products: [{ id: p.id }],
      chips: [
        { label: "Care for this piece", prompt: `How should I care for the ${p.name}?` },
        { label: "What goes with it?", prompt: `What goes with the ${p.name}?` },
        { label: "Materials & stock", prompt: `What materials is the ${p.name} made of?` },
        { label: "Speak to an advisor", prompt: "Speak to a human advisor" },
      ],
    },
    state: { ...base, lastProductId: p.id },
  };
}

function compareTurn(items: Product[], base: ConversationState): Turn {
  const list = items.slice(0, 3);
  const names = list.map((p) => p.name);
  const text: string[] = [`Here's how the ${names.join(" and ")} compare. Where a detail is not recorded, it is shown as “Not recorded”.`];
  if (list.length === 2) {
    const [a, b] = list;
    const diff = a.price - b.price;
    if (diff !== 0) {
      const cheaper = diff < 0 ? a : b;
      text.push(`The ${cheaper.name} is ${formatMoney(Math.abs(diff))} less than the ${(cheaper === a ? b : a).name}.`);
    }
    const sharedStyle = a.styles.filter((s) => b.styles.includes(s));
    text.push(
      sharedStyle.length
        ? `Both share a ${sharedStyle.map((s) => s.toLowerCase()).join(" and ")} character. Materials: ${a.materials[0]} against ${b.materials[0]}.`
        : `They have different characters. ${a.name} leans ${a.styles[0].toLowerCase()}; ${b.name} leans ${b.styles[0].toLowerCase()}.`,
    );
  }
  return {
    reply: {
      text,
      comparison: list.map((p) => p.id),
      products: list.map((p) => ({ id: p.id })),
      chips: [{ label: "Ask about care", prompt: "How do I care for these pieces?" }, { label: "Speak to an advisor", prompt: "Speak to a human advisor" }],
    },
    state: { ...base, lastProductId: list[0].id },
  };
}

/* ----------------------------------------------------------------------------
 * Public entry point
 * -------------------------------------------------------------------------- */

export function respond(input: string, state: ConversationState): Turn {
  const t = norm(input);
  const base: ConversationState = { ...state, awaiting: undefined, pending: undefined };
  const words = t.split(" ").filter(Boolean).length;

  if (!t) {
    return { reply: { text: ["Tell me what you're looking for, and I'll suggest pieces from the demo catalogue."] }, state: base };
  }

  const named = findNamed(t);
  const q = parseQuery(t);
  const pronoun = /\bit\b|\bthis\b|\bthat\b|\bthese\b|\bthe piece\b/.test(t);
  const lastProduct = state.lastProductId ? productById(state.lastProductId) : undefined;

  // 1. Greeting
  if (/^(hi|hello|hey|hiya|good (morning|afternoon|evening))\b/.test(t) && words <= 4 && !q.gift && q.kinds.length === 0 && !hasBudget(q.budget)) {
    return {
      reply: {
        text: ["Hello, and welcome to AUREVÉ.", "Tell me the occasion, budget, or style you have in mind, or choose a starting point below."],
        chips: QUICK_ACTIONS.map((a) => ({ label: a.label, prompt: a.prompt })),
      },
      state: base,
    };
  }

  // 2. Human assistance
  if (/human|real person|real people|advisor|adviser|speak (to|with) (someone|a person|an? (advisor|adviser|member|team)|your team|the team|sales)|talk (to|with) (someone|a person|a human|an? (advisor|adviser|team)|your team)|call me|call back|callback|sales team|member of (the )?(team|staff)|contact (a|the) (team|advisor|store)/.test(t)) {
    return {
      reply: {
        text: [
          "I can arrange for an AUREVÉ advisor to follow up with you.",
          "This is a demonstration: the form below does not contact a real sales team, and nothing is sent or stored.",
        ],
        leadForm: true,
      },
      state: { ...base, awaiting: undefined },
    };
  }

  // 3. Comparison
  if (/compar|versus|\bvs\b|difference between|which (one )?is better|better between/.test(t)) {
    const fromChat = named.slice(0, 3);
    if (fromChat.length >= 2) return compareTurn(fromChat, base);
    const fromTray = (state.compareIds ?? []).map((id) => productById(id)).filter((p): p is Product => Boolean(p));
    const combined = [...fromChat, ...fromTray.filter((p) => !fromChat.includes(p))];
    if (combined.length >= 2) return compareTurn(combined, base);

    const pool = q.kinds.includes("watch")
      ? products.filter((p) => p.category === "watches")
      : [
          productById("gold-pendant-necklace"),
          productById("pearl-drop-earrings"),
          productById("gold-bracelet"),
          productById("diamond-stud-earrings"),
          productById("gift-necklace-set"),
          productById("two-tone-watch"),
        ].filter((p): p is Product => Boolean(p));
    const suggestions = q.kinds.includes("watch")
      ? [["classic-automatic-watch", "two-tone-watch"], ["minimalist-dress-watch", "luxury-chronograph-watch"]]
      : [["gold-pendant-necklace", "pearl-drop-earrings"], ["gift-necklace-set", "diamond-stud-earrings"]];
    return {
      reply: {
        text: [
          "I'd be happy to compare. Use the Compare button on any card below to pick up to three pieces, then ask me to compare them.",
          "Or choose one of these suggested pairs:",
        ],
        products: pool.map((p) => ({ id: p.id })),
        chips: suggestions.map(([a, b]) => {
          const pa = productById(a);
          const pb = productById(b);
          return { label: `${pa?.name} vs ${pb?.name}`, prompt: `Compare ${pa?.name} and ${pb?.name}` };
        }),
      },
      state: base,
    };
  }

  // 4. Delivery and returns
  if (/deliver|shipping|\bships?\b|postage|dispatch|\btrack|arriv|return|refund|exchange|insur|checkout|payment/.test(t)) {
    const target = named[0] ?? (pronoun ? lastProduct : undefined);
    const text = [POLICIES.delivery, POLICIES.returns];
    if (target) text.push(`For the ${target.name}: stock is shown as “${target.stock}” (demo data). ${target.stockNote}`);
    text.push("No real orders can be placed in this demonstration.");
    return {
      reply: {
        text,
        products: target ? [{ id: target.id }] : undefined,
        chips: [
          { label: "Speak to an advisor", prompt: "Speak to a human advisor" },
          { label: "Find a gift", prompt: "Help me find a gift" },
          { label: "Compare products", prompt: "Compare products" },
        ],
      },
      state: base,
    };
  }

  // 5. Details the demo record does not cover
  const unknown: [RegExp, string][] = [
    [/warrant|guarantee/, "Warranty terms are not recorded in this demo, so I can't confirm them."],
    [/engrav|monogram|inscri/, "Engraving is not listed in this demo, so I can't confirm whether it's available."],
    [/ring size|what size|resize|sizing|\bsize \d/, "Ring sizes are not recorded in this demo record, so I can't confirm availability in a specific size. A live advisor would help with sizing."],
    [/discount|price match|promo|voucher|sale/, "No discounts or price matching are applied in this demonstration."],
    [/instal|finance|pay monthly|payment plan|klarna|clearpay/, "Payment plans are not part of this demonstration, so I can't confirm them."],
    [/internation|outside (the )?uk|ireland|europe|usa|united states|export/, "The demo delivery policy describes UK delivery only, so I can't confirm international shipping."],
  ];
  const unknownHit = unknown.find(([re]) => re.test(t));
  if (unknownHit) {
    return {
      reply: {
        text: [unknownHit[1]],
        products: named[0] ? [{ id: named[0].id }] : undefined,
        chips: [
          { label: "Speak to an advisor", prompt: "Speak to a human advisor" },
          { label: "Delivery & returns", prompt: "Tell me about delivery and returns" },
        ],
      },
      state: base,
    };
  }

  // 6. Care and maintenance
  if (/\bcare\b|cleaning|how (do|should|can) i clean|\bpolish|maintenance|tarnish|swim|shower|sweat|perfume|storage|store (it|them|my|the)|scratch|look after/.test(t)) {
    const target = named[0] ?? (pronoun ? lastProduct : undefined);
    if (target) {
      return {
        reply: {
          text: [`Care for the ${target.name}:`, target.care.map((c) => `• ${c}`).join("\n")],
          products: [{ id: target.id }],
          chips: [{ label: "Materials & stock", prompt: `What materials is the ${target.name} made of?` }, { label: "Find a gift", prompt: "Help me find a gift" }],
        },
        state: { ...base, lastProductId: target.id },
      };
    }
    return {
      reply: {
        text: [
          "Care depends on the material. The basics across the AUREVÉ collection are:",
          "• Gold vermeil and gold-tone: wipe after wear and keep away from perfume and water.\n• Pearls: apply cosmetics first, put on last, and store separately.\n• Diamonds and sapphires: clean with lukewarm water, mild soap, and a soft brush.\n• Watches: avoid magnets and extreme heat, keep leather straps dry, and follow the service guidance supplied.",
          "Tell me which piece you own and I'll give its specific instructions.",
        ],
        chips: [
          { label: "Care: Pearl Drop Earrings", prompt: "How do I care for the Pearl Drop Earrings?" },
          { label: "Care: Classic Automatic Watch", prompt: "How do I care for the Classic Automatic Watch?" },
        ],
      },
      state: base,
    };
  }

  // 7. Matching pieces
  if (/\bmatch|goes with|go with|pairs? well|pair with|pair (it|this|that)|complement|stack|layer|wear with|worn with|matching/.test(t)) {
    const target = named[0] ?? lastProduct;
    if (!target) {
      const picks = [productById("gold-pendant-necklace"), productById("classic-automatic-watch"), productById("diamond-engagement-ring")].filter((p): p is Product => Boolean(p));
      return {
        reply: {
          text: ["Which piece would you like to build a look around? Here are some favourites to start from."],
          products: picks.map((p) => ({ id: p.id })),
        },
        state: base,
      };
    }
    let pairs = target.pairsWith.map((id) => productById(id)).filter((p): p is Product => Boolean(p));
    if (hasBudget(q.budget)) pairs = pairs.filter((p) => inBudget(p, q.budget));
    const text = pairs.length
      ? [`Pieces that pair well with the ${target.name}:`]
      : [`I don't have a matching piece within that budget for the ${target.name} in the demo range.`];
    return {
      reply: {
        text,
        products: pairs.map((p) => {
          const shared = target.styles.find((s) => p.styles.includes(s));
          const bothGold = /gold/i.test(target.materials.join(" ")) && /gold/i.test(p.materials.join(" "));
          const why = shared
            ? `Both share a ${shared.toLowerCase()} character, so they sit well together.`
            : bothGold
              ? "Both have a warm gold tone, so they layer easily."
              : `A complementary ${p.kinds.find((k) => ["necklace", "earrings", "bracelet", "ring", "watch", "set"].includes(k)) ?? "piece"} for the same look.`;
          return { id: p.id, reason: why };
        }),
        chips: [{ label: "Compare with the first pick", prompt: pairs[0] ? `Compare ${target.name} and ${pairs[0].name}` : "Compare products" }],
      },
      state: { ...base, lastProductId: target.id },
    };
  }

  // 8. Questions about one named product
  if (named.length === 1) {
    const constraints = hasBudget(q.budget) || q.gift || q.styles.length > 0 || Boolean(q.occasion);
    const asksAbout = topicOf(t) !== null || /\?|tell me|about|details|more|info|is (it|the|this)|does|do you|what/.test(t);
    if (asksAbout || !constraints) {
      return productInfo(named[0], topicOf(t), base);
    }
  }

  // 9. Answering an open budget question
  if (state.awaiting === "budget" && state.pending) {
    const merged = mergeQuery(state.pending, q);
    if (hasBudget(q.budget)) return recommend(merged, base);
    return budgetQuestion(merged, base, "Let's keep looking. Which budget should I use?");
  }

  // 10. Answering an open occasion question
  if (state.awaiting === "occasion" && state.pending) {
    const merged = mergeQuery(state.pending, q);
    if (merged.occasion) {
      if (hasBudget(merged.budget)) return recommend(merged, base);
      return budgetQuestion(merged, base);
    }
    return occasionQuestion(merged, base);
  }

  // 11. Shop by budget
  if (/shop by budget|by budget|budget shop/.test(t) && !hasBudget(q.budget)) {
    return budgetQuestion(emptyQuery(), base, "Let's find something within your budget. What would you like to stay within?");
  }

  // 12. Refinements to the previous search ("Classic", "Under $500", "It's for my partner")
  const hasSlot = hasBudget(q.budget) || q.styles.length > 0 || Boolean(q.occasion) || Boolean(q.recipient);
  const freshGift = q.gift && Boolean(q.occasion);
  if (state.lastQuery && words <= 9 && q.kinds.length === 0 && !q.category && named.length === 0 && hasSlot && !freshGift) {
    const merged = mergeQuery(state.lastQuery, q);
    return recommend(merged, base, false);
  }

  // 13. Gift guidance: occasion first, then budget
  if (q.gift) {
    if (!q.occasion && q.kinds.length === 0 && !hasBudget(q.budget)) return occasionQuestion(q, base);
    if (!hasBudget(q.budget)) return budgetQuestion(q, base);
    return recommend(q, base);
  }

  // 14. Budget wanted but not given
  if (q.wantsBudget && !hasBudget(q.budget)) return budgetQuestion(q, base);

  // 15. Browsing and recommendations
  if (q.kinds.length || q.category || hasBudget(q.budget) || q.styles.length || q.materials.length) {
    return recommend(q, base);
  }

  // 16. Fallback
  return {
    reply: {
      text: [
        "I'm not sure I understood that. I can help with jewellery and watches, gifts by occasion and budget, comparisons, materials and care, and delivery and returns.",
        "Try something like “Find a watch under $1,000” or “Compare the Classic Automatic Watch and the Two-Tone Watch”.",
      ],
      chips: [
        { label: "Find a Gift", prompt: "Help me find a gift" },
        { label: "Find a Watch", prompt: "Find a watch for me" },
        { label: "Delivery & Returns", prompt: "Tell me about delivery and returns" },
        { label: "Speak to an advisor", prompt: "Speak to a human advisor" },
      ],
    },
    state: base,
  };
}

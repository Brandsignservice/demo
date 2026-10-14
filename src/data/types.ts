export type CategoryId = "jewellery" | "watches" | "engagement" | "gifts";

export type Occasion =
  | "Everyday"
  | "Birthday"
  | "Anniversary"
  | "Wedding"
  | "Engagement"
  | "Gift"
  | "Work"
  | "Formal";

export type Style = "Classic" | "Elegant" | "Minimalist" | "Modern" | "Bold" | "Delicate" | "Luxury";

export type StockStatus = "In stock" | "Low stock" | "Made to order";

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  /** Primary navigation category. Gifts are a curated view, see `giftFriendly`. */
  category: Exclude<CategoryId, "gifts">;
  /** Sub-type used for matching (e.g. "necklace", "ring", "watch"). */
  kinds: string[];
  price: number;
  image: string;
  imageAlt: string;
  summary: string;
  /** Short "why it matches" highlight written from the product record only. */
  highlight: string;
  description: string;
  materials: string[];
  dimensions: string;
  colours: string[];
  styles: Style[];
  occasions: Occasion[];
  giftFriendly: boolean;
  stock: StockStatus;
  stockNote: string;
  /** Gemstone certificate status. Never invented: a fixed statement when unknown. */
  certification: string;
  specs: ProductSpec[];
  care: string[];
  /** Ids of pieces that work well alongside this one. */
  pairsWith: string[];
}

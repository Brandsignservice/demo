const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatMoney = (amount: number): string => usd.format(amount);

export const categoryLabel = (c: string): string =>
  ({ jewellery: "Jewellery", watches: "Watches", engagement: "Engagement Rings" })[c] ?? c;

export const slugToPath = (category: string): string =>
  ({ jewellery: "/jewellery", watches: "/watches", engagement: "/engagement-rings", gifts: "/gifts" })[category] ?? "/";

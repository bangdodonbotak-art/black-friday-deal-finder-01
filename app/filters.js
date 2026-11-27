// filters.js — search, category / store / discount filtering and sorting.
// One job: decide which deals to show, and in what order. Rendering lives
// in render.js; the data lives in deals.js.

import { discountPct, dollarsSaved } from "./deals.js";

export const SORTS = {
  "best-verdict": "Best verdict first",
  "biggest-pct": "Biggest discount %",
  "biggest-save": "Biggest $ saved",
  "lowest-price": "Lowest price",
};

const VERDICT_RANK = { "new-low": 0, strong: 1, solid: 2, routine: 3 };

export function sortDeals(deals, sortKey) {
  const list = [...deals];
  switch (sortKey) {
    case "biggest-pct":
      return list.sort((a, b) => discountPct(b) - discountPct(a));
    case "biggest-save":
      return list.sort((a, b) => dollarsSaved(b) - dollarsSaved(a));
    case "lowest-price":
      return list.sort((a, b) => a.sale - b.sale);
    case "best-verdict":
    default:
      return list.sort(
        (a, b) =>
          VERDICT_RANK[a.verdict] - VERDICT_RANK[b.verdict] ||
          discountPct(b) - discountPct(a),
      );
  }
}

// state: { query, category, store, minDiscount, sort }
export function applyFilters(deals, state) {
  const query = state.query.trim().toLowerCase();
  return deals.filter((deal) => {
    if (state.category !== "All" && deal.category !== state.category) return false;
    if (state.store !== "All stores" && deal.store !== state.store) return false;
    if (discountPct(deal) < state.minDiscount) return false;
    if (
      query &&
      !`${deal.product} ${deal.store} ${deal.category}`
        .toLowerCase()
        .includes(query)
    )
      return false;
    return true;
  });
}

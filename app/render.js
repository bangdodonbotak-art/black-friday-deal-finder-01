// render.js — turns deal objects into deal cards and page sections.
// One job: HTML for deals. Filtering and sorting live in filters.js.

import { DEALS, SOURCES, discountPct, dollarsSaved, formatPrice } from "./deals.js";

const VERDICT_LABEL = {
  "new-low": "NEW LOW",
  strong: "STRONG PRICE",
  solid: "SOLID DEAL",
  routine: "ROUTINE SALE",
};

// Small original line icons, one per category, drawn as inline SVG.
const CATEGORY_ICONS = {
  Electronics:
    '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
  "Home & Kitchen":
    '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>',
  "Toys & Games":
    '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="4"/><rect x="3" y="13" width="8" height="8" rx="4"/></svg>',
  Fashion:
    '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3l4 3 2-2 2 2 4-3-2 6-3 1v11H9V10L6 9z"/></svg>',
  Beauty:
    '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v3M8 6h8l-1 4H9z"/><path d="M9 10h6l1 10a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 8 20z"/></svg>',
  Auto:
    '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 13l1.5-4.5A2 2 0 0 1 7.4 7h9.2a2 2 0 0 1 1.9 1.5L20 13"/><rect x="3" y="13" width="18" height="5" rx="1.5"/><circle cx="7.5" cy="18.5" r="1.6"/><circle cx="16.5" cy="18.5" r="1.6"/></svg>',
};

export function categoryIcon(category) {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS.Electronics;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// One deal card: product, store, prices, discount, verdict, source, link.
export function renderDealCard(deal) {
  const pct = discountPct(deal);
  const saved = dollarsSaved(deal);
  const condition = deal.condition
    ? `<p class="deal-condition">${escapeHtml(deal.condition)}</p>`
    : "";
  return `
  <article class="deal-card" data-id="${deal.id}">
    <div class="deal-top">
      <span class="deal-icon" aria-hidden="true">${categoryIcon(deal.category)}</span>
      <span class="deal-category">${escapeHtml(deal.category)}</span>
      <span class="deal-discount">−${pct}%</span>
    </div>
    <h3 class="deal-name">${escapeHtml(deal.product)}</h3>
    <p class="deal-store">at <strong>${escapeHtml(deal.store)}</strong></p>
    <p class="deal-prices">
      <span class="deal-sale">${formatPrice(deal.sale)}</span>
      <span class="deal-usual">${formatPrice(deal.usual)}</span>
      <span class="deal-save">save ${formatPrice(saved)}</span>
    </p>
    ${condition}
    <p class="deal-verdict verdict-${deal.verdict}">
      <span class="verdict-badge">${VERDICT_LABEL[deal.verdict]}</span>
      ${escapeHtml(deal.verdictNote)}
    </p>
    <p class="deal-checked">Price checked ${escapeHtml(deal.checked)} · Source: ${escapeHtml(deal.source)}</p>
    <a class="deal-link" href="${escapeHtml(deal.url)}" target="_blank" rel="noopener">View at ${escapeHtml(deal.store)} →</a>
  </article>`;
}

export function renderDealGrid(deals) {
  if (deals.length === 0) {
    return `<p class="empty-state">No deals match those filters. Try clearing the search or lowering the minimum discount.</p>`;
  }
  return deals.map(renderDealCard).join("\n");
}

// Header stats computed from the full deal list.
export function renderStats(deals) {
  const totalSaved = deals.reduce((sum, d) => sum + dollarsSaved(d), 0);
  const avgPct = Math.round(
    deals.reduce((sum, d) => sum + discountPct(d), 0) / deals.length,
  );
  const biggest = deals.reduce((best, d) =>
    dollarsSaved(d) > dollarsSaved(best) ? d : best,
  );
  const storeCount = new Set(deals.map((d) => d.store)).size;
  return { totalSaved, avgPct, biggest, storeCount };
}

export function renderSources() {
  return SOURCES.map(
    (s) =>
      `<li><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.name)}</a> — ${escapeHtml(s.note)}</li>`,
  ).join("\n");
}

export function renderFeaturedDeal(deal) {
  const pct = discountPct(deal);
  return `
    <div class="hero-deal">
      <p class="hero-kicker">Deal of the day · ${escapeHtml(deal.store)}</p>
      <h2>${escapeHtml(deal.product)}</h2>
      <p class="hero-prices"><span class="hero-sale">${formatPrice(deal.sale)}</span>
        <span class="hero-usual">${formatPrice(deal.usual)}</span>
        <span class="hero-discount">−${pct}% · save ${formatPrice(dollarsSaved(deal))}</span></p>
      <p class="hero-verdict"><span class="verdict-badge">NEW LOW</span> ${escapeHtml(deal.verdictNote)}</p>
      <p class="hero-checked">Price checked ${escapeHtml(deal.checked)} · Source: ${escapeHtml(deal.source)}</p>
      <a class="hero-link" href="${escapeHtml(deal.url)}" target="_blank" rel="noopener">View at ${escapeHtml(deal.store)} →</a>
    </div>`;
}

export { DEALS };

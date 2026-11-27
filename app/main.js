// main.js — wires the page together: builds the stats bar, the featured
// deal, the filter controls and the deal grid, then re-renders on input.
// One job: page wiring. Data in deals.js, cards in render.js, rules in
// filters.js.

import { DEALS, CATEGORIES, STORES, CHECKED_DATE, formatPrice } from "./deals.js";
import {
  renderDealGrid,
  renderFeaturedDeal,
  renderSources,
  renderStats,
} from "./render.js";
import { SORTS, applyFilters, sortDeals } from "./filters.js";

const state = {
  query: "",
  category: "All",
  store: "All stores",
  minDiscount: 0,
  sort: "best-verdict",
};

const grid = document.getElementById("deal-grid");
const countLine = document.getElementById("result-count");
const searchInput = document.getElementById("search");
const categoryRow = document.getElementById("category-chips");
const storeSelect = document.getElementById("store-filter");
const discountSelect = document.getElementById("discount-filter");
const sortSelect = document.getElementById("sort-select");

function renderAll() {
  const filtered = sortDeals(applyFilters(DEALS, state), state.sort);
  grid.innerHTML = renderDealGrid(filtered);
  countLine.textContent =
    filtered.length === DEALS.length
      ? `Showing all ${DEALS.length} deals`
      : `Showing ${filtered.length} of ${DEALS.length} deals`;
}

function buildStats() {
  const stats = renderStats(DEALS);
  document.getElementById("stat-deals").textContent = String(DEALS.length);
  document.getElementById("stat-stores").textContent = String(stats.storeCount);
  document.getElementById("stat-avg").textContent = `${stats.avgPct}%`;
  document.getElementById("stat-saved").textContent = formatPrice(stats.totalSaved);
  document.getElementById("stat-biggest").textContent =
    `${stats.biggest.product} — save ${formatPrice(stats.biggest.usual - stats.biggest.sale)}`;
}

function buildControls() {
  categoryRow.innerHTML = CATEGORIES.map(
    (cat) =>
      `<button type="button" class="chip${cat === state.category ? " active" : ""}" data-category="${cat}">${cat}</button>`,
  ).join("");
  categoryRow.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    state.category = button.dataset.category;
    categoryRow
      .querySelectorAll(".chip")
      .forEach((chip) => chip.classList.toggle("active", chip === button));
    renderAll();
  });

  storeSelect.innerHTML = STORES.map(
    (store) => `<option value="${store}">${store}</option>`,
  ).join("");
  storeSelect.addEventListener("change", () => {
    state.store = storeSelect.value;
    renderAll();
  });

  discountSelect.addEventListener("change", () => {
    state.minDiscount = Number(discountSelect.value);
    renderAll();
  });

  sortSelect.innerHTML = Object.entries(SORTS)
    .map(([key, label]) => `<option value="${key}">${label}</option>`)
    .join("");
  sortSelect.value = state.sort;
  sortSelect.addEventListener("change", () => {
    state.sort = sortSelect.value;
    renderAll();
  });

  searchInput.addEventListener("input", () => {
    state.query = searchInput.value;
    renderAll();
  });
}

function buildPage() {
  document.getElementById("checked-date").textContent = CHECKED_DATE;
  document.getElementById("hero-deal-slot").innerHTML = renderFeaturedDeal(DEALS[0]);
  document.getElementById("source-list").innerHTML = renderSources();
  buildStats();
  buildControls();
  renderAll();
}

buildPage();

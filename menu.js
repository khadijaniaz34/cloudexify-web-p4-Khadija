// js/menu.js — fetch menu_items from Supabase, render cards, filter + search

let allMenuItems = [];
let activeCategory = "all";
let searchTerm = "";

async function loadMenu() {
  const grid = document.getElementById("menuGrid");
  if (!grid) return;
  grid.innerHTML = `<div class="skeleton" style="height:260px"></div>
    <div class="skeleton" style="height:260px"></div>
    <div class="skeleton" style="height:260px"></div>`;

  const { data: items, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("available", true)
    .order("name");

  if (error) {
    console.error(error);
    grid.innerHTML = `<div class="empty-state">Couldn't load the menu right now. Please refresh.</div>`;
    return;
  }

  allMenuItems = items || [];
  buildCategoryPills();
  renderMenu();
}

function buildCategoryPills() {
  const row = document.getElementById("categoryRow");
  if (!row) return;
  const categories = ["all", ...new Set(allMenuItems.map((i) => i.category).filter(Boolean))];
  row.innerHTML = categories
    .map(
      (cat) =>
        `<button class="pill ${cat === activeCategory ? "active" : ""}" data-cat="${cat}">
          ${cat === "all" ? "All" : cat}
        </button>`
    )
    .join("");

  row.querySelectorAll(".pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.cat;
      buildCategoryPills();
      renderMenu();
    });
  });
}

function renderMenu() {
  const grid = document.getElementById("menuGrid");
  if (!grid) return;

  let items = allMenuItems;
  if (activeCategory !== "all") items = items.filter((i) => i.category === activeCategory);
  if (searchTerm.trim()) {
    const q = searchTerm.trim().toLowerCase();
    items = items.filter((i) => i.name.toLowerCase().includes(q));
  }

  if (!items.length) {
    grid.innerHTML = `<div class="empty-state">No treats match that search. Try a different word or category.</div>`;
    return;
  }

  grid.innerHTML = items
    .map(
      (item) => `
    <div class="item-card">
      <div class="thumb">
        <img src="${item.image_url || "assets/placeholder-food.jpg"}" alt="${item.name}" loading="lazy">
      </div>
      <div class="item-card-body">
        <h4>${item.name}</h4>
        <p>${item.description || ""}</p>
        <div class="item-card-footer">
          <span class="price-tag">${formatMoney(item.price)}</span>
          <button class="add-to-cart-btn" data-id="${item.id}" title="Add to cart">+</button>
        </div>
      </div>
    </div>`
    )
    .join("");

  grid.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = allMenuItems.find((i) => String(i.id) === btn.dataset.id);
      if (item) addToCart(item);
    });
  });
}

function initSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;
  input.addEventListener("input", (e) => {
    searchTerm = e.target.value;
    renderMenu();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadMenu();
  initSearch();
});

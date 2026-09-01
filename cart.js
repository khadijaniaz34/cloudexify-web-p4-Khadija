// js/cart.js — in-memory cart, persisted to sessionStorage

let cart = JSON.parse(sessionStorage.getItem("sb_cart") || "[]");

function saveCart() {
  sessionStorage.setItem("sb_cart", JSON.stringify(cart));
  renderCart();
}

function addToCart(item) {
  const existing = cart.find((c) => c.id === item.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      image_url: item.image_url,
      qty: 1,
    });
  }
  saveCart();
  showToast(item.name + " added to cart");
}

function changeQty(id, delta) {
  const line = cart.find((c) => c.id === id);
  if (!line) return;
  line.qty += delta;
  if (line.qty <= 0) cart = cart.filter((c) => c.id !== id);
  saveCart();
}

function removeFromCart(id) {
  cart = cart.filter((c) => c.id !== id);
  saveCart();
}

function clearCart() {
  cart = [];
  saveCart();
}

function cartTotal() {
  return cart.reduce((sum, c) => sum + c.price * c.qty, 0);
}

function cartCount() {
  return cart.reduce((sum, c) => sum + c.qty, 0);
}

function renderCart() {
  const countEl = document.getElementById("cartCount");
  if (countEl) countEl.textContent = cartCount();

  const itemsEl = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  const checkoutBtn = document.getElementById("checkoutBtn");
  if (!itemsEl) return;

  if (!cart.length) {
    itemsEl.innerHTML = `<div class="empty-state">Your cart is empty — go pick something sweet.</div>`;
  } else {
    itemsEl.innerHTML = cart
      .map(
        (c) => `
      <div class="cart-row">
        <div class="thumb-sm"><img src="${c.image_url || "assets/placeholder-food.jpg"}" alt="${c.name}"></div>
        <div class="info">
          <div class="name">${c.name}</div>
          <div class="price">${formatMoney(c.price)}</div>
          <div class="qty-control">
            <button data-act="dec" data-id="${c.id}">−</button>
            <span>${c.qty}</span>
            <button data-act="inc" data-id="${c.id}">+</button>
          </div>
          <div class="remove-item" data-act="remove" data-id="${c.id}">Remove</div>
        </div>
      </div>`
      )
      .join("");
  }

  if (totalEl) totalEl.textContent = formatMoney(cartTotal());
  if (checkoutBtn) checkoutBtn.disabled = cart.length === 0;

  itemsEl.querySelectorAll("[data-act]").forEach((el) => {
    el.addEventListener("click", () => {
      const id = Number(el.dataset.id);
      if (el.dataset.act === "inc") changeQty(id, 1);
      if (el.dataset.act === "dec") changeQty(id, -1);
      if (el.dataset.act === "remove") removeFromCart(id);
    });
  });
}

function openCart() {
  document.getElementById("cartPanel")?.classList.add("open");
  document.getElementById("overlay")?.classList.add("show");
}
function closeCart() {
  document.getElementById("cartPanel")?.classList.remove("open");
  document.getElementById("overlay")?.classList.remove("show");
}

document.addEventListener("DOMContentLoaded", () => {
  renderCart();
  document.getElementById("cartToggle")?.addEventListener("click", openCart);
  document.getElementById("cartClose")?.addEventListener("click", closeCart);
  document.getElementById("overlay")?.addEventListener("click", closeCart);
});

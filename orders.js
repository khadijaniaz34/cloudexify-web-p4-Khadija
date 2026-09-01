// js/orders.js — place an order, fetch this user's past orders

async function placeOrder() {
  const msgEl = document.getElementById("checkoutMsg");
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    showFormMessage(msgEl, "Please log in to place an order.", "error");
    setTimeout(() => (window.location.href = "login.html"), 1200);
    return;
  }
  if (!cart.length) {
    showFormMessage(msgEl, "Your cart is empty.", "error");
    return;
  }

  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) { checkoutBtn.disabled = true; checkoutBtn.textContent = "Placing order..."; }

  const { data, error } = await supabase
    .from("orders")
    .insert([{ user_id: user.id, items: cart, total: cartTotal(), status: "Pending" }])
    .select();

  if (checkoutBtn) { checkoutBtn.disabled = false; checkoutBtn.textContent = "Place order"; }

  if (error) {
    console.error(error);
    showFormMessage(msgEl, "Couldn't place the order. Please try again.", "error");
    return;
  }

  clearCart();
  showFormMessage(msgEl, "Order placed! Your order number is #" + data[0].id, "success");
  showToast("Order #" + data[0].id + " placed");
  loadMyOrders();
  setTimeout(closeCart, 1500);
}

async function loadMyOrders() {
  const list = document.getElementById("ordersList");
  if (!list) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    list.innerHTML = `<div class="empty-state">Log in to see your past orders.</div>`;
    return;
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    list.innerHTML = `<div class="empty-state">Couldn't load your orders.</div>`;
    return;
  }

  if (!orders.length) {
    list.innerHTML = `<div class="empty-state">No orders yet — your first treat is one click away.</div>`;
    return;
  }

  list.innerHTML = orders
    .map((o) => {
      const itemsSummary = (o.items || []).map((i) => `${i.name} ×${i.qty}`).join(", ");
      const date = new Date(o.created_at).toLocaleString();
      return `
      <div class="order-card">
        <div class="order-card-head">
          <span class="order-id">Order #${o.id}</span>
          <span class="status-badge status-${o.status}">${o.status}</span>
        </div>
        <div class="order-date">${date}</div>
        <div class="order-items-list">${itemsSummary}</div>
        <div class="order-total">${formatMoney(o.total)}</div>
      </div>`;
    })
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("checkoutBtn")?.addEventListener("click", placeOrder);
  loadMyOrders();
});

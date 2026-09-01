// js/admin.js — admin dashboard: stats, orders, menu management
// requireAdmin() must run before this on admin.html (see admin.html's inline script)

let editingItemId = null;

/* ---------- Orders ---------- */
async function loadAllOrders() {
  const tbody = document.getElementById("ordersBody");
  if (!tbody) return;

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*, profiles(full_name)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    tbody.innerHTML = `<tr><td colspan="6">Couldn't load orders.</td></tr>`;
    return;
  }

  if (!orders.length) {
    tbody.innerHTML = `<tr><td colspan="6">No orders yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = orders
    .map((o) => {
      const itemsSummary = (o.items || []).map((i) => `${i.name} ×${i.qty}`).join(", ");
      const customer = o.profiles?.full_name || "Guest";
      const time = new Date(o.created_at).toLocaleString();
      return `
      <tr>
        <td>#${o.id}</td>
        <td>${customer}</td>
        <td>${itemsSummary}</td>
        <td>${formatMoney(o.total)}</td>
        <td>${time}</td>
        <td>
          <select class="status-select" data-order-id="${o.id}">
            ${["Pending", "Preparing", "Ready"]
              .map((s) => `<option value="${s}" ${s === o.status ? "selected" : ""}>${s}</option>`)
              .join("")}
          </select>
        </td>
      </tr>`;
    })
    .join("");

  loadStats(orders);
}

document.addEventListener("change", (e) => {
  if (e.target.classList.contains("status-select")) {
    updateOrderStatus(e.target.dataset.orderId, e.target.value);
  }
});

async function updateOrderStatus(orderId, newStatus) {
  const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
  if (error) {
    console.error("Status update failed:", error.message);
    showToast("Couldn't update that order.");
    return;
  }
  showToast("Order #" + orderId + " → " + newStatus);
  loadAllOrders();
}

/* ---------- Stats ---------- */
function loadStats(orders) {
  const today = new Date().toDateString();
  const todaysOrders = orders.filter((o) => new Date(o.created_at).toDateString() === today);
  const revenueToday = todaysOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const pending = orders.filter((o) => o.status === "Pending").length;

  document.getElementById("statOrdersToday").textContent = todaysOrders.length;
  document.getElementById("statRevenueToday").textContent = formatMoney(revenueToday);
  document.getElementById("statPending").textContent = pending;
}

async function loadMenuItemCount() {
  const { count } = await supabase.from("menu_items").select("*", { count: "exact", head: true });
  const el = document.getElementById("statMenuItems");
  if (el) el.textContent = count ?? 0;
}

/* ---------- Menu management ---------- */
async function loadMenuTable() {
  const tbody = document.getElementById("menuTableBody");
  if (!tbody) return;

  const { data: items, error } = await supabase.from("menu_items").select("*").order("id");
  if (error) {
    console.error(error);
    tbody.innerHTML = `<tr><td colspan="6">Couldn't load menu items.</td></tr>`;
    return;
  }

  tbody.innerHTML = items
    .map(
      (i) => `
    <tr>
      <td>${i.name}</td>
      <td>${i.category || "—"}</td>
      <td>${formatMoney(i.price)}</td>
      <td>${i.available ? "Yes" : "No"}</td>
      <td>
        <div class="row-actions">
          <span class="icon-link edit" data-id="${i.id}">Edit</span>
          <span class="icon-link del" data-id="${i.id}">Delete</span>
        </div>
      </td>
    </tr>`
    )
    .join("");

  tbody.querySelectorAll(".edit").forEach((el) =>
    el.addEventListener("click", () => startEditItem(el.dataset.id, items))
  );
  tbody.querySelectorAll(".del").forEach((el) =>
    el.addEventListener("click", () => deleteMenuItem(el.dataset.id))
  );

  loadMenuItemCount();
}

function startEditItem(id, items) {
  const item = items.find((i) => String(i.id) === String(id));
  if (!item) return;
  editingItemId = item.id;

  document.getElementById("itemName").value = item.name;
  document.getElementById("itemDescription").value = item.description || "";
  document.getElementById("itemPrice").value = item.price;
  document.getElementById("itemCategory").value = item.category || "";
  document.getElementById("itemImage").value = item.image_url || "";
  document.getElementById("itemAvailable").checked = item.available;
  document.getElementById("menuFormTitle").textContent = "Edit menu item";
  document.getElementById("menuFormSubmit").textContent = "Save changes";
  window.scrollTo({ top: document.getElementById("menuForm").offsetTop - 20, behavior: "smooth" });
}

function resetMenuForm() {
  editingItemId = null;
  document.getElementById("menuForm").reset();
  document.getElementById("itemAvailable").checked = true;
  document.getElementById("menuFormTitle").textContent = "Add a new menu item";
  document.getElementById("menuFormSubmit").textContent = "Add item";
}

async function handleMenuFormSubmit(e) {
  e.preventDefault();
  const msgEl = document.getElementById("menuFormMsg");

  const payload = {
    name: document.getElementById("itemName").value.trim(),
    description: document.getElementById("itemDescription").value.trim(),
    price: Number(document.getElementById("itemPrice").value),
    category: document.getElementById("itemCategory").value.trim(),
    image_url: document.getElementById("itemImage").value.trim(),
    available: document.getElementById("itemAvailable").checked,
  };

  if (!payload.name || !payload.price) {
    showFormMessage(msgEl, "Name and price are required.", "error");
    return;
  }

  let error;
  if (editingItemId) {
    ({ error } = await supabase.from("menu_items").update(payload).eq("id", editingItemId));
  } else {
    ({ error } = await supabase.from("menu_items").insert([payload]));
  }

  if (error) {
    console.error(error);
    showFormMessage(msgEl, "Something went wrong saving that item.", "error");
    return;
  }

  showFormMessage(msgEl, editingItemId ? "Item updated." : "Item added.", "success");
  resetMenuForm();
  loadMenuTable();
}

async function deleteMenuItem(id) {
  if (!confirm("Delete this menu item?")) return;
  const { error } = await supabase.from("menu_items").delete().eq("id", id);
  if (error) {
    showToast("Couldn't delete that item.");
    return;
  }
  showToast("Item deleted");
  loadMenuTable();
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  loadAllOrders();
  loadMenuTable();
  document.getElementById("menuForm")?.addEventListener("submit", handleMenuFormSubmit);
  document.getElementById("menuFormCancel")?.addEventListener("click", resetMenuForm);

  // live-ish refresh, no reload needed
  setInterval(loadAllOrders, 30000);
});

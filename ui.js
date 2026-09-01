// js/ui.js — tiny shared helpers (toast, currency, loading state)

function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function formatMoney(n) {
  return "Rs " + Number(n).toFixed(2);
}

function showFormMessage(el, text, type) {
  if (!el) return;
  el.textContent = text;
  el.className = "form-msg show " + type;
}

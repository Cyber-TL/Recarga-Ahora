const KEYS = {
  cart: "gametop_cart",
  promo: "gametop_promo",
  orders: "gametop_orders"
};

const PROMO_CODES = {
  BIENVENIDA10: { percent: 10 },
  GAMER20: { percent: 20, minTotal: 50000 },
  FINDE15: { percent: 15 }
};

const PAYMENT_METHODS = [
  { id: "nequi", name: "Nequi", note: "Recibirás un número Nequi para transferir el total. La recarga se activa al confirmar el pago." },
  { id: "pse", name: "PSE / Bancolombia", note: "Te redirigiremos a tu banco para autorizar el débito por el valor total." },
  { id: "tarjeta", name: "Tarjeta crédito / débito", note: "Aceptamos Visa y Mastercard. El cobro se procesa de forma inmediata." },
  { id: "daviplata", name: "Daviplata", note: "Aprueba la transacción desde tu app Daviplata cuando te llegue la notificación." }
];

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function writeJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

function getCart() { return readJSON(KEYS.cart, []); }
function saveCart(cart) { writeJSON(KEYS.cart, cart); }
function getPromo() { return readJSON(KEYS.promo, null); }
function getOrders() { return readJSON(KEYS.orders, []); }
function saveOrders(orders) { writeJSON(KEYS.orders, orders); }

function money(n) { return "$" + Number(n || 0).toLocaleString("es-CO"); }
function genId(prefix) { return prefix + "-" + Math.random().toString(36).slice(2, 7).toUpperCase(); }

function computeTotals() {
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const promoCode = getPromo();
  const promo = promoCode ? PROMO_CODES[promoCode.code] : null;
  let discount = 0;
  if (promo && (!promo.minTotal || subtotal >= promo.minTotal)) {
    discount = Math.round((subtotal * promo.percent) / 100);
  }
  return { subtotal, discount, total: subtotal - discount };
}

function renderCart() {
  const cart = getCart();
  const list = document.getElementById("cartItems");

  list.innerHTML = cart.map((item, i) => `
    <div class="item">
      <div>
        <strong>${item.name}</strong>
        <p class="muted">${item.gameName} · cantidad: ${item.qty}</p>
      </div>
      <div style="display:flex;align-items:center;gap:14px;">
        <span style="font-weight:700;">${money(item.price * item.qty)}</span>
        <button class="remove-btn" data-remove="${i}">Quitar</button>
      </div>
    </div>
  `).join("");

  list.querySelectorAll("[data-remove]").forEach(btn => {
    btn.addEventListener("click", () => {
      const cart2 = getCart();
      cart2.splice(Number(btn.dataset.remove), 1);
      saveCart(cart2);
      renderCart();
    });
  });

  document.getElementById("cartEmpty").hidden = cart.length > 0;
  document.querySelector("#view-carrito .layout").hidden = cart.length === 0;

  const { subtotal, discount, total } = computeTotals();
  document.getElementById("subtotal").textContent = money(subtotal);
  document.getElementById("total").textContent = money(total);
  const discountRow = document.getElementById("discountRow");
  discountRow.hidden = discount <= 0;
  document.getElementById("discount").textContent = "-" + money(discount);
}

function showView(name) {
  document.querySelectorAll(".checkout-view").forEach(v => (v.hidden = true));
  document.getElementById("view-" + name).hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.getElementById("goToPayBtn").addEventListener("click", () => {
  if (getCart().length === 0) return;
  renderPayMethods();
  showView("pago");
});

document.getElementById("backToCartBtn").addEventListener("click", () => {
  renderCart();
  showView("carrito");
});


let selectedMethod = null;

function renderPayMethods() {
  const wrap = document.getElementById("payMethods");
  wrap.innerHTML = PAYMENT_METHODS.map(m => `
    <div class="method" data-method="${m.id}">
      <strong>${m.name}</strong>
      <span class="muted" style="font-size:12px;">Elegir</span>
    </div>
  `).join("");

  wrap.querySelectorAll("[data-method]").forEach(el => {
    el.addEventListener("click", () => {
      selectedMethod = PAYMENT_METHODS.find(m => m.id === el.dataset.method);
      wrap.querySelectorAll(".method").forEach(m => m.classList.remove("is-selected"));
      el.classList.add("is-selected");
      document.getElementById("methodNote").textContent = selectedMethod.note;
    });
  });

  const { total } = computeTotals();
  document.getElementById("payTotal").textContent = money(total);
}

document.getElementById("payForm").addEventListener("submit", (e) => {
  e.preventDefault();
  if (!selectedMethod) {
    alert("Elige un método de pago para continuar.");
    return;
  }

  const { subtotal, discount, total } = computeTotals();
  const order = {
    id: genId("GT"),
    items: getCart(),
    subtotal,
    discount,
    total,
    paymentLabel: selectedMethod.name,
    payerGameId: document.getElementById("payerGameId").value.trim(),
    payerEmail: document.getElementById("payerEmail").value.trim(),
    status: "pendiente",
    date: new Date().toISOString()
  };

  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);

  localStorage.removeItem(KEYS.cart);
  localStorage.removeItem(KEYS.promo);

  renderConfirmation(order);
  showView("confirmacion");
});


function renderConfirmation(order) {
  document.getElementById("confirmCard").innerHTML = `
    <div class="icon">✅</div>
    <h2>¡Pago recibido!</h2>
    <p>Tu pedido <strong>${order.id}</strong> quedó registrado por ${money(order.total)}.</p>
    <p>Te confirmaremos la entrega al correo ${order.payerEmail}.</p>
    <a class="btn btn--primary btn--block" style="margin-top:22px;" href="index.html">Volver a la tienda</a>
  `;
}
renderCart();
showView("carrito");

const DEFAULT_GAMES = [
  {
    id: "free-fire",
    name: "Free Fire",
    icon: "🔥",
    packages: [
      { id: "ff-100", name: "100 Diamantes", amount: "100 diamantes", price: 6000 },
      { id: "ff-310", name: "310 Diamantes", amount: "310 diamantes", price: 18000 },
      { id: "ff-520", name: "520 Diamantes", amount: "520 diamantes", price: 30000 },
      { id: "ff-1080", name: "1080 Diamantes", amount: "1080 diamantes", price: 60000 }
    ]
  },
  {
    id: "roblox",
    name: "Roblox",
    icon: "🎲",
    packages: [
      { id: "rb-400", name: "400 Robux", amount: "400 robux", price: 16000 },
      { id: "rb-800", name: "800 Robux", amount: "800 robux", price: 32000 },
      { id: "rb-1700", name: "1700 Robux", amount: "1700 robux", price: 65000 }
    ]
  },
  {
    id: "valorant",
    name: "Valorant",
    icon: "🎯",
    packages: [
      { id: "vp-475", name: "475 VP", amount: "475 valorant points", price: 12000 },
      { id: "vp-1000", name: "1000 VP", amount: "1000 valorant points", price: 25000 },
      { id: "vp-2050", name: "2050 VP", amount: "2050 valorant points", price: 50000 }
    ]
  },
  {
    id: "codm",
    name: "Call of Duty Mobile",
    icon: "🪖",
    packages: [
      { id: "cp-80", name: "80 CP", amount: "80 cod points", price: 6000 },
      { id: "cp-420", name: "420 CP", amount: "420 cod points", price: 30000 },
      { id: "cp-880", name: "880 CP", amount: "880 cod points", price: 60000 }
    ]
  },
  {
    id: "fortnite",
    name: "Fortnite",
    icon: "🪂",
    packages: [
      { id: "vb-1000", name: "1000 V-Bucks", amount: "1000 v-bucks", price: 28000 },
      { id: "vb-2800", name: "2800 V-Bucks", amount: "2800 v-bucks", price: 70000 }
    ]
  },
  {
    id: "lol",
    name: "League of Legends",
    icon: "⚔️",
    packages: [
      { id: "rp-650", name: "650 RP", amount: "650 riot points", price: 18000 },
      { id: "rp-1380", name: "1380 RP", amount: "1380 riot points", price: 35000 }
    ]
  }
];

const PROMO_CODES = {
  BIENVENIDA10: { label: "10% de descuento de bienvenida", percent: 10 },
  GAMER20: { label: "20% de descuento en compras desde $50.000", percent: 20, minTotal: 50000 },
  FINDE15: { label: "15% de descuento de fin de semana", percent: 15 }
};

const PAYMENT_METHODS = [
  { id: "nequi", name: "Nequi", note: "Recibirás un número Nequi para transferir el total. La recarga se activa al confirmar el pago." },
  { id: "pse", name: "PSE / Bancolombia", note: "Te redirigiremos a tu banco para autorizar el débito por el valor total." },
  { id: "tarjeta", name: "Tarjeta crédito / débito", note: "Aceptamos Visa y Mastercard. El cobro se procesa de forma inmediata." },
  { id: "daviplata", name: "Daviplata", note: "Aprueba la transacción desde tu app Daviplata cuando te llegue la notificación." }
];


const KEYS = {
  games: "gametop_games",
  cart: "gametop_cart",
  promo: "gametop_promo",
  orders: "gametop_orders",
  users: "gametop_users",
  session: "gametop_session"
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getGames() { return readJSON(KEYS.games, DEFAULT_GAMES); }
function saveGames(games) { writeJSON(KEYS.games, games); }

function getCart() { return readJSON(KEYS.cart, []); }
function saveCart(cart) { writeJSON(KEYS.cart, cart); updateCartBadge(); }

function getPromo() { return readJSON(KEYS.promo, null); }
function savePromo(promo) { writeJSON(KEYS.promo, promo); }

function getOrders() { return readJSON(KEYS.orders, []); }
function saveOrders(orders) { writeJSON(KEYS.orders, orders); }

function getUsers() { return readJSON(KEYS.users, []); }
function saveUsers(users) { writeJSON(KEYS.users, users); }

function getSession() { return readJSON(KEYS.session, null); }
function setSession(user) { writeJSON(KEYS.session, user); }
function clearSession() { localStorage.removeItem(KEYS.session); }


function money(n) { return "$" + Number(n || 0).toLocaleString("es-CO"); }

function genId(prefix) {
  return prefix + "-" + Math.random().toString(36).slice(2, 7).toUpperCase();
}

let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function updateCartBadge() {
  const count = getCart().reduce((sum, item) => sum + item.qty, 0);
  const badge = document.getElementById("cartCount");
  if (badge) badge.textContent = count;
}

function computeCartTotals() {
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const promo = getPromo();
  let discount = 0;
  if (promo && (!promo.minTotal || subtotal >= promo.minTotal)) {
    discount = Math.round((subtotal * promo.percent) / 100);
  }
  return { subtotal, discount, total: subtotal - discount, promo };
}


let currentGameId = null;

function showView(name) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("is-active"));
  const target = document.getElementById("view-" + name);
  if (target) target.classList.add("is-active");
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (name === "catalogo") renderCatalogo();
  if (name === "juego") renderGameDetail(currentGameId);
  if (name === "carrito") renderCart();
  if (name === "pedidos") renderOrders();
  if (name === "promos") renderPromos();
  if (name === "cuenta") renderAuth();
  if (name === "admin") renderAdmin();
}

document.querySelectorAll("[data-nav]").forEach(btn => {
  btn.addEventListener("click", () => showView(btn.dataset.nav));
});


function renderTicker() {
  const games = getGames();
  const chips = [];
  games.forEach(g => g.packages.forEach(p => chips.push(`${g.icon} ${g.name} · ${p.name} · ${money(p.price)}`)));
  const track = document.getElementById("tickerTrack");
  // Se duplica la lista para que el scroll visual se vea continuo.
  track.innerHTML = chips.concat(chips).map(c => `<span>${c}</span>`).join("<span>&nbsp;&nbsp;·&nbsp;&nbsp;</span>");
}

function renderHeroQuote() {
  const games = getGames();
  const sample = games.slice(0, 4).map(g => {
    const cheapest = g.packages.reduce((a, b) => (a.price < b.price ? a : b));
    return `<div class="cart-summary__row"><span>${g.icon} ${g.name}</span><span>${money(cheapest.price)}</span></div>`;
  }).join("");
  document.getElementById("heroQuote").innerHTML = sample;
  document.getElementById("statGames").textContent = games.length;
  document.getElementById("statPackages").textContent = games.reduce((s, g) => s + g.packages.length, 0);
}

function renderCatalogo(filter) {
  const games = getGames();
  const term = (filter !== undefined ? filter : document.getElementById("searchInput").value).trim().toLowerCase();
  const filtered = games.filter(g => g.name.toLowerCase().includes(term));

  const grid = document.getElementById("gamesGrid");
  grid.innerHTML = filtered.map(g => `
    <button class="game-card" style="text-align:left;padding:20px;display:flex;flex-direction:column;gap:10px;" data-game="${g.id}">
      <span style="font-size:34px;">${g.icon}</span>
      <strong style="font-family:'Chakra Petch',sans-serif;font-size:16px;">${g.name}</strong>
      <span class="muted" style="font-size:12px;">${g.packages.length} paquetes disponibles</span>
      <span class="muted" style="font-size:12px;">Desde ${money(Math.min(...g.packages.map(p => p.price)))}</span>
    </button>
  `).join("");

  grid.querySelectorAll("[data-game]").forEach(card => {
    card.addEventListener("click", () => {
      currentGameId = card.dataset.game;
      showView("juego");
    });
  });

  document.getElementById("gamesEmpty").hidden = filtered.length > 0;
  document.getElementById("searchStatus").textContent = term ? `${filtered.length} resultado(s) para "${term}"` : "";

  renderHeroQuote();
}

document.getElementById("searchInput").addEventListener("input", (e) => renderCatalogo(e.target.value));


function renderGameDetail(gameId) {
  const game = getGames().find(g => g.id === gameId);
  const wrap = document.getElementById("gameDetail");
  if (!game) {
    wrap.innerHTML = `<p class="empty-state">Selecciona un juego desde el catálogo.</p>`;
    return;
  }

  wrap.innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:28px;">
      <span style="font-size:44px;">${game.icon}</span>
      <div>
        <h2 style="font-family:'Chakra Petch',sans-serif;font-size:26px;">${game.name}</h2>
        <p class="muted">Elige tu paquete y agrégalo al carrito.</p>
      </div>
    </div>
    <div class="grid grid--games" id="packagesGrid"></div>
  `;

  const grid = document.getElementById("packagesGrid");
  grid.innerHTML = game.packages.map(p => `
    <div class="card" style="padding:20px;display:flex;flex-direction:column;gap:12px;">
      <strong style="font-family:'Chakra Petch',sans-serif;">${p.name}</strong>
      <span class="muted" style="font-size:12px;">${p.amount}</span>
      <span style="font-size:20px;font-weight:700;">${money(p.price)}</span>
      <button class="btn btn--primary btn--block" data-add="${p.id}">Agregar al carrito</button>
    </div>
  `).join("");

  grid.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => addToCart(game, game.packages.find(p => p.id === btn.dataset.add)));
  });
}

function addToCart(game, pkg) {
  const cart = getCart();
  const existing = cart.find(i => i.packageId === pkg.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ gameId: game.id, gameName: game.name, packageId: pkg.id, name: pkg.name, price: pkg.price, qty: 1 });
  }
  saveCart(cart);
  showToast(`${pkg.name} (${game.name}) agregado al carrito`);
}


function renderCart() {
  const cart = getCart();
  const list = document.getElementById("cartItems");

  list.innerHTML = cart.map((item, i) => `
    <div class="card" style="padding:16px 18px;display:flex;justify-content:space-between;align-items:center;gap:14px;">
      <div>
        <strong>${item.name}</strong>
        <p class="muted" style="font-size:12px;">${item.gameName} · cantidad: ${item.qty}</p>
      </div>
      <div style="display:flex;align-items:center;gap:14px;">
        <span style="font-weight:700;">${money(item.price * item.qty)}</span>
        <button class="btn btn--ghost btn--sm" data-remove="${i}">Quitar</button>
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

  const { subtotal, discount, total, promo } = computeCartTotals();
  document.getElementById("cartSubtotal").textContent = money(subtotal);
  document.getElementById("cartTotal").textContent = money(total);
  const discountRow = document.getElementById("cartDiscountRow");
  discountRow.hidden = discount <= 0;
  document.getElementById("cartDiscount").textContent = "-" + money(discount);
  document.getElementById("promoInput").value = promo ? promo.code : "";
}

document.getElementById("promoForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const code = document.getElementById("promoInput").value.trim().toUpperCase();
  const errorEl = document.getElementById("promoError");
  const found = PROMO_CODES[code];

  if (!code) { savePromo(null); errorEl.hidden = true; renderCart(); return; }

  if (!found) {
    errorEl.textContent = "Ese código de promoción no existe.";
    errorEl.hidden = false;
    return;
  }
  errorEl.hidden = true;
  savePromo({ code, percent: found.percent, minTotal: found.minTotal || 0 });
  showToast(`Código ${code} aplicado: ${found.label}`);
  renderCart();
});


document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (getCart().length === 0) {
    showToast("Tu carrito está vacío");
    return;
  }
  window.location.href = "carrito-checkout.html";
});


function renderOrders() {
  const orders = getOrders().slice().reverse();
  const list = document.getElementById("ordersList");
  list.innerHTML = orders.map(o => `
    <div class="card" style="padding:18px 20px;display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;">
      <div>
        <strong>${o.id}</strong>
        <p class="muted" style="font-size:12px;">${o.items.length} paquete(s) · ${o.paymentLabel}</p>
      </div>
      <div style="display:flex;align-items:center;gap:16px;">
        <span style="font-weight:700;">${money(o.total)}</span>
        <span class="badge" style="position:static;background:${o.status === "completado" ? "var(--secondary)" : o.status === "cancelado" ? "var(--danger)" : "var(--warning)"};color:#0a0e16;border-radius:8px;padding:4px 10px;">${o.status}</span>
      </div>
    </div>
  `).join("");
  document.getElementById("ordersEmpty").hidden = orders.length > 0;
}


function renderPromos() {
  const grid = document.getElementById("promosGrid");
  grid.innerHTML = Object.entries(PROMO_CODES).map(([code, p]) => `
    <div class="promo-card">
      <h3>${code}</h3>
      <p>${p.label}</p>
    </div>
  `).join("");
}


document.getElementById("supportForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const ref = genId("TCK");
  document.getElementById("supportConfirm").hidden = false;
  document.getElementById("supportConfirm").innerHTML = `
    <strong>¡Recibimos tu mensaje!</strong>
    <p class="tiny" style="margin-top:6px;">Número de ticket: ${ref}. Te responderemos al correo indicado.</p>
  `;
  e.target.reset();
});


function renderAuth() {
  const session = getSession();
  const authForms = document.querySelector(".auth-tabs");
  const sessionBox = document.getElementById("authSession");

  if (session) {
    authForms.hidden = true;
    document.querySelectorAll(".auth-form").forEach(f => (f.hidden = true));
    sessionBox.hidden = false;
    document.getElementById("sessionName").textContent = session.name;
  } else {
    authForms.hidden = false;
    sessionBox.hidden = true;
    switchAuthTab("login");
  }
  updateAccountLabel();
}

function switchAuthTab(tab) {
  document.querySelectorAll(".auth-tab").forEach(t => t.classList.toggle("is-active", t.dataset.authTab === tab));
  document.querySelectorAll(".auth-form").forEach(f => (f.hidden = f.dataset.authPanel !== tab));
}

document.querySelectorAll(".auth-tab").forEach(tab => {
  tab.addEventListener("click", () => switchAuthTab(tab.dataset.authTab));
});

function updateAccountLabel() {
  const session = getSession();
  document.getElementById("accountLabel").textContent = session ? session.name.split(" ")[0] : "Ingresar";
}

document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;
  const user = getUsers().find(u => u.email === email && u.password === password);
  const errorEl = document.getElementById("loginError");

  if (!user) {
    errorEl.textContent = "Correo o contraseña incorrectos.";
    errorEl.hidden = false;
    return;
  }
  errorEl.hidden = true;
  setSession({ name: user.name, email: user.email });
  showToast(`¡Bienvenido, ${user.name}!`);
  renderAuth();
});

document.getElementById("registerForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim().toLowerCase();
  const password = document.getElementById("regPassword").value;
  const errorEl = document.getElementById("regError");
  const users = getUsers();

  if (users.some(u => u.email === email)) {
    errorEl.textContent = "Ya existe una cuenta con ese correo.";
    errorEl.hidden = false;
    return;
  }
  errorEl.hidden = true;
  users.push({ name, email, password });
  saveUsers(users);
  setSession({ name, email });
  showToast("Cuenta creada correctamente");
  renderAuth();
});

document.getElementById("recoverForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("recoverEmail").value.trim().toLowerCase();
  const errorEl = document.getElementById("recoverError");
  const step2 = document.getElementById("recoverStep2");
  const users = getUsers();
  const user = users.find(u => u.email === email);

  if (!step2.hidden) {
    const newPass = document.getElementById("recoverNewPassword").value;
    if (!newPass || newPass.length < 4) {
      errorEl.textContent = "La nueva contraseña debe tener al menos 4 caracteres.";
      errorEl.hidden = false;
      return;
    }
    user.password = newPass;
    saveUsers(users);
    errorEl.hidden = true;
    showToast("Contraseña actualizada, ya puedes iniciar sesión");
    switchAuthTab("login");
    step2.hidden = true;
    document.getElementById("recoverSubmitBtn").textContent = "Enviar enlace de recuperación";
    e.target.reset();
    return;
  }

  if (!user) {
    errorEl.textContent = "No encontramos una cuenta con ese correo.";
    errorEl.hidden = false;
    return;
  }
  errorEl.hidden = true;
  step2.hidden = false;
  document.getElementById("recoverSubmitBtn").textContent = "Guardar nueva contraseña";
  showToast("Enlace simulado enviado. Define tu nueva contraseña.");
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  clearSession();
  showToast("Sesión cerrada");
  renderAuth();
});


function renderAdmin() {
  const select = document.getElementById("apGame");
  select.innerHTML = getGames().map(g => `<option value="${g.id}">${g.name}</option>`).join("");

  const orders = getOrders().slice().reverse();
  const list = document.getElementById("adminOrders");
  list.innerHTML = orders.map(o => `
    <div class="card" style="padding:14px 18px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
      <div>
        <strong>${o.id}</strong>
        <p class="muted" style="font-size:12px;">${o.payerEmail} · ${money(o.total)}</p>
      </div>
      <select data-order="${o.id}" style="width:auto;padding:8px 10px;">
        <option value="pendiente" ${o.status === "pendiente" ? "selected" : ""}>Pendiente</option>
        <option value="completado" ${o.status === "completado" ? "selected" : ""}>Completado</option>
        <option value="cancelado" ${o.status === "cancelado" ? "selected" : ""}>Cancelado</option>
      </select>
    </div>
  `).join("");

  list.querySelectorAll("[data-order]").forEach(sel => {
    sel.addEventListener("change", () => {
      const orders2 = getOrders();
      const order = orders2.find(o => o.id === sel.dataset.order);
      order.status = sel.value;
      saveOrders(orders2);
      showToast(`Pedido ${order.id} actualizado a "${sel.value}"`);
    });
  });

  document.getElementById("adminOrdersEmpty").hidden = orders.length > 0;
}

document.getElementById("adminProductForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const games = getGames();
  const gameId = document.getElementById("apGame").value;
  const game = games.find(g => g.id === gameId);
  const newPackage = {
    id: genId("pk").toLowerCase(),
    name: document.getElementById("apName").value.trim(),
    amount: document.getElementById("apAmount").value.trim(),
    price: Number(document.getElementById("apPrice").value)
  };
  game.packages.push(newPackage);
  saveGames(games);

  const successEl = document.getElementById("adminProductSuccess");
  successEl.hidden = false;
  successEl.textContent = `"${newPackage.name}" agregado a ${game.name}.`;
  e.target.reset();
  renderAdmin();
});


updateCartBadge();
renderTicker();
renderHeroQuote();
renderCatalogo("");
updateAccountLabel();

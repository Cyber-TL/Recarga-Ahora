const KEYS = {
  orders: "gametop_orders",
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

function getSession() { return readJSON(KEYS.session, null); }
function clearSession() { localStorage.removeItem(KEYS.session); }
function getOrders() { return readJSON(KEYS.orders, []); }

function money(n) { return "$" + Number(n || 0).toLocaleString("es-CO"); }

let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function statusColor(status) {
  if (status === "completado") return "var(--secondary)";
  if (status === "cancelado") return "var(--danger)";
  return "var(--warning)";
}

function renderPerfil() {
  const session = getSession();

  const card = document.getElementById("perfilCard");
  const sinSesion = document.getElementById("sinSesion");
  const stats = document.getElementById("perfilStats");
  const historial = document.getElementById("historialSection");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!session) {
    card.hidden = true;
    sinSesion.hidden = false;
    stats.hidden = true;
    historial.hidden = true;
    return;
  }

  card.hidden = false;
  sinSesion.hidden = true;
  stats.hidden = false;
  historial.hidden = false;
  logoutBtn.hidden = false;

  document.getElementById("perfilNombre").textContent = session.name;
  document.getElementById("perfilCorreo").textContent = session.email;
  document.getElementById("perfilAvatar").textContent = session.name.charAt(0).toUpperCase();

  const misPedidos = getOrders()
    .filter(o => o.payerEmail === session.email)
    .slice()
    .reverse();

  const totalGastado = misPedidos.reduce((sum, o) => sum + (o.total || 0), 0);

  document.getElementById("statTotalPedidos").textContent = misPedidos.length;
  document.getElementById("statTotalGastado").textContent = money(totalGastado);
  document.getElementById("statUltimoPedido").textContent = misPedidos[0] ? misPedidos[0].id : "—";

  const list = document.getElementById("historialList");
  list.innerHTML = misPedidos.map(o => `
    <div class="card historial-item">
      <div class="historial-item__meta">
        <strong>${o.id}</strong>
        <p class="muted">${(o.items || []).length} paquete(s) · ${o.paymentLabel || "Pago"}</p>
      </div>
      <div class="historial-item__right">
        <span style="font-weight:700;">${money(o.total)}</span>
        <span class="status-pill" style="background:${statusColor(o.status)};">${o.status}</span>
      </div>
    </div>
  `).join("");

  document.getElementById("historialVacio").hidden = misPedidos.length > 0;
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  clearSession();
  showToast("Sesión cerrada");
  renderPerfil();
});

renderPerfil();

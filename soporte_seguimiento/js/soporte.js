const STORAGE_ORDERS_KEY = 'store_orders';
const STORAGE_TICKETS_KEY = 'store_tickets';

const DEFAULT_ORDERS = [
    {
        id: 'ORD-98214',
        email: 'usuario@ejemplo.com',
        date: '2026-03-10',
        items: ['Cyberpunk 2077'],
        total: 59.99,
        status: 'completed', // pending, processing, completed
        licenseKey: 'XXXX-YYYY-ZZZZ-9999'
    },
    {
        id: 'ORD-10432',
        email: 'gamer@ejemplo.com',
        date: '2026-03-12',
        items: ['Elden Ring'],
        total: 69.99,
        status: 'processing',
        licenseKey: 'Generando código...'
    }
];

document.addEventListener('DOMContentLoaded', () => {
    initOrders();
    renderRecentOrders();
    checkUrlTab();

    document.getElementById('trackingForm').addEventListener('submit', (e) => {
        e.preventDefault();
        searchOrder();
    });

    document.getElementById('ticketForm').addEventListener('submit', (e) => {
        e.preventDefault();
        submitTicket();
    });
});

function initOrders() {
    if (!localStorage.getItem(STORAGE_ORDERS_KEY)) {
        localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(DEFAULT_ORDERS));
    }
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('is-active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('is-active'));

    const activeBtn = Array.from(document.querySelectorAll('.tab-btn')).find(b => b.textContent.toLowerCase().includes(tabId));
    if (activeBtn) activeBtn.classList.add('is-active');

    const activeContent = document.getElementById(`tab-${tabId}`);
    if (activeContent) activeContent.classList.add('is-active');
}

function checkUrlTab() {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab) switchTab(tab);
}

function searchOrder() {
    const query = document.getElementById('orderIdInput').value.trim().toLowerCase();
    const orders = JSON.parse(localStorage.getItem(STORAGE_ORDERS_KEY)) || [];
    const resultContainer = document.getElementById('trackingResult');

    const match = orders.find(o => o.id.toLowerCase() === query || o.email.toLowerCase() === query);

    resultContainer.classList.remove('hidden');

    if (!match) {
        resultContainer.innerHTML = `
            <div class="status-card text-center">
                <h3>⚠️ Pedido no encontrado</h3>
                <p class="muted">No encontramos ningún pedido asociado a "${query}". Verifica el código e intenta nuevamente.</p>
            </div>
        `;
        return;
    }

    const statusMap = {
        pending: { label: 'Pendiente de Pago', color: 'var(--warning)', step: 1 },
        processing: { label: 'Procesando / Generando Clave', color: 'var(--primary)', step: 2 },
        completed: { label: 'Completado / Entregado', color: 'var(--secondary)', step: 3 }
    };

    const currentStatus = statusMap[match.status] || statusMap.pending;

    resultContainer.innerHTML = `
        <div class="status-card">
            <div class="status-header">
                <div>
                    <span class="eyebrow">ORDEN: ${match.id}</span>
                    <h3>${match.items.join(', ')}</h3>
                </div>
                <span class="badge" style="background: ${currentStatus.color}22; color: ${currentStatus.color}; border: 1px solid ${currentStatus.color};">
                    ${currentStatus.label}
                </span>
            </div>

            <!-- Línea de tiempo / Stepper -->
            <div class="stepper">
                <div class="step ${currentStatus.step >= 1 ? 'is-complete' : ''}">
                    <div class="step-dot">1</div>
                    <span>Pago Confirmado</span>
                </div>
                <div class="step ${currentStatus.step >= 2 ? 'is-complete' : ''}">
                    <div class="step-dot">2</div>
                    <span>Procesando</span>
                </div>
                <div class="step ${currentStatus.step >= 3 ? 'is-complete' : ''}">
                    <div class="step-dot">3</div>
                    <span>Entregado</span>
                </div>
            </div>

            <div class="key-box">
                <span class="muted">Tu Clave Digital de Activación:</span>
                <code class="license-code">${match.licenseKey}</code>
            </div>
        </div>
    `;
}

function renderRecentOrders() {
    const list = document.getElementById('recentOrdersList');
    const orders = JSON.parse(localStorage.getItem(STORAGE_ORDERS_KEY)) || [];

    if (orders.length === 0) {
        list.innerHTML = '<p class="muted">No tienes pedidos recientes registrados en este navegador.</p>';
        return;
    }

    list.innerHTML = orders.map(order => `
        <div class="order-mini-card" onclick="quickTrack('${order.id}')">
            <div class="order-mini-head">
                <strong>${order.id}</strong>
                <span class="muted">${order.date}</span>
            </div>
            <p>${order.items.join(', ')}</p>
            <div class="order-mini-foot">
                <span>$${parseFloat(order.total).toFixed(2)}</span>
                <span class="btn-link">Ver detalles →</span>
            </div>
        </div>
    `).join('');
}

function quickTrack(orderId) {
    document.getElementById('orderIdInput').value = orderId;
    switchTab('tracking');
    searchOrder();
}

function toggleFaq(button) {
    const item = button.parentElement;
    item.classList.toggle('is-open');
}

function submitTicket() {
    const name = document.getElementById('ticketName').value;
    const email = document.getElementById('ticketEmail').value;
    const category = document.getElementById('ticketCategory').value;
    const message = document.getElementById('ticketMessage').value;

    const tickets = JSON.parse(localStorage.getItem(STORAGE_TICKETS_KEY)) || [];
    
    tickets.push({
        id: 'TCK-' + Math.floor(1000 + Math.random() * 9000),
        name,
        email,
        category,
        message,
        date: new Date().toISOString().split('T')[0]
    });

    localStorage.setItem(STORAGE_TICKETS_KEY, JSON.stringify(tickets));

    document.getElementById('ticketForm').reset();
    showToast('¡Ticket de soporte enviado con éxito! Te responderemos pronto.');
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('is-visible');
    setTimeout(() => toast.classList.remove('is-visible'), 3000);
}

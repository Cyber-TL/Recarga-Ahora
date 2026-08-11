const STORAGE_GAMES_KEY = 'store_games';
const STORAGE_ORDERS_KEY = 'store_orders';

const addGameForm = document.getElementById('addGameForm');
const adminGamesList = document.getElementById('adminGamesList');
const adminOrdersList = document.getElementById('adminOrdersList');
const totalGamesCount = document.getElementById('totalGamesCount');
const totalOrdersCount = document.getElementById('totalOrdersCount');
const toast = document.getElementById('toast');


document.addEventListener('DOMContentLoaded', () => {
    renderAdminGames();
    renderAdminOrders();
});


addGameForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newGame = {
        id: 'game_' + Date.now(),
        title: document.getElementById('gameTitle').value.trim(),
        category: document.getElementById('gameCategory').value,
        price: parseFloat(document.getElementById('gamePrice').value),
        image: document.getElementById('gameImage').value.trim(),
        description: document.getElementById('gameDescription').value.trim()
    };

    const currentGames = getStoredGames();
    currentGames.push(newGame);
    localStorage.setItem(STORAGE_GAMES_KEY, JSON.stringify(currentGames));

    showToast('¡Juego agregado al catálogo!');
    addGameForm.reset();
    renderAdminGames();
});


function renderAdminGames() {
    const games = getStoredGames();
    totalGamesCount.textContent = games.length;

    if (games.length === 0) {
        adminGamesList.innerHTML = `
            <div class="empty-state">
                <p>No hay juegos registrados en el catálogo local.</p>
            </div>`;
        return;
    }

    adminGamesList.innerHTML = games.map(game => `
        <div class="cart-summary__row" style="align-items: center; justify-content: space-between; background: #0d111b; padding: 12px; border-radius: 8px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <img src="${game.image}" alt="${game.title}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 6px;" onerror="this.src='https://via.placeholder.com/45'">
                <div>
                    <strong>${game.title}</strong>
                    <div class="tiny muted">${game.category} - $${game.price.toFixed(2)}</div>
                </div>
            </div>
            <button class="btn btn--ghost btn--sm" style="color: var(--danger);" onclick="deleteGame('${game.id}')">
                Eliminar
            </button>
        </div>
    `).join('');
}

function deleteGame(id) {
    let games = getStoredGames();
    games = games.filter(g => g.id !== id);
    localStorage.setItem(STORAGE_GAMES_KEY, JSON.stringify(games));
    showToast('Juego eliminado del catálogo');
    renderAdminGames();
}

function renderAdminOrders() {
    const orders = getStoredOrders();
    totalOrdersCount.textContent = orders.length;

    if (orders.length === 0) {
        adminOrdersList.innerHTML = `
            <div class="empty-state">
                <p>No se han registrado compras aún.</p>
            </div>`;
        return;
    }

    adminOrdersList.innerHTML = orders.map(order => `
        <div style="background: #0d111b; padding: 15px; border-radius: 8px; border: 1px solid var(--border);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <strong>Orden #${order.id || 'N/A'}</strong>
                <span class="dot dot--live">${order.status || 'Completado'}</span>
            </div>
            <div class="tiny muted">Cliente: ${order.customer || 'Anónimo'}</div>
            <div class="tiny muted">Total: $${parseFloat(order.total || 0).toFixed(2)}</div>
        </div>
    `).join('');
}


function getStoredGames() {
    return JSON.parse(localStorage.getItem(STORAGE_GAMES_KEY)) || [];
}

function getStoredOrders() {
    return JSON.parse(localStorage.getItem(STORAGE_ORDERS_KEY)) || [];
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    setTimeout(() => {
        toast.classList.remove('is-visible');
    }, 3000);
}

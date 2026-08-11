const STORAGE_GAMES_KEY = 'store_games';
const STORAGE_CART_KEY = 'store_cart';

const DEFAULT_GAMES = [
    {
        id: '1',
        title: 'Cyberpunk 2077',
        category: 'RPG',
        price: 59.99,
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
        description: 'Cyberpunk 2077 es un RPG de acción y aventura en mundo abierto ambientado en la megalópolis de Night City, donde juegas como un mercenario urbano.'
    },
    {
        id: '2',
        title: 'Elden Ring',
        category: 'Acción',
        price: 69.99,
        image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80',
        description: 'EL NUEVO JUEGO DE ROL Y ACCIÓN DE AMBIENTACIÓN FANTÁSTICA. Levántate, Sinluz, y que la gracia te guíe para abrazar el poder del Círculo de Elden.'
    }
];

document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    loadProductDetail();
});

function loadProductDetail() {
    const container = document.getElementById('productContainer');

    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('id') || localStorage.getItem('selected_game_id');

    const games = getStoredGames();
    const game = games.find(g => String(g.id) === String(gameId)) || games[0];

    if (!game) {
        container.innerHTML = `
            <div class="empty-state">
                <h2>Juego no encontrado</h2>
                <p>El producto que buscas no existe o fue eliminado.</p>
                <a href="index.html" class="btn btn--primary" style="margin-top: 15px;">Ir a la Tienda</a>
            </div>`;
        return;
    }

    document.title = `${game.title} | Gaming Store`;

    container.innerHTML = `
        <div class="product-media">
            <img src="${game.image}" alt="${game.title}" class="product-cover" onerror="this.src='https://via.placeholder.com/600x400'">
        </div>
        
        <div class="product-info">
            <span class="eyebrow">${game.category}</span>
            <h1 class="product-title">${game.title}</h1>
            
            <div class="product-price">$${parseFloat(game.price).toFixed(2)} USD</div>
            
            <p class="product-description">${game.description}</p>
            
            <div class="product-actions">
                <button class="btn btn--primary btn--block" onclick="addToCart('${game.id}')">
                    🛒 Añadir al Carrito
                </button>
                <a href="index.html" class="btn btn--ghost btn--block">
                    Volver al Catálogo
                </a>
            </div>

            <div class="product-specs">
                <div class="spec-item">
                    <span class="muted">Plataforma</span>
                    <strong>PC / Digital Key</strong>
                </div>
                <div class="spec-item">
                    <span class="muted">Entrega</span>
                    <strong>Inmediata</strong>
                </div>
                <div class="spec-item">
                    <span class="muted">Estado</span>
                    <strong style="color: var(--secondary);">Disponible</strong>
                </div>
            </div>
        </div>
    `;
}

function getStoredGames() {
    const stored = localStorage.getItem(STORAGE_GAMES_KEY);
    if (!stored) {
        localStorage.setItem(STORAGE_GAMES_KEY, JSON.stringify(DEFAULT_GAMES));
        return DEFAULT_GAMES;
    }
    return JSON.parse(stored);
}

function addToCart(gameId) {
    const games = getStoredGames();
    const game = games.find(g => String(g.id) === String(gameId));
    if (!game) return;

    let cart = JSON.parse(localStorage.getItem(STORAGE_CART_KEY)) || [];
    cart.push(game);
    localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));

    updateCartBadge();
    showToast(`¡${game.title} añadido al carrito!`);
}

function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem(STORAGE_CART_KEY)) || [];
    const badge = document.getElementById('cartBadge');
    if (badge) badge.textContent = cart.length;
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('is-visible');
    setTimeout(() => toast.classList.remove('is-visible'), 3000);
}

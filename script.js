import { productService } from './services/productService.js';

let products = [];
let cart = JSON.parse(localStorage.getItem('uc_market_cart')) || [];
let currentCategory = 'todos';
let currentSearch = '';
let currentSort = 'default';
let discountApplied = false;

document.addEventListener('DOMContentLoaded', async () => {
    if (window.lucide) window.lucide.createIcons();
    updateCartUI();
    await refreshCatalog();
    setupControls();
    setupCartDrawer();
    setupProductModal();
    setupClipboardPromo();
    setupContactForm();
});

async function refreshCatalog() {
    const container = document.getElementById('products-grid');
    const countLabel = document.getElementById('results-count');
    const statusLabel = document.getElementById('service-status');

    if (!container) return;

    container.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-16 text-brand-800">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-700 mb-3"></div>
            <p class="font-bold text-sm">Consultando servicio REST de Continental Market...</p>
        </div>
    `;

    const response = await productService.queryProducts({
        category: currentCategory,
        search: currentSearch,
        sort: currentSort
    });

    products = response.data;

    if (statusLabel) {
        statusLabel.innerHTML = `
            <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            Origen de datos: <strong class="text-brand-900">${response.source}</strong>
        `;
    }

    if (countLabel) {
        countLabel.textContent = `${products.length} ${products.length === 1 ? 'producto' : 'productos'}`;
    }

    renderProducts(products);
}

function renderProducts(list) {
    const container = document.getElementById('products-grid');
    container.innerHTML = '';

    if (list.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-14 bg-white rounded-3xl border border-slate-200">
                <p class="font-bold text-slate-700">No se encontraron productos con ese criterio</p>
                <p class="text-xs text-slate-500 mt-1">Intenta con otra palabra clave o selecciona "Todos".</p>
            </div>
        `;
        return;
    }

    list.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs flex flex-col justify-between p-4 group';
        card.innerHTML = `
            <div>
                <div onclick="window.openProductModal(${p.id})" class="h-52 overflow-hidden bg-purple-50/50 rounded-2xl relative flex items-center justify-center p-5 mb-4 cursor-pointer">
                    <span class="absolute top-3 left-3 bg-white/95 text-brand-950 text-[10px] font-extrabold px-3 py-1 rounded-full shadow-xs border border-purple-100">
                        ${p.category.toUpperCase()}
                    </span>
                    <span class="absolute bottom-3 right-3 bg-brand-950/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition">
                        Vista rápida
                    </span>
                    <img src="${p.image}" alt="${p.name}" class="max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                         onerror="this.parentElement.innerHTML='<div class=\\'text-brand-800 font-black text-center\\'>UC MARKET</div>'">
                </div>
                <h3 onclick="window.openProductModal(${p.id})" class="font-bold text-slate-900 text-base mb-1 hover:text-brand-800 transition cursor-pointer line-clamp-1">${p.name}</h3>
                <p class="text-xs text-slate-500 mb-4 flex items-center gap-2">
                    <span class="text-amber-500 font-bold">★ ${p.rating}</span>
                    <span>•</span>
                    <span>Stock: ${p.stock} unid.</span>
                </p>
            </div>
            <div class="flex items-center justify-between pt-3 border-t border-slate-100">
                <div>
                    <span class="text-[11px] text-slate-400 block font-medium">Precio</span>
                    <span class="text-lg font-black text-brand-950">S/ ${p.price.toFixed(2)}</span>
                </div>
                <button onclick="window.addToCart(${p.id})" class="bg-brand-800 hover:bg-brand-700 active:scale-95 text-white px-4 h-10 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs shadow-sm transition cursor-pointer">
                    <span>+ Agregar</span>
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

function setupControls() {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            buttons.forEach(b => {
                b.classList.remove('bg-brand-800', 'text-white');
                b.classList.add('bg-slate-100', 'text-slate-700');
            });
            e.currentTarget.classList.remove('bg-slate-100', 'text-slate-700');
            e.currentTarget.classList.add('bg-brand-800', 'text-white');

            currentCategory = e.currentTarget.getAttribute('data-category');
            refreshCatalog();
        });
    });

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value;
            refreshCatalog();
        });
    }

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            refreshCatalog();
        });
    }
}

function setupProductModal() {
    const modal = document.getElementById('product-modal');
    const closeBtn = document.getElementById('close-modal-btn');

    window.openProductModal = (id) => {
        const p = products.find(item => item.id === id);
        if (!p || !modal) return;

        document.getElementById('modal-img').src = p.image;
        document.getElementById('modal-cat').textContent = p.category;
        document.getElementById('modal-title').textContent = p.name;
        document.getElementById('modal-rating').textContent = `★ ${p.rating} / 5.0 • Disponible (${p.stock} unidades)`;
        document.getElementById('modal-desc').textContent = p.description;
        document.getElementById('modal-price').textContent = `S/ ${p.price.toFixed(2)}`;

        const addBtn = document.getElementById('modal-add-btn');
        addBtn.onclick = () => {
            window.addToCart(p.id);
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        };

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    };

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        });
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        });
    }
}

function saveCart() {
    localStorage.setItem('uc_market_cart', JSON.stringify(cart));
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove('opacity-0');
    setTimeout(() => toast.classList.add('opacity-0'), 2200);
}

window.addToCart = (id) => {
    const item = products.find(p => p.id === id);
    if (!item) return;

    const existing = cart.find(c => c.id === id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...item, qty: 1 });
    }
    saveCart();
    updateCartUI();
    showToast(`✓ ${item.name} agregado al carrito`);
};

window.changeQty = (id, delta) => {
    const item = cart.find(c => c.id === id);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
        cart = cart.filter(c => c.id !== id);
    }
    saveCart();
    updateCartUI();
};

function updateCartUI() {
    const countBadge = document.getElementById('cart-count');
    const itemsContainer = document.getElementById('cart-items');
    const subtotalEl = document.getElementById('cart-subtotal');
    const discountRow = document.getElementById('discount-row');
    const discountEl = document.getElementById('cart-discount');
    const totalEl = document.getElementById('cart-total');

    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const discount = discountApplied ? subtotal * 0.15 : 0;
    const finalTotal = subtotal - discount;

    if (countBadge) countBadge.textContent = totalQty;
    if (subtotalEl) subtotalEl.textContent = `S/ ${subtotal.toFixed(2)}`;

    if (discountRow && discountEl) {
        if (discountApplied && subtotal > 0) {
            discountRow.classList.remove('hidden');
            discountRow.classList.add('flex');
            discountEl.textContent = `- S/ ${discount.toFixed(2)}`;
        } else {
            discountRow.classList.add('hidden');
            discountRow.classList.remove('flex');
        }
    }

    if (totalEl) totalEl.textContent = `S/ ${finalTotal.toFixed(2)}`;
    if (!itemsContainer) return;

    if (cart.length === 0) {
        itemsContainer.innerHTML = `
            <div class="text-center py-12">
                <p class="text-slate-400 font-semibold text-sm">Tu carrito está vacío</p>
                <p class="text-xs text-slate-400 mt-1">Explora el catálogo y agrega productos oficiales.</p>
            </div>
        `;
        return;
    }

    itemsContainer.innerHTML = cart.map(item => `
        <div class="flex items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
            <img src="${item.image}" alt="${item.name}" class="w-14 h-14 object-contain bg-white rounded-xl p-1.5 border border-slate-100 shrink-0">
            <div class="flex-grow min-w-0">
                <h4 class="font-bold text-xs text-slate-800 truncate">${item.name}</h4>
                <span class="text-xs font-black text-brand-800 block mt-0.5">S/ ${(item.price * item.qty).toFixed(2)}</span>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
                <button onclick="window.changeQty(${item.id}, -1)" class="w-7 h-7 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg font-bold text-xs cursor-pointer">-</button>
                <span class="text-xs font-extrabold w-5 text-center">${item.qty}</span>
                <button onclick="window.changeQty(${item.id}, 1)" class="w-7 h-7 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg font-bold text-xs cursor-pointer">+</button>
            </div>
        </div>
    `).join('');
}

function setupCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const panel = document.getElementById('cart-panel');
    const openBtn = document.getElementById('open-cart-btn');
    const closeBtn = document.getElementById('close-cart-btn');
    const backdrop = document.getElementById('cart-backdrop');
    const checkoutBtn = document.getElementById('checkout-btn');
    const applyCouponBtn = document.getElementById('apply-coupon-btn');
    const couponInput = document.getElementById('coupon-input');
    const couponMsg = document.getElementById('coupon-msg');

    const open = () => {
        drawer.classList.remove('pointer-events-none', 'opacity-0');
        panel.classList.remove('translate-x-full');
    };

    const close = () => {
        drawer.classList.add('pointer-events-none', 'opacity-0');
        panel.classList.add('translate-x-full');
    };

    if (openBtn) openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (backdrop) backdrop.addEventListener('click', close);

    if (applyCouponBtn && couponInput && couponMsg) {
        applyCouponBtn.addEventListener('click', () => {
            const code = couponInput.value.trim().toUpperCase();
            couponMsg.classList.remove('hidden', 'text-emerald-600', 'text-red-600');
            if (code === 'SOYCONTINENTAL') {
                discountApplied = true;
                couponMsg.textContent = '✓ Cupón SOYCONTINENTAL aplicado (15% de descuento)';
                couponMsg.classList.add('text-emerald-600');
                updateCartUI();
            } else {
                discountApplied = false;
                couponMsg.textContent = '✕ Código inválido. Usa SOYCONTINENTAL';
                couponMsg.classList.add('text-red-600');
                updateCartUI();
            }
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) return alert('Agrega productos antes de finalizar tu pedido.');
            alert('¡Pedido registrado con éxito en Continental Market! Recibirás el comprobante en tu correo institucional.');
            cart = [];
            discountApplied = false;
            saveCart();
            updateCartUI();
            close();
        });
    }
}

function setupClipboardPromo() {
    const btn = document.getElementById('copy-promo-btn');
    const txt = document.getElementById('promo-text');
    if (btn && txt) {
        btn.addEventListener('click', () => {
            navigator.clipboard.writeText('SOYCONTINENTAL');
            txt.textContent = '¡CÓDIGO COPIADO!';
            showToast('✓ Código SOYCONTINENTAL copiado al portapapeles');
            setTimeout(() => txt.textContent = 'SOYCONTINENTAL', 2000);
        });
    }
}

function setupContactForm() {
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('✓ Consulta enviada correctamente');
            form.reset();
        });
    }
}
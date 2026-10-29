const products = [
    { 
        id: 1, 
        name: "Hoodie Polerón UC Morado", 
        category: "ropa", 
        price: 89.90, 
        image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80" 
    },
    { 
        id: 2, 
        name: "Mochila Ergonómica Continental Tech", 
        category: "mochilas", 
        price: 119.00, 
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80" 
    },
    { 
        id: 3, 
        name: "Mouse Inalámbrico Recargable", 
        category: "tecnologia", 
        price: 45.00, 
        image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80" 
    },
    { 
        id: 4, 
        name: "Polera Deportiva Continental", 
        category: "ropa", 
        price: 49.90, 
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80" 
    },
    { 
        id: 5, 
        name: "Cuaderno Anillado UC 200 Hojas", 
        category: "papeleria", 
        price: 18.50, 
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80" 
    },
    { 
        id: 6, 
        name: "Audífonos Bluetooth Over-Ear", 
        category: "tecnologia", 
        price: 129.90, 
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80" 
    },
    { 
        id: 7, 
        name: "Tomatodo Térmico Acero UC", 
        category: "mochilas", 
        price: 35.00, 
        image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80" 
    },
    { 
        id: 8, 
        name: "Set de Lapiceros Gel + Resaltadores", 
        category: "papeleria", 
        price: 15.00, 
        image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80" 
    }
];

let cart = [];

function renderProducts(category = "todos") {
    const container = document.getElementById("products-grid");
    if (!container) return;
    container.innerHTML = "";

    const filtered = category === "todos" 
        ? products 
        : products.filter(p => p.category === category);

    filtered.forEach(p => {
        const card = document.createElement("div");
        card.className = "product-card bg-white rounded-3xl overflow-hidden border border-purple-100/80 shadow-sm flex flex-col";
        card.innerHTML = `
            <div class="h-52 overflow-hidden bg-purple-50 relative flex items-center justify-center">
                <img src="${p.image}" 
                     alt="${p.name}" 
                     class="w-full h-full object-cover"
                     onerror="this.onerror=null; this.src='https://placehold.co/600x400/5b21b6/ffffff?text=${encodeURIComponent(p.name)}';">
                <span class="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-brand-900 font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    ${p.category}
                </span>
            </div>
            <div class="p-6 flex flex-col flex-grow">
                <h3 class="font-extrabold text-gray-900 text-base mb-3 leading-snug">${p.name}</h3>
                <div class="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                        <span class="text-xs text-gray-400 block font-medium">Precio</span>
                        <span class="text-xl font-black text-brand-950">S/ ${p.price.toFixed(2)}</span>
                    </div>
                    <button onclick="addToCart(${p.id})" class="bg-brand-800 hover:bg-brand-900 text-white p-3 rounded-2xl transition-all shadow-md shadow-brand-900/20 active:scale-95 flex items-center justify-center">
                        <i data-lucide="plus" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
    if (window.lucide) lucide.createIcons();
}

function addToCart(id) {
    const item = cart.find(x => x.id === id);
    if (item) {
        item.quantity++;
    } else {
        const product = products.find(x => x.id === id);
        if (product) cart.push({ ...product, quantity: 1 });
    }
    updateCart();
    openCart();
}

function removeFromCart(id) {
    cart = cart.filter(x => x.id !== id);
    updateCart();
}

function changeQuantity(id, delta) {
    const item = cart.find(x => x.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            updateCart();
        }
    }
}

function updateCart() {
    const container = document.getElementById("cart-items");
    const countEl = document.getElementById("cart-count");
    const totalEl = document.getElementById("cart-total");

    if (!container || !countEl || !totalEl) return;

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    countEl.textContent = totalItems;
    totalEl.textContent = `S/ ${totalPrice.toFixed(2)}`;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="text-center py-16 text-gray-400 flex flex-col items-center justify-center">
                <div class="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-3 text-purple-300">
                    <i data-lucide="shopping-bag" class="w-8 h-8"></i>
                </div>
                <p class="font-medium text-sm text-gray-500">Tu carrito está vacío</p>
                <p class="text-xs text-gray-400 mt-1">¡Añade algunos productos para comenzar!</p>
            </div>
        `;
    } else {
        container.innerHTML = cart.map(item => `
            <div class="py-4 flex items-center space-x-4">
                <img src="${item.image}" 
                     class="w-16 h-16 object-cover rounded-xl shadow-sm border border-purple-100"
                     onerror="this.onerror=null; this.src='https://placehold.co/100x100/5b21b6/ffffff?text=UC';">
                <div class="flex-grow">
                    <h4 class="font-bold text-xs text-gray-900 line-clamp-1">${item.name}</h4>
                    <span class="text-xs font-black text-brand-900">S/ ${item.price.toFixed(2)}</span>
                    <div class="flex items-center space-x-2 mt-2">
                        <button onclick="changeQuantity(${item.id}, -1)" class="w-6 h-6 bg-gray-100 hover:bg-purple-100 text-gray-700 rounded-lg text-xs flex items-center justify-center font-bold transition">-</button>
                        <span class="text-xs font-bold text-gray-800 px-1">${item.quantity}</span>
                        <button onclick="changeQuantity(${item.id}, 1)" class="w-6 h-6 bg-gray-100 hover:bg-purple-100 text-gray-700 rounded-lg text-xs flex items-center justify-center font-bold transition">+</button>
                    </div>
                </div>
                <button onclick="removeFromCart(${item.id})" class="text-gray-300 hover:text-red-500 p-1.5 rounded-lg transition">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
        `).join('');
    }
    if (window.lucide) lucide.createIcons();
}

const modal = document.getElementById("cart-modal");
const drawer = document.getElementById("cart-drawer");

function openCart() {
    if (modal && drawer) {
        modal.classList.remove("opacity-0", "pointer-events-none");
        drawer.classList.remove("translate-x-full");
    }
}

function closeCart() {
    if (modal && drawer) {
        modal.classList.add("opacity-0", "pointer-events-none");
        drawer.classList.add("translate-x-full");
    }
}

document.getElementById("cart-btn")?.addEventListener("click", openCart);
document.getElementById("close-cart")?.addEventListener("click", closeCart);
modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeCart();
});

document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        document.querySelectorAll(".filter-btn").forEach(b => {
            b.classList.remove("active", "bg-brand-800", "text-white", "shadow-md");
            b.classList.add("bg-white", "text-gray-600");
        });
        e.target.classList.add("active", "bg-brand-800", "text-white", "shadow-md");
        e.target.classList.remove("bg-white", "text-gray-600");
        
        renderProducts(e.target.dataset.category);
    });
});

document.getElementById("contact-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const feedback = document.getElementById("form-feedback");
    if (feedback) {
        feedback.className = "mt-4 p-4 rounded-xl text-sm text-center bg-purple-100 text-brand-950 font-semibold block border border-purple-200";
        feedback.textContent = "¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.";
        e.target.reset();
        setTimeout(() => { feedback.classList.add("hidden"); }, 4000);
    }
});

document.getElementById("checkout-btn")?.addEventListener("click", () => {
    if (cart.length === 0) {
        alert("Agrega productos al carrito antes de finalizar la compra.");
        return;
    }
    alert("¡Pedido realizado con éxito! Gracias por tu compra en Continental Market.");
    cart = [];
    updateCart();
    closeCart();
});

document.addEventListener("DOMContentLoaded", () => {
    renderProducts();
    updateCart();
    if (window.lucide) lucide.createIcons();
});
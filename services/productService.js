/**
 * Capa de Servicio: productService.js
 * Responsabilidad: Gestionar el consumo asíncrono desde FakeStore API,
 * mapear los productos al catálogo institucional de la Universidad Continental,
 * y proveer filtrado, búsqueda y ordenamiento desacoplados de la vista.
 */

const API_BASE_URL = 'https://fakestoreapi.com/products';

const UC_BRANDING_MAP = [
    {
        id: 1,
        name: "Mochila Ergonómica Continental Tech",
        category: "Mochilas",
        price: 119.00,
        image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
        description: "Mochila resistente al agua con compartimento acolchado para laptop de hasta 15.6 pulgadas y emblema bordado de la Universidad Continental.",
        rating: 4.9,
        stock: 24
    },
    {
        id: 2,
        name: "Polo Ranglan Manga Larga UC",
        category: "Ropa UC",
        price: 49.90,
        image: "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg",
        description: "Polo de algodón peruano pima de corte moderno con mangas contrastantes, ideal para actividades académicas y deportivas.",
        rating: 4.8,
        stock: 35
    },
    {
        id: 3,
        name: "Casaca Institucional Continental",
        category: "Ropa UC",
        price: 129.00,
        image: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg",
        description: "Casaca térmica de alta durabilidad con cierre frontal reforzado, bolsillos laterales y acabado cortaviento.",
        rating: 4.7,
        stock: 18
    },
    {
        id: 4,
        name: "Polera Deportiva UC Azul",
        category: "Ropa UC",
        price: 59.90,
        image: "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg",
        description: "Polera ligera y transpirable diseñada para el confort diario en campus o entrenamientos universitarios.",
        rating: 4.6,
        stock: 40
    },
    {
        id: 5,
        name: "Pulsera Eslabones Colección UC",
        category: "Accesorios",
        price: 45.00,
        image: "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg",
        description: "Pulsera metálica de edición conmemorativa con detalles grabados de alta precisión.",
        rating: 4.8,
        stock: 20
    },
    {
        id: 6,
        name: "Anillo Minimalista Plateado",
        category: "Accesorios",
        price: 39.00,
        image: "https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_.jpg",
        description: "Anillo elegante con acabado pulido brillante en acero quirúrgico hipoalergénico.",
        rating: 4.5,
        stock: 15
    },
    {
        id: 7,
        name: "Anillo de Graduación UC",
        category: "Accesorios",
        price: 89.90,
        image: "https://fakestoreapi.com/img/71YAIFU48IL._AC_UL640_QL65_ML3_.jpg",
        description: "Anillo conmemorativo de promoción universitaria con engaste central brillante y estuche institucional.",
        rating: 4.9,
        stock: 12
    },
    {
        id: 8,
        name: "Aretes Acero Rose Gold",
        category: "Accesorios",
        price: 29.90,
        image: "https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_QL65_ML3_.jpg",
        description: "Par de argollas en acero inoxidable con baño dorado rosa resistente al uso diario.",
        rating: 4.4,
        stock: 28
    }
];

export const productService = {
    async getProducts() {
        try {
            const response = await fetch(`${API_BASE_URL}?limit=8`);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

            const apiData = await response.json();

            const mappedData = apiData.map((item, index) => {
                const ucMeta = UC_BRANDING_MAP[index];
                return {
                    id: item.id,
                    name: ucMeta ? ucMeta.name : item.title,
                    category: ucMeta ? ucMeta.category : "Accesorios",
                    price: ucMeta ? ucMeta.price : parseFloat((item.price * 3.75).toFixed(2)),
                    image: item.image,
                    description: ucMeta ? ucMeta.description : item.description,
                    rating: item.rating?.rate || 4.8,
                    stock: item.rating?.count || 20
                };
            });

            return { data: mappedData, source: 'API REST (FakeStore API • 200 OK)' };
        } catch (error) {
            console.warn("[ProductService]: Usando catálogo local de respaldo:", error);
            return { data: UC_BRANDING_MAP, source: 'Servicio Local de Respaldo' };
        }
    },

    async queryProducts({ category = 'todos', search = '', sort = 'default' } = {}) {
        const result = await this.getProducts();
        let filtered = [...result.data];

        if (category !== 'todos') {
            filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
        }

        if (search.trim() !== '') {
            const term = search.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(term) ||
                p.category.toLowerCase().includes(term)
            );
        }

        if (sort === 'price-asc') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sort === 'price-desc') {
            filtered.sort((a, b) => b.price - a.price);
        }

        return { data: filtered, source: result.source };
    }
};
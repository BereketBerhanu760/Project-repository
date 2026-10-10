export const dishes = [
  { 
    id: "doro-wot", 
    name: "Doro Wot", 
    category: "Classics", 
    price: 300, 
    emoji: "🍛", 
    image: "/images/doro_wat.jpg",
    imageWidth: 1024,
    imageHeight: 732,
    description: "Our signature chicken stew, gently simmered with berbere, niter kibbeh, and a soft-boiled egg." 
  },
  { 
    id: "misir-wot", 
    name: "Misir Wot", 
    category: "Vegan", 
    price: 150, 
    emoji: "🥘", 
    image: "/images/misir_wat.jpg",
    imageWidth: 447,
    imageHeight: 447,
    description: "Red lentils cooked low and slow with berbere, garlic, and a touch of ginger." 
  },
  { 
    id: "gomen", 
    name: "Gomen", 
    category: "Vegan", 
    price: 100, 
    emoji: "🥬", 
    image: null,
    description: "Tender collard greens with garlic, ginger, and a bright squeeze of lemon." 
  },
  { 
    id: "kitfo", 
    name: "Kitfo", 
    category: "Classics", 
    price: 300, 
    emoji: "🥩", 
    image: "/images/kitfo.jpg",
    imageWidth: 619,
    imageHeight: 495,
    description: "Minced beef seasoned with mitmita and clarified spiced butter, served with ayib." 
  },
  { 
    id: "shiro", 
    name: "Shiro", 
    category: "Vegan", 
    price: 150, 
    emoji: "🍲", 
    image: "/images/shiro_wat.jpg",
    imageWidth: 1200,
    imageHeight: 1200,
    description: "Silky chickpea stew with tomato, garlic, and a gentle berbere warmth." 
  },
  { 
    id: "tibs", 
    name: "Tibs", 
    category: "Classics", 
    price: 350, 
    emoji: "🍖", 
    image: "/images/tibs.jpg",
    imageWidth: 500,
    imageHeight: 500,
    description: "Sizzling strips of beef with rosemary, onion, peppers, and a little fire." 
  },
];

export const DISHES_PER_PAGE = 3;

export function getDish(id) {
  return dishes.find((dish) => dish.id === id);
}

export function getDishPage({ category = "all", query = "", page = 1 } = {}) {
  const normalizedCategory = category.toLowerCase();
  const normalizedQuery = query.trim().toLowerCase();
  const matchingDishes = dishes.filter((dish) => {
    const categoryMatches = normalizedCategory === "all"
      || dish.category.toLowerCase() === normalizedCategory;
    const queryMatches = !normalizedQuery
      || [dish.name, dish.category, dish.description]
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    return categoryMatches && queryMatches;
  });
  const totalPages = Math.max(1, Math.ceil(matchingDishes.length / DISHES_PER_PAGE));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * DISHES_PER_PAGE;

  return {
    dishes: matchingDishes.slice(start, start + DISHES_PER_PAGE),
    page: currentPage,
    pageSize: DISHES_PER_PAGE,
    total: matchingDishes.length,
    totalPages,
  };
}
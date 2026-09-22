export const dishes = [
  {
    id: 1,
    name: 'Doro Wat',
    description: 'Spicy chicken stew with injera.',
    price: 220,
    image: '/images/doro-wat.jpg'
  },
  {
    id: 2,
    name: 'Kitfo',
    description: 'Minced beef with mitmita and ayib.',
    price: 260,
    image: '/images/kitfo.jpg'
  },
  {
    id: 3,
    name: 'Tibs',
    description: 'Sautéed beef cubes with onions and peppers.',
    price: 240,
    image: '/images/tibs.jpg'
  }
];

export async function getDishes() {
  return dishes;
}

const express = require('express');
const router = express.Router();
const db = require('../utils/db');

const CATEGORY_ICONS = {
  'Cement & Concrete': '🧱',
  'Steel & TMT Bars': '🔩',
  'Bricks & Blocks': '🧱',
  'Sand & Aggregates': '⛰️',
  'Doors & Windows': '🚪',
  'Plumbing Supplies': '🔧',
  'Electrical Supplies': '🔌',
  'Paints & Coatings': '🎨',
  'Hardware & Fasteners': '🔨',
  'Tools & Safety': '⛑️',
  'Tiles & Sanitary': '🚿'
};

router.get('/', (req, res) => {
  const products = db.getProducts();
  const categories = db.getCategories();
  const dealOfDay = products[0];
  const topSteel = products.find(p => p.category === 'Steel & TMT Bars');
  const featuredTiles = products.find(p => p.category === 'Tiles & Sanitary');
  const trending = products.slice(0, 8);

  res.render('home', {
    title: 'Jipkart - Everything You Need. All in One Place.',
    categories,
    categoryIcons: CATEGORY_ICONS,
    dealOfDay,
    topSteel,
    featuredTiles,
    trending
  });
});

router.get('/products', (req, res) => {
  let products = db.getProducts();
  const categories = db.getCategories();
  const { category, q, sort } = req.query;

  if (category) {
    products = products.filter(p => p.category === category);
  }
  if (q) {
    const query = q.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );
  }
  if (sort === 'price_low') products = [...products].sort((a, b) => a.price - b.price);
  if (sort === 'price_high') products = [...products].sort((a, b) => b.price - a.price);

  res.render('products', {
    title: category ? `${category} - Jipkart` : 'All Products - Jipkart',
    products,
    categories,
    categoryIcons: CATEGORY_ICONS,
    activeCategory: category || null,
    query: q || '',
    sort: sort || ''
  });
});

router.get('/products/:id', (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product) {
    return res.status(404).render('error', { title: 'Not Found', message: 'Product not found.' });
  }
  const seller = db.getUserById(product.sellerId);
  const related = db.getProducts().filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  res.render('product-detail', {
    title: `${product.name} - Jipkart`,
    product,
    seller,
    related
  });
});

module.exports = router;

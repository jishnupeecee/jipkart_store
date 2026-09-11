const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { requireRole } = require('../middleware/auth');

router.use('/seller', requireRole('seller'));

router.get('/seller/dashboard', (req, res) => {
  const products = db.getProductsBySeller(req.session.user.id);
  const orders = db.getOrders().filter(o => o.items.some(i => i.sellerId === req.session.user.id));

  const totalSales = orders.reduce((sum, o) => {
    const mine = o.items.filter(i => i.sellerId === req.session.user.id);
    return sum + mine.reduce((s, i) => s + i.price * i.qty, 0);
  }, 0);

  res.render('seller/dashboard', {
    title: 'Seller Dashboard - Jipkart',
    products,
    orders,
    totalSales,
    stats: {
      productCount: products.length,
      lowStock: products.filter(p => p.stock < 20).length,
      orderCount: orders.length
    }
  });
});

router.get('/seller/products/new', (req, res) => {
  res.render('seller/product-form', { title: 'Add Product - Jipkart', product: null, error: null });
});

router.post('/seller/products/new', (req, res) => {
  const { name, category, price, mrp, unit, stock, image, description } = req.body;
  if (!name || !category || !price || !unit || !stock) {
    return res.render('seller/product-form', { title: 'Add Product - Jipkart', product: req.body, error: 'Please fill all required fields.' });
  }
  db.createProduct({
    sellerId: req.session.user.id,
    name,
    category,
    price: Number(price),
    mrp: mrp ? Number(mrp) : Number(price),
    unit,
    stock: Number(stock),
    image: image || 'https://picsum.photos/seed/product/500/400',
    description: description || ''
  });
  res.redirect('/seller/dashboard');
});

router.get('/seller/products/:id/edit', (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product || product.sellerId !== req.session.user.id) {
    return res.status(403).render('error', { title: 'Access Denied', message: 'You cannot edit this product.' });
  }
  res.render('seller/product-form', { title: 'Edit Product - Jipkart', product, error: null });
});

router.post('/seller/products/:id/edit', (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product || product.sellerId !== req.session.user.id) {
    return res.status(403).render('error', { title: 'Access Denied', message: 'You cannot edit this product.' });
  }
  const { name, category, price, mrp, unit, stock, image, description } = req.body;
  db.updateProduct(product.id, {
    name, category,
    price: Number(price),
    mrp: mrp ? Number(mrp) : Number(price),
    unit,
    stock: Number(stock),
    image: image || product.image,
    description: description || ''
  });
  res.redirect('/seller/dashboard');
});

router.post('/seller/products/:id/delete', (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product || product.sellerId !== req.session.user.id) {
    return res.status(403).render('error', { title: 'Access Denied', message: 'You cannot delete this product.' });
  }
  db.deleteProduct(product.id);
  res.redirect('/seller/dashboard');
});

module.exports = router;

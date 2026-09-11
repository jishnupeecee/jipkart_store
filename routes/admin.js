const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../utils/db');
const { requireRole } = require('../middleware/auth');

router.use('/admin', requireRole('admin'));

router.get('/admin/dashboard', (req, res) => {
  const products = db.getProducts();
  const users = db.getUsers();
  const orders = db.getOrders();
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  res.render('admin/dashboard', {
    title: 'Admin Dashboard - Jipkart',
    stats: {
      productCount: products.length,
      userCount: users.length,
      sellerCount: users.filter(u => u.role === 'seller').length,
      customerCount: users.filter(u => u.role === 'customer').length,
      orderCount: orders.length,
      totalRevenue
    },
    recentOrders: [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
  });
});

// Products management
router.get('/admin/products', (req, res) => {
  const products = db.getProducts().map(p => ({ ...p, sellerName: (db.getUserById(p.sellerId) || {}).name || 'Unknown' }));
  res.render('admin/products', { title: 'Manage Products - Jipkart', products });
});

router.get('/admin/products/new', (req, res) => {
  res.render('admin/product-form', { title: 'Add Product - Jipkart', product: null, error: null });
});

router.post('/admin/products/new', (req, res) => {
  const { name, category, price, mrp, unit, stock, image, description } = req.body;
  if (!name || !category || !price || !unit || !stock) {
    return res.render('admin/product-form', { title: 'Add Product - Jipkart', product: req.body, error: 'Please fill all required fields.' });
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
  res.redirect('/admin/products');
});

router.get('/admin/products/:id/edit', (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product) return res.status(404).render('error', { title: 'Not Found', message: 'Product not found.' });
  res.render('admin/product-form', { title: 'Edit Product - Jipkart', product, error: null });
});

router.post('/admin/products/:id/edit', (req, res) => {
  const { name, category, price, mrp, unit, stock, image, description } = req.body;
  db.updateProduct(req.params.id, {
    name, category,
    price: Number(price),
    mrp: mrp ? Number(mrp) : Number(price),
    unit,
    stock: Number(stock),
    image, description
  });
  res.redirect('/admin/products');
});

router.post('/admin/products/:id/delete', (req, res) => {
  db.deleteProduct(req.params.id);
  res.redirect('/admin/products');
});

// Users management
router.get('/admin/users', (req, res) => {
  const users = db.getUsers();
  res.render('admin/users', { title: 'Manage Users - Jipkart', users });
});

router.post('/admin/users/:id/delete', (req, res) => {
  if (Number(req.params.id) === req.session.user.id) {
    return res.redirect('/admin/users');
  }
  db.deleteUser(req.params.id);
  res.redirect('/admin/users');
});

// Orders overview
router.get('/admin/orders', (req, res) => {
  const orders = [...db.getOrders()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.render('admin/orders', { title: 'All Orders - Jipkart', orders });
});

router.post('/admin/orders/:id/status', (req, res) => {
  db.updateOrderStatus(req.params.id, req.body.status);
  res.redirect('/admin/orders');
});

module.exports = router;

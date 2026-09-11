const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { requireRole } = require('../middleware/auth');

function getCart(req) {
  if (!req.session.cart) req.session.cart = [];
  return req.session.cart;
}

router.post('/cart/add', (req, res) => {
  const { productId, qty } = req.body;
  const product = db.getProductById(productId);
  if (!product) return res.redirect('back');

  const cart = getCart(req);
  const quantity = Math.max(1, parseInt(qty) || 1);
  const existing = cart.find(i => i.productId === Number(productId));
  if (existing) {
    existing.qty += quantity;
  } else {
    cart.push({ productId: Number(productId), qty: quantity });
  }
  res.redirect(req.get('Referer') || '/cart');
});

router.get('/cart', (req, res) => {
  const cart = getCart(req);
  const items = cart.map(i => {
    const product = db.getProductById(i.productId);
    return product ? { product, qty: i.qty, subtotal: product.price * i.qty } : null;
  }).filter(Boolean);

  const total = items.reduce((sum, i) => sum + i.subtotal, 0);

  res.render('cart', { title: 'My Cart - Jipkart', items, total });
});

router.post('/cart/update', (req, res) => {
  const { productId, qty } = req.body;
  const cart = getCart(req);
  const item = cart.find(i => i.productId === Number(productId));
  if (item) {
    item.qty = Math.max(1, parseInt(qty) || 1);
  }
  res.redirect('/cart');
});

router.post('/cart/remove', (req, res) => {
  const { productId } = req.body;
  req.session.cart = getCart(req).filter(i => i.productId !== Number(productId));
  res.redirect('/cart');
});

router.get('/checkout', requireRole('customer'), (req, res) => {
  const cart = getCart(req);
  if (cart.length === 0) return res.redirect('/cart');

  const items = cart.map(i => {
    const product = db.getProductById(i.productId);
    return product ? { product, qty: i.qty, subtotal: product.price * i.qty } : null;
  }).filter(Boolean);
  const total = items.reduce((sum, i) => sum + i.subtotal, 0);

  res.render('checkout', { title: 'Checkout - Jipkart', items, total, error: null });
});

router.post('/checkout', requireRole('customer'), (req, res) => {
  const cart = getCart(req);
  if (cart.length === 0) return res.redirect('/cart');

  const { fullName, phone, address, city, pincode, paymentMethod } = req.body;
  if (!fullName || !phone || !address || !city || !pincode) {
    const items = cart.map(i => {
      const product = db.getProductById(i.productId);
      return product ? { product, qty: i.qty, subtotal: product.price * i.qty } : null;
    }).filter(Boolean);
    const total = items.reduce((sum, i) => sum + i.subtotal, 0);
    return res.render('checkout', { title: 'Checkout - Jipkart', items, total, error: 'Please fill all delivery details.' });
  }

  const items = cart.map(i => {
    const product = db.getProductById(i.productId);
    return {
      productId: product.id,
      name: product.name,
      price: product.price,
      qty: i.qty,
      sellerId: product.sellerId
    };
  });
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  items.forEach(i => db.decrementStock(i.productId, i.qty));

  const order = db.createOrder({
    userId: req.session.user.id,
    customerName: fullName,
    items,
    total,
    address: `${address}, ${city} - ${pincode}`,
    phone,
    paymentMethod: paymentMethod || 'COD',
    status: 'Placed'
  });

  req.session.cart = [];
  res.redirect(`/orders/${order.id}/confirmation`);
});

router.get('/orders/:id/confirmation', requireRole('customer'), (req, res) => {
  const order = db.getOrderById(req.params.id);
  if (!order || order.userId !== req.session.user.id) {
    return res.status(404).render('error', { title: 'Not Found', message: 'Order not found.' });
  }
  res.render('order-confirmation', { title: 'Order Confirmed - Jipkart', order });
});

router.get('/orders', requireRole('customer'), (req, res) => {
  const orders = db.getOrdersByUser(req.session.user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.render('my-orders', { title: 'My Orders - Jipkart', orders });
});

module.exports = router;

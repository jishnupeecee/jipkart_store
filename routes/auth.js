const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../utils/db');

router.get('/login', (req, res) => {
  res.render('login', { title: 'Login', error: null });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.getUserByEmail(email);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.render('login', { title: 'Login', error: 'Invalid email or password.' });
  }

  req.session.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    shopName: user.shopName || null
  };

  const redirectTo = req.session.returnTo || defaultRedirect(user.role);
  delete req.session.returnTo;
  res.redirect(redirectTo);
});

function defaultRedirect(role) {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'seller') return '/seller/dashboard';
  return '/';
}

router.get('/register', (req, res) => {
  res.render('register', { title: 'Register', error: null, form: {} });
});

router.post('/register', (req, res) => {
  const { name, email, password, confirmPassword, role, phone, shopName, address } = req.body;

  if (!name || !email || !password || !role) {
    return res.render('register', { title: 'Register', error: 'Please fill all required fields.', form: req.body });
  }
  if (password !== confirmPassword) {
    return res.render('register', { title: 'Register', error: 'Passwords do not match.', form: req.body });
  }
  if (!['customer', 'seller'].includes(role)) {
    return res.render('register', { title: 'Register', error: 'Invalid account type selected.', form: req.body });
  }
  if (db.getUserByEmail(email)) {
    return res.render('register', { title: 'Register', error: 'An account with this email already exists.', form: req.body });
  }

  const newUser = db.createUser({
    name,
    email,
    password: bcrypt.hashSync(password, 8),
    role,
    phone: phone || '',
    shopName: role === 'seller' ? (shopName || name) : undefined,
    address: address || ''
  });

  req.session.user = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    shopName: newUser.shopName || null
  };

  res.redirect(defaultRedirect(newUser.role));
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;

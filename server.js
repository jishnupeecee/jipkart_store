const express = require('express');
const session = require('express-session');
const path = require('path');
const methodOverride = require('method-override');

const { attachUser } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'jipkart-local-dev-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

app.use(attachUser);

// Routes
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/main'));
app.use('/', require('./routes/cart'));
app.use('/', require('./routes/seller'));
app.use('/', require('./routes/admin'));

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', { title: 'Page Not Found', message: 'The page you are looking for does not exist.' });
});

app.listen(PORT, () => {
  console.log('==========================================');
  console.log('  Jipkart is running!');
  console.log(`  Open your browser at: http://localhost:${PORT}`);
  console.log('==========================================');
  console.log('  Demo logins:');
  console.log('  Admin    -> admin@jipkart.com / admin123');
  console.log('  Seller   -> seller@jipkart.com / seller123');
  console.log('  Customer -> customer@jipkart.com / customer123');
  console.log('==========================================');
});

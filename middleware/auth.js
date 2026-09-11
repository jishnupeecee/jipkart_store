function requireLogin(req, res, next) {
  if (!req.session.user) {
    req.session.returnTo = req.originalUrl;
    return res.redirect('/login');
  }
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session.user) {
      req.session.returnTo = req.originalUrl;
      return res.redirect('/login');
    }
    if (!roles.includes(req.session.user.role)) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: "You don't have permission to view this page.",
        user: req.session.user
      });
    }
    next();
  };
}

// Makes current user available in all views without repeating code in every route
function attachUser(req, res, next) {
  res.locals.user = req.session.user || null;
  res.locals.cartCount = (req.session.cart || []).reduce((sum, i) => sum + i.qty, 0);
  next();
}

module.exports = { requireLogin, requireRole, attachUser };

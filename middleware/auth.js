const userRepository = require('../repositories/user-repository');

// Check if user is authenticated
const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  
  if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  return res.redirect('/login');
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.session && req.session.userId && req.session.userRole === 'admin') {
    return next();
  }
  
  if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  return res.redirect('/login');
};

// Check if user is employee
const requireEmployee = (req, res, next) => {
  if (req.session && req.session.userId && req.session.userRole === 'employee') {
    return next();
  }
  
  if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
    return res.status(403).json({ error: 'Employee access required' });
  }
  
  return res.redirect('/login');
};

// Load user data into request
const loadUser = async (req, res, next) => {
  if (req.session && req.session.userId) {
    try {
      const user = await userRepository.findById(req.session.userId);
      if (user && user.is_active) {
        req.user = user;
      } else {
        req.session.destroy();
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }
  next();
};

// Redirect authenticated users away from login page
const redirectIfAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    const redirectTo = req.session.userRole === 'admin' ? '/admin' : '/employee';
    return res.redirect(redirectTo);
  }
  next();
};

module.exports = {
  requireAuth,
  requireAdmin,
  requireEmployee,
  loadUser,
  redirectIfAuthenticated
};

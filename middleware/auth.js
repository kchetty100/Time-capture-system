const userRepository = require('../repositories/user-repository');

// Check if user is authenticated
const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  
  if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  return res.redirect('/auth/login');
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  console.log('requireAdmin middleware:', {
    hasSession: !!req.session,
    userId: req.session?.userId,
    userRole: req.session?.userRole,
    url: req.url
  });
  
  if (req.session && req.session.userId && req.session.userRole === 'admin') {
    console.log('Admin access granted');
    return next();
  }
  
  console.log('Admin access denied, redirecting to login');
  if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  return res.redirect('/auth/login');
};

// Check if user is employee
const requireEmployee = (req, res, next) => {
  if (req.session && req.session.userId && req.session.userRole === 'employee') {
    return next();
  }
  
  if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
    return res.status(403).json({ error: 'Employee access required' });
  }
  
  return res.redirect('/auth/login');
};

// Load user data into request
const loadUser = async (req, res, next) => {
  console.log('loadUser middleware:', {
    hasSession: !!req.session,
    userId: req.session?.userId,
    userRole: req.session?.userRole,
    url: req.url
  });
  
  if (req.session && req.session.userId) {
    try {
      const user = await userRepository.findById(req.session.userId);
      if (user) {
        req.user = user;
        console.log('User loaded successfully:', user.name);
      } else {
        console.log('User not found, destroying session');
        req.session.destroy();
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  } else {
    console.log('No session or userId found');
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

const express = require('express');
const { body, validationResult } = require('express-validator');
const userRepository = require('../repositories/user-repository');
const { redirectIfAuthenticated } = require('../middleware/auth');

const router = express.Router();

// Login page
router.get('/login', redirectIfAuthenticated, (req, res) => {
  res.render('auth/login', {
    title: 'Login - REVERSIDE Time Tracker',
    error: req.query.error || null,
    success: req.query.success || null
  });
});

// Login form submission
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/login', {
        title: 'Login - REVERSIDE Time Tracker',
        error: 'Please provide valid email and password',
        email: req.body.email
      });
    }

    const { email, password } = req.body;
    const user = await userRepository.validatePassword(email, password);

    if (!user) {
      return res.render('auth/login', {
        title: 'Login - REVERSIDE Time Tracker',
        error: 'Invalid email or password',
        email: email
      });
    }

    // Check if user is active (if is_active column exists)
    if (user.is_active === false) {
      return res.render('auth/login', {
        title: 'Login - REVERSIDE Time Tracker',
        error: 'Account is deactivated. Please contact administrator.',
        email: email
      });
    }

    // Set session
    req.session.userId = user.id;
    req.session.userRole = user.role;
    req.session.userName = user.name;

    // Redirect based on role
    const redirectTo = user.role === 'admin' ? '/admin' : '/employee';
    res.redirect(redirectTo);

  } catch (error) {
    console.error('Login error:', error);
    res.render('auth/login', {
      title: 'Login - REVERSIDE Time Tracker',
      error: 'An error occurred during login. Please try again.',
      email: req.body.email
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/auth/login?success=logged_out');
  });
});

// Register page (admin only)
router.get('/register', (req, res) => {
  if (!req.session || req.session.userRole !== 'admin') {
    return res.redirect('/auth/login');
  }
  
  res.render('auth/register', {
    title: 'Register New User - REVERSIDE Time Tracker',
    error: req.query.error || null,
    success: req.query.success || null
  });
});

// Register form submission
router.post('/register', [
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['employee', 'admin'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/register', {
        title: 'Register New User - REVERSIDE Time Tracker',
        error: 'Please provide valid information',
        formData: req.body
      });
    }

    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return res.render('auth/register', {
        title: 'Register New User - REVERSIDE Time Tracker',
        error: 'User with this email already exists',
        formData: req.body
      });
    }

    // Create new user
    const newUser = await userRepository.createUser({
      name,
      email,
      password,
      role,
      is_active: true
    });

    res.redirect('/auth/register?success=user_created');

  } catch (error) {
    console.error('Registration error:', error);
    res.render('auth/register', {
      title: 'Register New User - REVERSIDE Time Tracker',
      error: 'An error occurred during registration. Please try again.',
      formData: req.body
    });
  }
});

module.exports = router;

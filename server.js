const express = require('express');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const db = require('./config/database-sqlite');
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employee');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');
const { loadUser } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database
db.connect();

// Session configuration
const SQLiteStore = require('connect-sqlite3')(session);
app.use(session({
  store: new SQLiteStore({
    db: 'sessions.db',
    dir: './data'
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS in production
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true, // Security: prevent XSS
    sameSite: 'strict' // Security: prevent CSRF
  }
}));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(loadUser);

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/auth', authRoutes);
app.use('/employee', employeeRoutes);
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);

// Test route
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Server is working', 
    session: req.session,
    hasSession: !!req.session,
    hasUserId: !!req.session?.userId,
    userRole: req.session?.userRole
  });
});

// Root route
app.get('/', (req, res) => {
  if (req.session && req.session.userId) {
    const redirectTo = req.session.userRole === 'admin' ? '/admin' : '/employee';
    return res.redirect(redirectTo);
  }
  res.redirect('/auth/login');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
    return res.status(500).json({ error: 'Something went wrong!' });
  }
  
  res.status(500).render('error', {
    title: 'Error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  res.status(404).render('error', {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.',
    error: {}
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await db.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await db.close();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`REVERSIDE Time Tracker running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

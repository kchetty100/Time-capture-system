// Test script to check if routes are working
const express = require('express');
const app = express();

// Test basic route
app.get('/test', (req, res) => {
  res.json({ message: 'Basic test route working' });
});

// Test admin routes import
try {
  const adminRoutes = require('./routes/admin');
  console.log('✅ Admin routes imported successfully');
  app.use('/admin', adminRoutes);
  console.log('✅ Admin routes mounted successfully');
} catch (error) {
  console.error('❌ Error importing admin routes:', error);
}

// Test auth routes import
try {
  const authRoutes = require('./routes/auth');
  console.log('✅ Auth routes imported successfully');
  app.use('/auth', authRoutes);
  console.log('✅ Auth routes mounted successfully');
} catch (error) {
  console.error('❌ Error importing auth routes:', error);
}

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log('Test routes:');
  console.log('- http://localhost:3001/test');
  console.log('- http://localhost:3001/admin/test');
  console.log('- http://localhost:3001/auth/login');
});

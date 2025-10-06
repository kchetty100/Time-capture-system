const express = require('express');
const app = express();

// Basic test route
app.get('/test', (req, res) => {
  res.json({ message: 'Simple server working' });
});

// Test admin routes
const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Simple server running on port ${PORT}`);
  console.log('Test: http://localhost:3002/test');
  console.log('Test: http://localhost:3002/admin/test');
});

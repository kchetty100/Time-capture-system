const express = require('express');
const router = express.Router();

// Test route (no auth for debugging)
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Simple admin test route working', 
    user: req.user,
    session: req.session,
    hasSession: !!req.session,
    hasUserId: !!req.session?.userId,
    userRole: req.session?.userRole
  });
});

// Simple admin dashboard
router.get('/', (req, res) => {
  res.json({
    message: 'Admin dashboard working',
    user: req.user,
    session: req.session
  });
});

module.exports = router;

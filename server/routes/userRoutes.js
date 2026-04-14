const express = require('express');
const { protect } = require('../middlewares/auth');
const { globalLimiter } = require('../middlewares/rateLimiter');
const {
  getPublicProfile,
  getOrganizerProfile,
  getUserStats,
} = require('../controllers/userController');

const router = express.Router();

// Protected route (specific path BEFORE :id param routes)
router.get('/me/stats', protect, getUserStats);

// Public routes
router.get('/:id/profile', globalLimiter, getPublicProfile);
router.get('/:id/organizer', globalLimiter, getOrganizerProfile);

module.exports = router;

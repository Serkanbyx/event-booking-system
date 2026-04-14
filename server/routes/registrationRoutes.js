const express = require('express');
const { protect } = require('../middlewares/auth');
const { registrationLimiter } = require('../middlewares/rateLimiter');
const {
  cancelRegistration,
  getMyRegistrations,
  getRegistrationById,
  getRegistrationByCode,
} = require('../controllers/registrationController');

const router = express.Router();

// Specific paths BEFORE :id param route
router.get('/my', protect, getMyRegistrations);
router.get('/code/:code', protect, registrationLimiter, getRegistrationByCode);

// Param-based routes
router.get('/:id', protect, getRegistrationById);
router.delete('/:id', protect, cancelRegistration);

module.exports = router;

const express = require('express');
const { protect, organizerOnly } = require('../middlewares/auth');
const { registrationLimiter } = require('../middlewares/rateLimiter');
const {
  cancelRegistration,
  getMyRegistrations,
  getRegistrationById,
  getRegistrationByCode,
  checkInAttendee,
} = require('../controllers/registrationController');

const router = express.Router();

// Specific paths BEFORE :id param route
router.get('/my', protect, getMyRegistrations);
router.get('/code/:code', protect, registrationLimiter, getRegistrationByCode);

// Check-in (organizer/admin)
router.put('/:id/check-in', protect, organizerOnly, checkInAttendee);

// Param-based routes
router.get('/:id', protect, getRegistrationById);
router.delete('/:id', protect, cancelRegistration);

module.exports = router;

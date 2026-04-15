const express = require('express');
const { protect, organizerOnly } = require('../middlewares/auth');
const { confirmationLimiter } = require('../middlewares/rateLimiter');
const validate = require('../middlewares/validate');
const { paginationRules } = require('../validators/queryValidator');
const { mongoIdParam } = require('../validators/paramValidator');
const {
  cancelRegistration,
  getMyRegistrations,
  getRegistrationById,
  getRegistrationByCode,
  checkInAttendee,
} = require('../controllers/registrationController');

const router = express.Router();

// Specific paths BEFORE :id param route
router.get('/my', protect, paginationRules, validate, getMyRegistrations);
router.get('/code/:code', protect, confirmationLimiter, getRegistrationByCode);

// Check-in (organizer/admin) — :id can be MongoId or confirmation code
router.put('/:id/check-in', protect, organizerOnly, checkInAttendee);

// Param-based routes
router.get('/:id', protect, mongoIdParam(), validate, getRegistrationById);
router.delete('/:id', protect, mongoIdParam(), validate, cancelRegistration);

module.exports = router;

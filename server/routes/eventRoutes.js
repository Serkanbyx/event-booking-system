const express = require('express');
const { protect, optionalAuth, organizerOnly } = require('../middlewares/auth');
const { globalLimiter, registrationLimiter } = require('../middlewares/rateLimiter');
const validate = require('../middlewares/validate');
const { createEventRules, updateEventRules } = require('../validators/eventValidator');
const { registerForEventRules } = require('../validators/registrationValidator');
const { eventFilterRules } = require('../validators/queryValidator');
const {
  createEvent,
  updateEvent,
  deleteEvent,
  publishEvent,
  cancelEvent,
  getMyEvents,
  getEvents,
  getEventBySlug,
  getEventById,
  getFeaturedEvents,
  getEventCategories,
} = require('../controllers/eventController');
const {
  registerForEvent,
  getEventRegistrations,
  getEventStats,
} = require('../controllers/registrationController');

const router = express.Router();

// Public routes (specific paths BEFORE :slug param route)
router.get('/featured', globalLimiter, getFeaturedEvents);
router.get('/categories', globalLimiter, getEventCategories);

// Organizer routes (require authentication + organizer/admin role)
router.get('/my/organized', protect, organizerOnly, getMyEvents);
router.post('/', protect, organizerOnly, createEventRules, validate, createEvent);
router.put('/:id', protect, organizerOnly, updateEventRules, validate, updateEvent);
router.delete('/:id', protect, organizerOnly, deleteEvent);
router.put('/:id/publish', protect, organizerOnly, publishEvent);
router.put('/:id/cancel', protect, organizerOnly, cancelEvent);

// Event registration management (organizer/admin)
router.get('/:id/registrations', protect, organizerOnly, getEventRegistrations);
router.get('/:id/stats', protect, organizerOnly, getEventStats);

// Event registration (authenticated users)
router.post(
  '/:id/register',
  protect,
  registrationLimiter,
  registerForEventRules,
  validate,
  registerForEvent
);

// Public routes with param (AFTER specific routes)
router.get('/', globalLimiter, optionalAuth, eventFilterRules, validate, getEvents);
router.get('/id/:id', globalLimiter, getEventById);
router.get('/:slug', globalLimiter, optionalAuth, getEventBySlug);

module.exports = router;

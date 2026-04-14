const express = require('express');
const { protect, organizerOnly } = require('../middlewares/auth');
const {
  createEvent,
  updateEvent,
  deleteEvent,
  publishEvent,
  cancelEvent,
  getMyEvents,
} = require('../controllers/eventController');

const router = express.Router();

// Organizer routes (require authentication + organizer/admin role)
router.get('/my/organized', protect, organizerOnly, getMyEvents);
router.post('/', protect, organizerOnly, createEvent);
router.put('/:id', protect, organizerOnly, updateEvent);
router.delete('/:id', protect, organizerOnly, deleteEvent);
router.put('/:id/publish', protect, organizerOnly, publishEvent);
router.put('/:id/cancel', protect, organizerOnly, cancelEvent);

module.exports = router;

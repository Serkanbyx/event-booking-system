const mongoose = require('mongoose');
const Event = require('../models/Event');

const ALLOWED_FIELDS = [
  'title',
  'description',
  'date',
  'endDate',
  'time',
  'location',
  'capacity',
  'price',
  'currency',
  'category',
  'tags',
  'image',
  'maxRegistrationsPerUser',
];

/**
 * Pick only whitelisted keys from an object to prevent mass-assignment.
 */
const pickAllowedFields = (source, fields) => {
  const result = {};
  for (const key of fields) {
    if (source[key] !== undefined) {
      result[key] = source[key];
    }
  }
  return result;
};

/**
 * Check whether the requesting user owns the event or is an admin.
 */
const isOwnerOrAdmin = (event, user) =>
  event.organizer.toString() === user._id.toString() || user.role === 'admin';

// @desc    Create a new event (draft)
// @route   POST /api/events
const createEvent = async (req, res, next) => {
  try {
    const fields = pickAllowedFields(req.body, ALLOWED_FIELDS);

    if (new Date(fields.date) <= new Date()) {
      const error = new Error('Event date must be in the future');
      error.statusCode = 400;
      throw error;
    }

    fields.organizer = req.user._id;
    fields.status = 'draft';

    const event = await Event.create(fields);

    res.status(201).json({
      success: true,
      data: { event },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update an existing event
// @route   PUT /api/events/:id
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      const error = new Error('Event not found');
      error.statusCode = 404;
      throw error;
    }

    if (!isOwnerOrAdmin(event, req.user)) {
      const error = new Error('Not authorized to update this event');
      error.statusCode = 403;
      throw error;
    }

    if (event.status === 'cancelled') {
      const error = new Error('Cannot update a cancelled event');
      error.statusCode = 400;
      throw error;
    }

    const fields = pickAllowedFields(req.body, ALLOWED_FIELDS);

    if (
      fields.capacity !== undefined &&
      fields.capacity < event.registeredCount
    ) {
      const error = new Error(
        'Capacity cannot be reduced below current registrations'
      );
      error.statusCode = 400;
      throw error;
    }

    Object.assign(event, fields);
    await event.save();

    res.status(200).json({
      success: true,
      data: { event },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      const error = new Error('Event not found');
      error.statusCode = 404;
      throw error;
    }

    if (!isOwnerOrAdmin(event, req.user)) {
      const error = new Error('Not authorized to delete this event');
      error.statusCode = 403;
      throw error;
    }

    if (event.registeredCount > 0) {
      const error = new Error(
        'Cannot delete event with active registrations. Cancel the event first.'
      );
      error.statusCode = 400;
      throw error;
    }

    const Registration = mongoose.models.Registration;
    if (Registration) {
      await Registration.deleteMany({ event: event._id });
    }

    await Event.findByIdAndDelete(event._id);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Publish a draft event
// @route   PUT /api/events/:id/publish
const publishEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      const error = new Error('Event not found');
      error.statusCode = 404;
      throw error;
    }

    if (!isOwnerOrAdmin(event, req.user)) {
      const error = new Error('Not authorized to publish this event');
      error.statusCode = 403;
      throw error;
    }

    if (event.status !== 'draft') {
      const error = new Error('Only draft events can be published');
      error.statusCode = 400;
      throw error;
    }

    const requiredFields = ['title', 'description', 'date', 'capacity', 'category'];
    const missingFields = requiredFields.filter((field) => !event[field]);

    if (!event.location?.venue || !event.location?.city) {
      missingFields.push('location (venue and city)');
    }

    if (missingFields.length > 0) {
      const error = new Error(
        `Missing required fields: ${missingFields.join(', ')}`
      );
      error.statusCode = 400;
      throw error;
    }

    event.status = 'published';
    await event.save();

    res.status(200).json({
      success: true,
      data: { event },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel a published or draft event
// @route   PUT /api/events/:id/cancel
const cancelEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      const error = new Error('Event not found');
      error.statusCode = 404;
      throw error;
    }

    if (!isOwnerOrAdmin(event, req.user)) {
      const error = new Error('Not authorized to cancel this event');
      error.statusCode = 403;
      throw error;
    }

    if (!['published', 'draft'].includes(event.status)) {
      const error = new Error('Only published or draft events can be cancelled');
      error.statusCode = 400;
      throw error;
    }

    event.status = 'cancelled';
    await event.save();

    // TODO: Send cancellation emails to all registered attendees (Step 10)

    res.status(200).json({
      success: true,
      data: { event },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get events organized by the current user
// @route   GET /api/events/my/organized
const getMyEvents = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { organizer: req.user._id };
    if (status) {
      filter.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [events, total] = await Promise.all([
      Event.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('organizer', 'name email'),
      Event.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        events,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createEvent,
  updateEvent,
  deleteEvent,
  publishEvent,
  cancelEvent,
  getMyEvents,
};

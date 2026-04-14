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

/**
 * Escape regex special characters to prevent ReDoS attacks.
 */
const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    List published events with filtering, search, sorting, pagination
// @route   GET /api/events
const getEvents = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      city,
      dateFrom,
      dateTo,
      priceMin,
      priceMax,
      sort = 'date',
      upcoming,
    } = req.query;

    const filter = { status: 'published' };

    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    if (category) filter.category = category;
    if (city) filter['location.city'] = new RegExp(`^${escapeRegex(city)}$`, 'i');

    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    if (priceMin !== undefined || priceMax !== undefined) {
      filter.price = {};
      if (priceMin !== undefined) filter.price.$gte = Number(priceMin);
      if (priceMax !== undefined) filter.price.$lte = Number(priceMax);
    }

    if (upcoming === 'true') {
      filter.date = { ...filter.date, $gte: new Date() };
    }

    const sortOptions = {
      date: { date: 1 },
      '-date': { date: -1 },
      price: { price: 1 },
      '-price': { price: -1 },
      title: { title: 1 },
      createdAt: { createdAt: -1 },
    };
    const sortBy = sortOptions[sort] || { date: 1 };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [events, total] = await Promise.all([
      Event.find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limitNum)
        .populate('organizer', 'name avatar'),
      Event.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      data: {
        events,
        page: pageNum,
        totalPages,
        total,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get a single published event by slug
// @route   GET /api/events/:slug
const getEventBySlug = async (req, res, next) => {
  try {
    const event = await Event.findOne({
      slug: req.params.slug,
      status: 'published',
    }).populate('organizer', 'name avatar');

    if (!event) {
      const error = new Error('Event not found');
      error.statusCode = 404;
      throw error;
    }

    const response = { event };

    if (req.user) {
      const Registration = mongoose.models.Registration;
      if (Registration) {
        const existingRegistration = await Registration.findOne({
          event: event._id,
          user: req.user._id,
          status: { $ne: 'cancelled' },
        });
        response.isRegistered = !!existingRegistration;
      }
    }

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get a single published event by ID (internal use)
// @route   GET /api/events/id/:id
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      status: 'published',
    }).populate('organizer', 'name avatar');

    if (!event) {
      const error = new Error('Event not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: { event },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get featured upcoming published events
// @route   GET /api/events/featured
const getFeaturedEvents = async (req, res, next) => {
  try {
    const events = await Event.find({
      status: 'published',
      isFeatured: true,
      date: { $gte: new Date() },
    })
      .sort({ date: 1 })
      .limit(6)
      .populate('organizer', 'name avatar');

    res.status(200).json({
      success: true,
      data: { events },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get aggregated category list with event counts
// @route   GET /api/events/categories
const getEventCategories = async (req, res, next) => {
  try {
    const categories = await Event.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, category: '$_id', count: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: { categories },
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
  getEvents,
  getEventBySlug,
  getEventById,
  getFeaturedEvents,
  getEventCategories,
};

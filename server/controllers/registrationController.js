const mongoose = require('mongoose');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const AppError = require('../utils/AppError');
const { sendEmail } = require('../utils/emailService');
const generateConfirmationEmail = require('../templates/confirmationEmail');
const generateCancellationEmail = require('../templates/cancellationEmail');

// @desc    Register for an event (race-condition safe)
// @route   POST /api/events/:id/register
const registerForEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    const event = await Event.findById(eventId);

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    if (event.status !== 'published') {
      throw new AppError('Event is not available for registration', 400);
    }

    if (event.date < new Date()) {
      throw new AppError('Event has already passed', 400);
    }

    const existingRegistration = await Registration.findOne({
      user: userId,
      event: eventId,
      status: 'confirmed',
    });

    if (existingRegistration) {
      throw new AppError('You are already registered for this event', 400);
    }

    // Atomic capacity check — prevents race conditions on last-spot registration
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        status: 'published',
        $expr: { $lt: ['$registeredCount', '$capacity'] },
      },
      { $inc: { registeredCount: 1 } },
      { new: true }
    );

    if (!updatedEvent) {
      throw new AppError('Event is full, no spots available', 400);
    }

    const registration = await Registration.create({
      user: userId,
      event: eventId,
      ticketType: req.body.ticketType || 'standard',
      notes: req.body.notes || '',
    });

    await registration.populate('event', 'title slug date time location image status organizer');

    // Fire-and-forget confirmation email
    sendEmail({
      to: req.user.email,
      subject: `Registration Confirmed — ${updatedEvent.title}`,
      html: generateConfirmationEmail({
        userName: req.user.name,
        eventTitle: updatedEvent.title,
        eventDate: updatedEvent.date,
        eventTime: updatedEvent.time || 'TBA',
        venue: updatedEvent.location?.venue || '',
        city: updatedEvent.location?.city || '',
        confirmationCode: registration.confirmationCode,
        eventSlug: updatedEvent.slug,
      }),
    }).catch((err) => console.error('Confirmation email failed:', err.message));

    res.status(201).json({
      success: true,
      data: {
        registration,
        confirmationCode: registration.confirmationCode,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel a registration
// @route   DELETE /api/registrations/:id
const cancelRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      throw new AppError('Registration not found', 404);
    }

    if (registration.user.toString() !== req.user._id.toString()) {
      throw new AppError('Not authorized to cancel this registration', 403);
    }

    if (registration.status === 'cancelled') {
      throw new AppError('Registration is already cancelled', 400);
    }

    registration.status = 'cancelled';
    registration.cancelledAt = new Date();
    await registration.save();

    // Atomic decrement — keeps registeredCount consistent
    await Event.findByIdAndUpdate(registration.event, {
      $inc: { registeredCount: -1 },
    });

    const event = await Event.findById(registration.event).select(
      'title date location'
    );

    // Fire-and-forget cancellation email
    if (event) {
      sendEmail({
        to: req.user.email,
        subject: `Registration Cancelled — ${event.title}`,
        html: generateCancellationEmail({
          userName: req.user.name,
          eventTitle: event.title,
          eventDate: event.date,
          venue: event.location?.venue || '',
          city: event.location?.city || '',
        }),
      }).catch((err) => console.error('Cancellation email failed:', err.message));
    }

    res.status(200).json({
      success: true,
      message: 'Registration cancelled successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user's registrations
// @route   GET /api/registrations/my
const getMyRegistrations = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { user: req.user._id };
    if (status && ['confirmed', 'cancelled', 'attended'].includes(status)) {
      filter.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [registrations, total] = await Promise.all([
      Registration.find(filter)
        .sort({ registeredAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('event', 'title slug date location image status organizer'),
      Registration.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        registrations,
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

// @desc    Get a single registration by ID
// @route   GET /api/registrations/:id
const getRegistrationById = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('event', 'title slug date time location image status organizer')
      .populate('user', 'name email avatar');

    if (!registration) {
      throw new AppError('Registration not found', 404);
    }

    const isOwner =
      registration.user._id.toString() === req.user._id.toString();
    const isAdminOrOrganizer =
      req.user.role === 'admin' ||
      registration.event.organizer?.toString() === req.user._id.toString();

    if (!isOwner && !isAdminOrOrganizer) {
      throw new AppError('Not authorized to view this registration', 403);
    }

    res.status(200).json({
      success: true,
      data: { registration },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Find registration by confirmation code
// @route   GET /api/registrations/code/:code
const getRegistrationByCode = async (req, res, next) => {
  try {
    const registration = await Registration.findOne({
      confirmationCode: req.params.code.toUpperCase(),
    })
      .populate('event', 'title slug date time location image status organizer')
      .populate('user', 'name email avatar');

    if (!registration) {
      throw new AppError('Registration not found', 404);
    }

    const isOwner =
      registration.user._id.toString() === req.user._id.toString();
    const isAdminOrOrganizer =
      req.user.role === 'admin' ||
      registration.event.organizer?.toString() === req.user._id.toString();

    if (!isOwner && !isAdminOrOrganizer) {
      throw new AppError('Not authorized to view this registration', 403);
    }

    res.status(200).json({
      success: true,
      data: { registration },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getRegistrationById,
  getRegistrationByCode,
};

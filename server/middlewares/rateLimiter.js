const rateLimit = require('express-rate-limit');

const rateLimitResponse = {
  success: false,
  message: 'Too many requests, please try again later',
};

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: rateLimitResponse,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: rateLimitResponse,
});

const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: rateLimitResponse,
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: rateLimitResponse,
});

module.exports = {
  globalLimiter,
  authLimiter,
  registrationLimiter,
  uploadLimiter,
};

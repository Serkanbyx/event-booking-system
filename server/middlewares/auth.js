const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');

/**
 * Protect routes — only authenticated users with valid tokens.
 * Full implementation with passwordChangedAt check (token invalidation).
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      const error = new Error('Not authorized, no token');
      error.statusCode = 401;
      throw error;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('+passwordChangedAt');

    if (!user || !user.isActive) {
      const error = new Error('Not authorized');
      error.statusCode = 401;
      throw error;
    }

    // Invalidate tokens issued before password change
    if (user.passwordChangedAt) {
      const changedTimestamp = Math.floor(
        user.passwordChangedAt.getTime() / 1000
      );

      if (decoded.iat < changedTimestamp) {
        const error = new Error(
          'Password recently changed, please login again'
        );
        error.statusCode = 401;
        throw error;
      }
    }

    user.passwordChangedAt = undefined;
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { protect };

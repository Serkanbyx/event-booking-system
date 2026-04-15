const { body } = require('express-validator');

const registerForEventRules = [
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
    .escape(),

  body('ticketType')
    .optional()
    .isIn(['standard', 'vip'])
    .withMessage('Ticket type must be standard or vip'),
];

module.exports = { registerForEventRules };

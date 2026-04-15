const express = require('express');
const { protect, adminOnly } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  updateUserRoleRules,
  updateEventStatusRules,
} = require('../validators/adminValidator');
const { paginationRules } = require('../validators/queryValidator');
const {
  getAdminDashboard,
  getAllUsers,
  updateUserRole,
  toggleUserActive,
  deleteUser,
  getAllEvents,
  adminUpdateEventStatus,
  adminDeleteEvent,
  getAllRegistrations,
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

// Dashboard
router.get('/dashboard', getAdminDashboard);

// User management
router.get('/users', paginationRules, validate, getAllUsers);
router.put('/users/:id/role', updateUserRoleRules, validate, updateUserRole);
router.put('/users/:id/toggle-active', toggleUserActive);
router.delete('/users/:id', deleteUser);

// Event management
router.get('/events', paginationRules, validate, getAllEvents);
router.put(
  '/events/:id/status',
  updateEventStatusRules,
  validate,
  adminUpdateEventStatus
);
router.delete('/events/:id', adminDeleteEvent);

// Registration management
router.get('/registrations', paginationRules, validate, getAllRegistrations);

module.exports = router;

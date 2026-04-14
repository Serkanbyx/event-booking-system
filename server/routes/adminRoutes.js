const express = require('express');
const { protect, adminOnly } = require('../middlewares/auth');
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
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/toggle-active', toggleUserActive);
router.delete('/users/:id', deleteUser);

// Event management
router.get('/events', getAllEvents);
router.put('/events/:id/status', adminUpdateEventStatus);
router.delete('/events/:id', adminDeleteEvent);

// Registration management
router.get('/registrations', getAllRegistrations);

module.exports = router;

// /Users/karthikgouda/Desktop/TravelDesk/server/routes/analyticsRoutes.js
const express = require('express');
const {
  getBookingStats,
  getRevenueStats,
  getDestinationStats,
  getOccupancyStats,
  getStatusBreakdown,
} = require('../controllers/analyticsController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// All analytics routes are admin-only
router.use(protect);
router.use(restrictTo('admin'));

router.get('/bookings', getBookingStats);
router.get('/revenue', getRevenueStats);
router.get('/destinations', getDestinationStats);
router.get('/occupancy', getOccupancyStats);
router.get('/status-breakdown', getStatusBreakdown);

module.exports = router;

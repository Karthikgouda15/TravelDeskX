// /Users/karthikgouda/Desktop/TravelDesk/server/controllers/analyticsController.js
const asyncHandler = require('express-async-handler');
const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const apiResponse = require('../utils/apiResponse');

/**
 * @desc    Get total bookings over time (Line Chart)
 * @route   GET /api/analytics/bookings
 * @access  Private/Admin
 */
exports.getBookingStats = asyncHandler(async (req, res, next) => {
  const { days = 30 } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  const stats = await Booking.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return apiResponse(res, 200, true, stats, 'Booking stats retrieved');
});

/**
 * @desc    Get revenue by airline (Bar Chart)
 * @route   GET /api/analytics/revenue
 * @access  Private/Admin
 */
exports.getRevenueStats = asyncHandler(async (req, res, next) => {
  const stats = await Booking.aggregate([
    { $match: { type: 'flight', status: 'confirmed' } },
    {
      $lookup: {
        from: 'flights',
        localField: 'referenceId',
        foreignField: '_id',
        as: 'flightDetails',
      },
    },
    { $unwind: '$flightDetails' },
    {
      $group: {
        _id: '$flightDetails.airline',
        totalRevenue: { $sum: '$totalPrice' },
      },
    },
    { $sort: { totalRevenue: -1 } },
  ]);

  return apiResponse(res, 200, true, stats, 'Revenue by airline retrieved');
});

/**
 * @desc    Get top destinations (Horizontal Bar)
 * @route   GET /api/analytics/destinations
 * @access  Private/Admin
 */
exports.getDestinationStats = asyncHandler(async (req, res, next) => {
  const stats = await Booking.aggregate([
    { $match: { type: 'flight' } },
    {
      $lookup: {
        from: 'flights',
        localField: 'referenceId',
        foreignField: '_id',
        as: 'flightDetails',
      },
    },
    { $unwind: '$flightDetails' },
    {
      $group: {
        _id: '$flightDetails.destination',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  return apiResponse(res, 200, true, stats, 'Top destinations retrieved');
});

/**
 * @desc    Get occupancy rate per hotel (Area Chart)
 * @route   GET /api/analytics/occupancy
 * @access  Private/Admin
 */
exports.getOccupancyStats = asyncHandler(async (req, res, next) => {
  const stats = await Hotel.aggregate([
    {
      $lookup: {
        from: 'rooms',
        localField: '_id',
        foreignField: 'hotelId',
        as: 'rooms',
      },
    },
    {
      $project: {
        name: 1,
        totalRooms: 1,
        bookedRooms: {
          $size: {
            $filter: {
              input: '$rooms',
              as: 'room',
              cond: { $eq: ['$$room.status', 'booked'] },
            },
          },
        },
      },
    },
    {
      $project: {
        name: 1,
        occupancyRate: {
          $cond: [
            { $eq: ['$totalRooms', 0] },
            0,
            { $multiply: [{ $divide: ['$bookedRooms', '$totalRooms'] }, 100] },
          ],
        },
      },
    },
  ]);

  return apiResponse(res, 200, true, stats, 'Occupancy rates retrieved');
});

/**
 * @desc    Get booking status breakdown (Pie Chart)
 * @route   GET /api/analytics/status-breakdown
 * @access  Private/Admin
 */
exports.getStatusBreakdown = asyncHandler(async (req, res, next) => {
  const stats = await Booking.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  return apiResponse(res, 200, true, stats, 'Status breakdown retrieved');
});

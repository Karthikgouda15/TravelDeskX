// /Users/karthikgouda/Desktop/TravelDesk/server/controllers/itineraryController.js
const asyncHandler = require('express-async-handler');
const Itinerary = require('../models/Itinerary');
const { getDestinationWeather } = require('../services/weatherService');
const apiResponse = require('../utils/apiResponse');
const apiListResponse = require('../utils/apiListResponse');

/**
 * @desc    Create new itinerary for user
 * @route   POST /api/itineraries
 * @access  Private
 */
exports.createItinerary = asyncHandler(async (req, res, next) => {
  const { title, destination, dateRange, flights, hotels, activities } = req.body;

  if (!title || !destination || !dateRange) {
    return apiResponse(res, 400, false, null, 'Title, destination, and dateRange are required');
  }

  // Fetch destination weather snapshot at time of planning
  let weatherSnapshot = null;
  try {
    const weather = await getDestinationWeather(destination);
    if (weather.success) {
      weatherSnapshot = weather.data;
    }
  } catch (err) {
    console.error('Weather snapshot failed:', err.message);
  }

  const itinerary = await Itinerary.create({
    userId: req.user._id,
    title,
    destination,
    dateRange,
    flights,
    hotels,
    activities,
    weatherData: weatherSnapshot,
  });

  return apiResponse(res, 201, true, itinerary, 'Itinerary saved successfully');
});

/**
 * @desc    Get all itineraries for logged in user
 * @route   GET /api/itineraries/my
 * @access  Private
 */
exports.getMyItineraries = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const itineraries = await Itinerary.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Itinerary.countDocuments({ userId: req.user._id });

  return apiListResponse(res, 200, itineraries, total, page, limit);
});

/**
 * @desc    Get itinerary by ID or Share Token
 * @route   GET /api/itineraries/:idOrToken
 * @access  Public
 */
exports.getItinerary = asyncHandler(async (req, res, next) => {
  const { idOrToken } = req.params;

  // Attempt lookup by ID first, then by shareToken
  let itinerary;
  if (idOrToken.length === 24) { // Likely direct ID
     itinerary = await Itinerary.findById(idOrToken)
       .populate('userId', 'name email');
  }

  if (!itinerary) {
    itinerary = await Itinerary.findOne({ shareToken: idOrToken })
       .populate('userId', 'name email');
  }

  if (!itinerary) {
    return apiResponse(res, 404, false, null, 'Itinerary not found');
  }

  return apiResponse(res, 200, true, itinerary, 'Itinerary details retrieved');
});

/**
 * @desc    Delete itinerary
 * @route   DELETE /api/itineraries/:id
 * @access  Private
 */
exports.deleteItinerary = asyncHandler(async (req, res, next) => {
  const itinerary = await Itinerary.findById(req.params.id);

  if (!itinerary) {
    return apiResponse(res, 404, false, null, 'Itinerary not found');
  }

  // Authorize owner
  if (itinerary.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return apiResponse(res, 401, false, null, 'Not authorized to delete this itinerary');
  }

  await itinerary.deleteOne();

  return apiResponse(res, 200, true, {}, 'Itinerary deleted successfully');
});

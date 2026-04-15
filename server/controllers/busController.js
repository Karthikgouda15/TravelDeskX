// /Users/karthikgouda/Desktop/TravelDesk/server/controllers/busController.js
const asyncHandler = require('express-async-handler');
const Bus = require('../models/Bus');
const apiResponse = require('../utils/apiResponse');

/**
 * @desc    Search buses
 * @route   GET /api/buses/search
 * @access  Public
 */
exports.searchBuses = asyncHandler(async (req, res) => {
  const { origin, destination, date, busType, amenity } = req.query;

  if (!origin || !destination || !date) {
    return apiResponse(res, 400, false, null, 'origin, destination and date are required');
  }

  // Construct query
  let query = {
    'origin.city': { $regex: origin, $options: 'i' },
    'destination.city': { $regex: destination, $options: 'i' },
    isActive: true
  };

  // Advanced filters
  if (busType && busType !== 'All') {
    query.busType = busType;
  }

  if (amenity && amenity !== 'All') {
    query.amenities = { $in: [amenity] };
  }

  const buses = await Bus.find(query).sort({ price: 1 });

  return apiResponse(res, 200, true, buses, `Found ${buses.length} buses`);
});

/**
 * @desc    Get popular cities for autocomplete
 * @route   GET /api/buses/cities
 * @access  Public
 */
exports.getCities = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return apiResponse(res, 200, true, []);

  // Aggregation to find matching unique cities from legacy data
  const cities = await Bus.aggregate([
    {
      $project: {
        cities: ["$origin.city", "$destination.city"]
      }
    },
    { $unwind: "$cities" },
    {
      $match: {
        cities: { $regex: q, $options: "i" }
      }
    },
    {
      $group: {
        _id: "$cities"
      }
    },
    { $limit: 10 }
  ]);

  const formattedCities = cities.map(c => ({ name: c._id }));

  return apiResponse(res, 200, true, formattedCities);
});

/**
 * @desc    Get bus by ID with details
 * @route   GET /api/buses/:id
 * @access  Public
 */
exports.getBusById = asyncHandler(async (req, res) => {
  const bus = await Bus.findById(req.params.id);

  if (!bus) {
    return apiResponse(res, 404, false, null, 'Bus not found');
  }

  return apiResponse(res, 200, true, bus);
});

/**
 * @desc    Get boarding and dropping points
 * @route   GET /api/buses/:id/points
 * @access  Public
 */
exports.getPoints = asyncHandler(async (req, res) => {
  const bus = await Bus.findById(req.params.id).select('boardingPoints droppingPoints');

  if (!bus) {
    return apiResponse(res, 404, false, null, 'Bus not found');
  }

  return apiResponse(res, 200, true, bus);
});

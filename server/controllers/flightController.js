// /Users/karthikgouda/Desktop/TravelDesk/server/controllers/flightController.js
const asyncHandler = require('express-async-handler');
const Flight = require('../models/Flight');
const apiResponse = require('../utils/apiResponse');
const apiListResponse = require('../utils/apiListResponse');

/**
 * @desc    Get price trend for a route over next 14 days
 * @route   GET /api/flights/price-trend
 * @access  Public
 */
exports.getPriceTrend = asyncHandler(async (req, res) => {
  const { origin, destination } = req.query;
  if (!origin || !destination) {
    return apiResponse(res, 400, false, null, 'origin and destination are required');
  }

  const { buildLocationRegex } = require('../utils/locationHelper');
  const originRegex = new RegExp(`^(${buildLocationRegex(origin)})$`, 'i');
  const destRegex   = new RegExp(`^(${buildLocationRegex(destination)})$`, 'i');

  const startDate = new Date();
  const endDate   = new Date();
  endDate.setDate(endDate.getDate() + 14);

  const flights = await Flight.find({
    $and: [
      { $or: [{ origin: originRegex }, { originCity: originRegex }] },
      { $or: [{ destination: destRegex }, { destinationCity: destRegex }] },
    ],
    departureTime: { $gte: startDate, $lt: endDate },
    status: { $ne: 'cancelled' },
  }).select('departureTime price').lean();

  // Group by date string → collect min price
  const byDate = {};
  for (const f of flights) {
    const dateStr = new Date(f.departureTime).toISOString().split('T')[0];
    if (!byDate[dateStr] || f.price < byDate[dateStr]) {
      byDate[dateStr] = f.price;
    }
  }

  const trend = Object.entries(byDate)
    .map(([date, minPrice]) => ({ date, minPrice }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return apiResponse(res, 200, true, trend, 'Price trend retrieved successfully');
});

/**
 * @desc    Get all flights with filtering, sorting, and pagination
 * @route   GET /api/flights
 * @access  Public
 */
exports.getFlights = asyncHandler(async (req, res, next) => {
  let query;
  
  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude from normal matching
  const removeFields = ['page', 'limit', 'sort', 'passengers', 'priceMin', 'priceMax', 'date', 'origin', 'destination'];
  removeFields.forEach(param => delete reqQuery[param]);

  // Handle distinct query fields
  let queryStr = JSON.stringify(reqQuery);
  // Add $ operators for gte, lte if any exist
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  
  const parsedQuery = JSON.parse(queryStr);

  // 1. Fuzzy matching for Origin/Destination (City or Code)
  const conditions = [];
  const { buildLocationRegex } = require('../utils/locationHelper');

  if (req.query.origin) {
    const originRegex = `^(${buildLocationRegex(req.query.origin)})$`;
    conditions.push({ $or: [
      { origin: { $regex: new RegExp(originRegex, 'i') } },
      { originCity: { $regex: new RegExp(originRegex, 'i') } }
    ]});
  }

  if (req.query.destination) {
    const destRegex = `^(${buildLocationRegex(req.query.destination)})$`;
    conditions.push({ $or: [
      { destination: { $regex: new RegExp(destRegex, 'i') } },
      { destinationCity: { $regex: new RegExp(destRegex, 'i') } }
    ]});
  }

  // Combine conditions with $and if they exist
  if (conditions.length > 0) {
    parsedQuery.$and = conditions;
  }

  // 2. Specific requirement: Date matching
  if (req.query.date) {
    const searchDate = new Date(req.query.date);
    const nextDate = new Date(searchDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    parsedQuery.departureTime = {
      $gte: searchDate,
      $lt: nextDate
    };
  }

  // 3. Price Min/Max
  if (req.query.priceMin || req.query.priceMax) {
    parsedQuery.price = {};
    if (req.query.priceMin) parsedQuery.price.$gte = Number(req.query.priceMin);
    if (req.query.priceMax) parsedQuery.price.$lte = Number(req.query.priceMax);
  }

  // 4. Passengers
  if (req.query.passengers) {
    parsedQuery.availableSeats = { $gte: Number(req.query.passengers) };
  }
  
  // 5. Stops mapping
  if (req.query.stops === '2+') {
    parsedQuery.stops = { $gte: 2 };
  } else if (req.query.stops !== undefined && req.query.stops !== '') {
    parsedQuery.stops = Number(req.query.stops);
  }

  // 6. Airline filter (supports comma-separated list)
  if (req.query.airline) {
    const airlines = req.query.airline.split(',').map(a => a.trim()).filter(Boolean);
    if (airlines.length > 0) {
      parsedQuery.airline = { $in: airlines.map(a => new RegExp(a, 'i')) };
    }
  }

  // 7. Departure time slot filter
  if (req.query.departureTimeSlot) {
    const slot = req.query.departureTimeSlot;
    const slotMap = {
      morning:   [6,  12],
      afternoon: [12, 18],
      evening:   [18, 24],
      night:     [0,   6],
    };
    const range = slotMap[slot];
    if (range) {
      // Filter by hour-of-day using aggregation expression is complex;
      // Fetch with a JS filter post-query for simplicity
      parsedQuery._departureTimeSlot = slot; // marker, removed before query
    }
  }

  // 8. Max duration
  if (req.query.maxDuration) {
    parsedQuery.duration = { $lte: Number(req.query.maxDuration) };
  }

  // 9. Cabin class
  if (req.query.cabinClass && req.query.cabinClass !== 'all') {
    parsedQuery.cabinClass = req.query.cabinClass;
  }

  // Remove internal markers before querying
  const departureTimeSlot = parsedQuery._departureTimeSlot;
  delete parsedQuery._departureTimeSlot;

  // Find resource
  query = Flight.find(parsedQuery);

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort;
    switch(sortBy) {
      case 'price-asc':
        query = query.sort('price');
        break;
      case 'price-desc':
        query = query.sort('-price');
        break;
      case 'duration-asc':
        query = query.sort('duration');
        break;
      case 'departure-asc':
        query = query.sort('departureTime');
        break;
      default:
        query = query.sort('departureTime');
    }
  } else {
    query = query.sort('departureTime');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  query = query.skip(startIndex).limit(limit);

  // Execute query
  let flights = await query;

  // Apply departure time slot filter in JS (avoids complex pipeline)
  if (departureTimeSlot) {
    const slotMap = { morning: [6, 12], afternoon: [12, 18], evening: [18, 24], night: [0, 6] };
    const [startH, endH] = slotMap[departureTimeSlot] || [0, 24];
    flights = flights.filter(f => {
      const h = new Date(f.departureTime).getHours();
      return h >= startH && h < endH;
    });
  }
  
  // 6. Smart Date Recommendations (If no exact matches found)
  let recommendations = [];
  if (flights.length === 0 && req.query.date) {
    const wideSearchDate = new Date(req.query.date);
    const startDate = new Date(wideSearchDate);
    startDate.setDate(startDate.getDate() - 3);
    const endDate = new Date(wideSearchDate);
    endDate.setDate(endDate.getDate() + 4);

    const recQuery = { ...parsedQuery };
    recQuery.departureTime = { $gte: startDate, $lt: endDate };
    
    recommendations = await Flight.find(recQuery).limit(10).sort('departureTime');
  }
  
  // Get total count for pagination
  const total = await Flight.countDocuments(parsedQuery);

  return res.status(200).json({
    success: true,
    count: flights.length,
    total,
    pagination: {
      page,
      limit,
    },
    data: flights,
    recommendations: recommendations.length > 0 ? recommendations : undefined
  });
});

/**
 * @desc    Get single flight
 * @route   GET /api/flights/:id
 * @access  Public
 */
exports.getFlight = asyncHandler(async (req, res, next) => {
  const flight = await Flight.findById(req.params.id);

  if (!flight) {
    return apiResponse(res, 404, false, null, `Flight not found with ID of ${req.params.id}`);
  }

  return apiResponse(res, 200, true, flight, 'Flight retrieved successfully');
});

/**
 * @desc    Create new flight
 * @route   POST /api/flights
 * @access  Private/Admin
 */
exports.createFlight = asyncHandler(async (req, res, next) => {
  const flight = await Flight.create(req.body);

  return apiResponse(res, 201, true, flight, 'Flight created successfully');
});

// /Users/karthikgouda/Desktop/TravelDesk/server/controllers/hotelController.js
const asyncHandler = require('express-async-handler');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const apiResponse = require('../utils/apiResponse');
const apiListResponse = require('../utils/apiListResponse');

/**
 * @desc    Get all hotels
 * @route   GET /api/hotels
 * @access  Public
 */
exports.getHotels = asyncHandler(async (req, res, next) => {
  let query;

  const reqQuery = { ...req.query };

  // Remove standard meta options from payload query
  const removeFields = ['page', 'limit', 'sort', 'checkIn', 'checkOut', 'guests', 'priceMin', 'priceMax'];
  removeFields.forEach(param => delete reqQuery[param]);

  // Nested property handling for location.city and location.country
  const { buildLocationRegex } = require('../utils/locationHelper');
  if (reqQuery.city) {
    const cityRegex = `^(${buildLocationRegex(reqQuery.city)})$`;
    reqQuery['location.city'] = { $regex: new RegExp(cityRegex, 'i') };
    delete reqQuery.city;
  }
  
  if (reqQuery.country) {
    reqQuery['location.country'] = { $regex: new RegExp(`^${reqQuery.country}$`, 'i') };
    delete reqQuery.country;
  }

  // Handle distinct query fields
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  
  const parsedQuery = JSON.parse(queryStr);
  parsedQuery.isActive = true;

  // We need to fetch matching rooms to handle guests / priceMin / priceMax constraints
  // If no guest/price constraints, simply map all valid hotels
  let matchingHotelIds = null;
  const isRoomConstraint = req.query.guests || req.query.priceMin || req.query.priceMax;

  if (isRoomConstraint) {
    const roomQuery = { status: 'available' };
    
    if (req.query.guests) roomQuery.capacity = { $gte: Number(req.query.guests) };
    if (req.query.priceMin || req.query.priceMax) {
      roomQuery.pricePerNight = {};
      if (req.query.priceMin) roomQuery.pricePerNight.$gte = Number(req.query.priceMin);
      if (req.query.priceMax) roomQuery.pricePerNight.$lte = Number(req.query.priceMax);
    }

    const validRooms = await Room.find(roomQuery).select('hotelId');
    matchingHotelIds = validRooms.map(r => r.hotelId);

    // Apply valid IDs to hotel lookup
    parsedQuery._id = { $in: matchingHotelIds };
  }

  // Set lookup
  query = Hotel.find(parsedQuery);

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  query = query.skip(startIndex).limit(limit);

  // Execute
  const hotels = await query;
  
  // Total doc count for matching criteria
  const total = await Hotel.countDocuments(parsedQuery);

  return apiListResponse(res, 200, hotels, total, page, limit);
});

/**
 * @desc    Get single hotel by ID
 * @route   GET /api/hotels/:id
 * @access  Public
 */
exports.getHotel = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return apiResponse(res, 404, false, null, `Hotel not found with ID of ${req.params.id}`);
  }

  // Ideally, bundle Rooms data with the single hotel for front-end convenience
  const rooms = await Room.find({ hotelId: hotel._id });
  const hotelData = {
    ...hotel._doc,
    rooms,
  };

  return apiResponse(res, 200, true, hotelData, 'Hotel details retrieved');
});

/**
 * @desc    Create new hotel
 * @route   POST /api/hotels
 * @access  Private/Admin
 */
exports.createHotel = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.create(req.body);

  return apiResponse(res, 201, true, hotel, 'Hotel created successfully');
});

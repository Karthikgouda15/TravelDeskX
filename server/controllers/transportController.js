// /Users/karthikgouda/Desktop/TravelDesk/server/controllers/transportController.js
const asyncHandler = require('express-async-handler');
const transportService = require('../services/transportService');
const railwayService = require('../services/railwayService');
const apiResponse = require('../utils/apiResponse');

/**
 * @desc    Search for any transport (Flight, Train, Bus)
 * @route   GET /api/transport/search
 * @access  Public
 */
exports.searchTransport = asyncHandler(async (req, res) => {
  const { category, origin, destination, date, passengers } = req.query;

  if (!category || !origin || !destination || !date) {
    return apiResponse(res, 400, false, null, 'category, origin, destination, and date are required');
  }

  const results = await transportService.unifiedSearch({
    category,
    origin,
    destination,
    date,
    passengers: parseInt(passengers) || 1
  });

  return apiResponse(res, 200, true, results, `Found ${results.length} ${category}s`);
});

/**
 * @desc    Track PNR or Flight Status
 * @route   GET /api/transport/track
 * @access  Public
 */
exports.trackStatus = asyncHandler(async (req, res) => {
  const { type, reference } = req.query;

  if (!type || !reference) {
    return apiResponse(res, 400, false, null, 'type and reference (PNR/Flight No) are required');
  }

  let status;
  if (type === 'train') {
    status = await railwayService.getPNRStatus(reference);
  } else {
    // For now, flight status is mocked here directly
    status = {
      reference,
      status: 'On Time',
      departure: '10:00 AM',
      gate: 'B12'
    };
  }

  return apiResponse(res, 200, true, status, 'Tracking details retrieved');
});

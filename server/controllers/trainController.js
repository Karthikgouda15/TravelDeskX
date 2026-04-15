// /Users/karthikgouda/Desktop/TravelDesk/server/controllers/trainController.js
const asyncHandler = require('express-async-handler');
const Train = require('../models/Train');
const apiResponse = require('../utils/apiResponse');

/**
 * @desc    Search trains between stations
 * @route   GET /api/trains/search
 * @access  Public
 */
exports.searchTrains = asyncHandler(async (req, res) => {
  const { origin, destination, date, coachClass } = req.query;

  if (!origin || !destination || !date) {
    return apiResponse(res, 400, false, null, 'origin, destination and date are required');
  }

  const dayOfWeek = new Date(date).toLocaleString('en-us', { weekday: 'short' });

  // Intelligent search: find trains that pass through BOTH stations in correct order
  // Using stationCode or stationName for flexibility
  const trains = await Train.find({
    runsOn: dayOfWeek,
    isActive: true,
    $and: [
      {
        $or: [
          { 'route.stationCode': origin.toUpperCase() },
          { 'route.stationName': { $regex: origin, $options: 'i' } }
        ]
      },
      {
        $or: [
          { 'route.stationCode': destination.toUpperCase() },
          { 'route.stationName': { $regex: destination, $options: 'i' } }
        ]
      }
    ]
  });

  // Filter and compute specific details for this leg
  const filteredTrains = trains.filter(train => {
    const originIdx = train.route.findIndex(r => 
      r.stationCode === origin.toUpperCase() || r.stationName.toLowerCase().includes(origin.toLowerCase())
    );
    const destIdx = train.route.findIndex(r => 
      r.stationCode === destination.toUpperCase() || r.stationName.toLowerCase().includes(destination.toLowerCase())
    );
    return originIdx !== -1 && destIdx !== -1 && originIdx < destIdx;
  }).map(train => {
    const originIdx = train.route.findIndex(r => 
      r.stationCode === origin.toUpperCase() || r.stationName.toLowerCase().includes(origin.toLowerCase())
    );
    const destIdx = train.route.findIndex(r => 
      r.stationCode === destination.toUpperCase() || r.stationName.toLowerCase().includes(destination.toLowerCase())
    );

    const legRoute = train.route.slice(originIdx, destIdx + 1);
    
    // If user filtered by class, we only show that train if it has that class
    if (coachClass && !train.classes.some(c => c.type === coachClass)) {
      return null;
    }

    return {
      ...train.toObject(),
      departureTime: train.route[originIdx].departureTime,
      arrivalTime: train.route[destIdx].arrivalTime,
      fromStation: train.route[originIdx],
      toStation: train.route[destIdx],
      legDuration: "Calculated Duration", // In production would be mathematical diff
    };
  }).filter(t => t !== null);

  return apiResponse(res, 200, true, filteredTrains, `Found ${filteredTrains.length} trains`);
});

/**
 * @desc    Station autocomplete
 * @route   GET /api/trains/stations
 * @access  Public
 */
exports.getStations = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return apiResponse(res, 200, true, []);

  // In a real DB, you'd have a Stations collection. 
  // Here we extract unique stations from existing train routes as a smart fallback.
  const stations = await Train.aggregate([
    { $unwind: "$route" },
    {
      $match: {
        $or: [
          { "route.stationCode": { $regex: `^${q}`, $options: "i" } },
          { "route.stationName": { $regex: q, $options: "i" } }
        ]
      }
    },
    {
      $group: {
        _id: "$route.stationCode",
        name: { $first: "$route.stationName" },
        code: { $first: "$route.stationCode" }
      }
    },
    { $limit: 10 }
  ]);

  return apiResponse(res, 200, true, stations);
});

/**
 * @desc    Get PNR Status (Mock)
 * @route   GET /api/trains/pnr/:pnr
 * @access  Public
 */
exports.getPNRStatus = asyncHandler(async (req, res) => {
  const { pnr } = req.params;
  
  if (!pnr || pnr.length !== 10) {
    return apiResponse(res, 400, false, null, 'Invalid PNR format. Must be 10 digits.');
  }

  // Realistic mock data
  const status = {
    pnr,
    trainName: "Mumbai Rajdhani Express",
    trainNumber: "12951",
    dateOfJourney: "2026-04-20",
    chartStatus: "CHART PREPARED",
    passengers: [
      { name: "S. KUMAR", age: 34, gender: "M", bookingStatus: "CNF", currentStatus: "CNF/B4/22", coach: "B4", berth: "22 (Lower)" },
      { name: "A. KUMAR", age: 31, gender: "F", bookingStatus: "CNF", currentStatus: "CNF/B4/23", coach: "B4", berth: "23 (Middle)" }
    ],
    from: "BCT",
    to: "NDLS",
    class: "3A"
  };

  return apiResponse(res, 200, true, status);
});

/**
 * @desc    Get Live Running Status (Mock)
 * @route   GET /api/trains/:number/status
 * @access  Public
 */
exports.getLiveStatus = asyncHandler(async (req, res) => {
  const { number } = req.params;

  const status = {
    trainNumber: number,
    currentStation: "ST (Surat)",
    status: "Departed 5m ago",
    delay: "8 mins delayed",
    lastUpdated: new Date().toISOString(),
    nextStation: "BRC (Vadodara)",
    etaNext: "21:55",
    completedPercentage: 42,
    stops: [
       { station: "BCT", status: "Departed", time: "17:00", delay: "0" },
       { station: "ST", status: "Departed", time: "20:20", delay: "8" },
       { station: "BRC", status: "Upcoming", time: "21:50", delay: "5" },
       { station: "NDLS", status: "Upcoming", time: "08:30", delay: "0" }
    ]
  };

  return apiResponse(res, 200, true, status);
});

/**
 * @desc    Get Popular Routes
 * @route   GET /api/trains/popular-routes
 * @access  Public
 */
exports.getPopularRoutes = asyncHandler(async (req, res) => {
  const popular = [
    { from: 'Mumbai', fromCode: 'BCT', to: 'New Delhi', toCode: 'NDLS', price: 1900, image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5' },
    { from: 'Delhi', fromCode: 'NDLS', to: 'Varanasi', toCode: 'BSB', price: 1200, image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc' },
    { from: 'Bangalore', fromCode: 'SBC', to: 'Chennai', toCode: 'MAS', price: 800, image: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073' },
    { from: 'Kolkata', fromCode: 'HWH', to: 'Puri', toCode: 'PURI', price: 950, image: 'https://images.unsplash.com/photo-1506461883276-594c8cb25638' }
  ];

  return apiResponse(res, 200, true, popular);
});

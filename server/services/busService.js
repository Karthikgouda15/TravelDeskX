// /Users/karthikgouda/Desktop/TravelDesk/server/services/busService.js
const Bus = require('../models/Bus');

/**
 * Search for buses based on origin city, destination city and date.
 */
exports.searchBuses = async (origin, destination, date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const { buildLocationRegex } = require('../utils/locationHelper');
  const originRegex = buildLocationRegex(origin);
  const destRegex = buildLocationRegex(destination);

  return await Bus.find({
    $and: [
      {
        $or: [
          { 'origin.city': { $regex: new RegExp(`^(${originRegex})$`, 'i') } },
          { 'origin.stationName': { $regex: new RegExp(originRegex, 'i') } }
        ]
      },
      {
        $or: [
          { 'destination.city': { $regex: new RegExp(`^(${destRegex})$`, 'i') } },
          { 'destination.stationName': { $regex: new RegExp(destRegex, 'i') } }
        ]
      }
    ],
    'origin.departureTime': { $gte: startOfDay, $lte: endOfDay },
    isActive: true
  }).sort({ 'origin.departureTime': 1 });
};

/**
 * Get Bus Seat Layout (Mock)
 */
exports.getBusSeats = async (busId) => {
  const bus = await Bus.findById(busId);
  if (!bus) throw new Error('Bus not found');

  // Simple logic to generate a seat map
  const seats = [];
  for (let i = 1; i <= bus.totalSeats; i++) {
    seats.push({
      id: i,
      number: `${i}`,
      status: Math.random() > 0.3 ? 'available' : 'booked',
      type: i % 2 === 0 ? 'Window' : 'Aisle'
    });
  }
  return seats;
};

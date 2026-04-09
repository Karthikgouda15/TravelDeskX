// /Users/karthikgouda/Desktop/TravelDesk/server/services/transportService.js
const flightService = require('./amadeusService');
const railwayService = require('./railwayService');
const busService = require('./busService');

/**
 * Universal Search Orchestrator.
 * Handles unified search across all transport modes.
 */
exports.unifiedSearch = async ({ category, origin, destination, date, passengers }) => {
  switch (category.toLowerCase()) {
    case 'flight':
      return await flightService.searchFlightOffers(origin, destination, date, passengers);
    
    case 'train':
      return await railwayService.searchTrains(origin, destination, date);
    
    case 'bus':
      return await busService.searchBuses(origin, destination, date);
    
    default:
      throw new Error(`Invalid transport category: ${category}`);
  }
};

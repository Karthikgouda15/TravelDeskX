// /Users/karthikgouda/Desktop/TravelDesk/server/services/railwayService.js
const Train = require('../models/Train');

/**
 * Search for trains based on origin, destination and date.
 * Note: Our current model uses stationCodes. Real implementation would handle multiple stations in a city.
 */
exports.searchTrains = async (origin, destination, date) => {
  // Parsing the date to get the day of the week
  const dayOfWeek = new Date(date).toLocaleString('en-us', { weekday: 'short' });

  const { buildLocationRegex } = require('../utils/locationHelper');
  const originRegex = buildLocationRegex(origin);
  const destRegex = buildLocationRegex(destination);

  // Find trains that have both origin and destination in their route
  // We match by stationCode OR stationName (fuzzy)
  const trains = await Train.find({
    runsOn: dayOfWeek,
    isActive: true,
    $and: [
      {
        $or: [
          { 'route.stationCode': { $regex: new RegExp(`^(${originRegex})$`, 'i') } },
          { 'route.stationName': { $regex: new RegExp(originRegex, 'i') } }
        ]
      },
      {
        $or: [
          { 'route.stationCode': { $regex: new RegExp(`^(${destRegex})$`, 'i') } },
          { 'route.stationName': { $regex: new RegExp(destRegex, 'i') } }
        ]
      }
    ]
  });

  // Filter to ensure origin station comes before destination station in the route array
  return trains.filter(train => {
    const originRegexObj = new RegExp(originRegex, 'i');
    const destRegexObj = new RegExp(destRegex, 'i');

    const originIdx = train.route.findIndex(r => 
      originRegexObj.test(r.stationCode) || originRegexObj.test(r.stationName)
    );
    const destIdx = train.route.findIndex(r => 
      destRegexObj.test(r.stationCode) || destRegexObj.test(r.stationName)
    );
    return originIdx !== -1 && destIdx !== -1 && originIdx < destIdx;
  });
};

/**
 * Get PNR Status (Mock)
 */
exports.getPNRStatus = async (pnr) => {
  // Production-level logic would fetch from a GDS or railway API
  return {
    pnr,
    status: 'CNF', // Confirmed
    chartPrepared: true,
    passengers: [
      { name: 'John Doe', seat: 'S1, 24', status: 'CNF' }
    ],
    train: {
      number: '12951',
      name: 'Mumbai Rajdhani'
    }
  };
};

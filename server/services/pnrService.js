// /Users/karthikgouda/Desktop/TravelDesk/server/services/pnrService.js
const Booking = require('../models/Booking');

/**
 * PNR Tracking Engine.
 * Simulates real-time status fetching for various travel documents.
 */
exports.trackStatus = async (type, reference) => {
  // Production logic: Connect to external NSDL/IRCTC/Amadeus scrapers or APIs
  // For this startup build, we simulate a robust response based on existing data if possible
  
  const statuses = [
    'Confirmed',
    'RAC (Reservation Against Cancellation)',
    'WL (Waitlisted)',
    'On Time',
    'Delayed (15 mins)',
    'Boarding'
  ];

  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

  return {
    reference,
    category: type,
    status: randomStatus,
    updatedAt: new Date(),
    details: {
      fareClass: type === 'train' ? '3A' : 'Economy',
      seat: type === 'bus' ? 'L-12' : 'S1, 45',
      platform: type === 'train' ? 'PF 5' : 'Bay 10'
    }
  };
};

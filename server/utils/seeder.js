// /Users/karthikgouda/Desktop/TravelDesk/server/utils/seeder.js
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../config/db');
const Flight = require('../models/Flight');
const Seat = require('../models/Seat');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const User = require('../models/User');
const Train = require('../models/Train');
const Bus = require('../models/Bus');

// ─────────────────────────────────────────────
// Helper Utilities
// ─────────────────────────────────────────────

const addMinutes = (date, mins) => new Date(date.getTime() + mins * 60000);
const addHours = (date, hrs) => addMinutes(date, hrs * 60);
const addDays = (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[randomInt(0, arr.length - 1)];

// ─────────────────────────────────────────────
// Flight Seed Data
// ─────────────────────────────────────────────

const AIRLINES = [
  'IndiGo', 'Air India', 'Emirates', 'Singapore Airlines',
  'British Airways', 'Lufthansa', 'Qatar Airways', 'SpiceJet', 'Vistara', 'United Airlines'
];

const ROUTES = [
  { origin: 'DEL', originCity: 'New Delhi', destination: 'BOM', destinationCity: 'Mumbai', baseMinutes: 130, stops: 0 },
  { origin: 'BOM', originCity: 'Mumbai', destination: 'BLR', destinationCity: 'Bengaluru', baseMinutes: 110, stops: 0 },
  { origin: 'DXB', originCity: 'Dubai', destination: 'LHR', destinationCity: 'London', baseMinutes: 480, stops: 0 },
  { origin: 'SIN', originCity: 'Singapore', destination: 'SYD', destinationCity: 'Sydney', baseMinutes: 490, stops: 0 },
  { origin: 'JFK', originCity: 'New York', destination: 'LAX', destinationCity: 'Los Angeles', baseMinutes: 360, stops: 0 },
  { origin: 'DEL', originCity: 'New Delhi', destination: 'DXB', destinationCity: 'Dubai', baseMinutes: 240, stops: 0 },
  { origin: 'LHR', originCity: 'London', destination: 'JFK', destinationCity: 'New York', baseMinutes: 420, stops: 1 },
  { origin: 'BOM', originCity: 'Mumbai', destination: 'DXB', destinationCity: 'Dubai', baseMinutes: 180, stops: 0 },
  { origin: 'SIN', originCity: 'Singapore', destination: 'DEL', destinationCity: 'New Delhi', baseMinutes: 310, stops: 0 },
  { origin: 'SYD', originCity: 'Sydney', destination: 'SIN', destinationCity: 'Singapore', baseMinutes: 500, stops: 0 },
  { origin: 'BLR', originCity: 'Bengaluru', destination: 'PNQ', destinationCity: 'Pune', baseMinutes: 90, stops: 0 },
  { origin: 'PNQ', originCity: 'Pune', destination: 'BLR', destinationCity: 'Bengaluru', baseMinutes: 90, stops: 0 },
];

const CABIN_CLASSES = ['economy', 'business', 'first'];

const BASE_PRICES = {
  economy: { min: 3500, max: 25000 },
  business: { min: 15000, max: 90000 },
  first: { min: 50000, max: 180000 },
};

const LOGO_MAP = {
  'IndiGo': '/public/images/airlines/indigo.png',
  'Air India': '/public/images/airlines/air_india.png',
  'Emirates': '/public/images/airlines/emirates.png',
  'Singapore Airlines': '/public/images/airlines/singapore.png',
  'British Airways': '/public/images/airlines/emirates.png', // Fallback
  'Lufthansa': '/public/images/airlines/indigo.png', // Fallback
  'Qatar Airways': '/public/images/airlines/emirates.png', // Fallback
  'SpiceJet': '/public/images/airlines/indigo.png', // Fallback
  'Vistara': '/public/images/airlines/air_india.png', // Fallback
  'United Airlines': '/public/images/airlines/indigo.png', // Fallback
};

const generateFlights = () => {
  const flights = [];
  const usedFlightNumbers = new Set();
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);

  // 5 flights per route across different cabin classes and departure days
  ROUTES.forEach((route, routeIdx) => {
    const routeFlightCount = 5;

    for (let i = 0; i < routeFlightCount; i++) {
      const airline = pick(AIRLINES);
      const cabinClass = CABIN_CLASSES[i % CABIN_CLASSES.length];
      const dayOffset = i * 3; // Different departure days
      const hourOffset = randomInt(5, 22); // 5 AM to 10 PM departure

      const departureTime = addHours(addDays(baseDate, dayOffset), hourOffset);
      const durationMinutes = route.baseMinutes + randomInt(-20, 40);
      const arrivalTime = addMinutes(departureTime, durationMinutes);

      const priceRange = BASE_PRICES[cabinClass];
      const price = randomInt(priceRange.min, priceRange.max);
      const totalSeats = cabinClass === 'economy' ? 150 : cabinClass === 'business' ? 30 : 10;
      const availableSeats = randomInt(Math.floor(totalSeats * 0.2), totalSeats);

      // airline prefix + number — guaranteed unique
      let flightNumber;
      do {
        const prefix = airline.substring(0, 2).toUpperCase();
        flightNumber = `${prefix}${randomInt(1000, 9999)}`;
      } while (usedFlightNumbers.has(flightNumber));
      usedFlightNumbers.add(flightNumber);

      flights.push({
        airline,
        flightNumber,
        origin: route.origin,
        originCity: route.originCity,
        destination: route.destination,
        destinationCity: route.destinationCity,
        departureTime,
        arrivalTime,
        stops: route.stops,
        price,
        cabinClass,
        totalSeats,
        availableSeats,
        status: pick(['scheduled', 'scheduled', 'scheduled', 'delayed']),
        airlineLogo: LOGO_MAP[airline] || '/public/images/airlines/indigo.png'
      });
    }
  });

  return flights;
};

// ─────────────────────────────────────────────
// Hotel Seed Data
// ─────────────────────────────────────────────

const HOTELS_RAW = [
  {
    name: 'The Imperial New Delhi',
    location: { city: 'Delhi', country: 'India', coordinates: [77.2167, 28.6139] },
    starRating: 5,
    amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Concierge'],
    images: ['/public/images/hotels/delhi_luxury.png'],
    description: 'A heritage luxury hotel in the heart of Lutyens Delhi, offering timeless elegance and world-class hospitality.',
    totalRooms: 50,
  },
  {
    name: 'Taj Mahal Palace Mumbai',
    location: { city: 'Mumbai', country: 'India', coordinates: [72.8347, 18.9217] },
    starRating: 5,
    amenities: ['WiFi', 'Sea View', 'Pool', 'Spa', 'Multiple Restaurants', 'Bar', 'Butler Service'],
    images: ['/public/images/hotels/mumbai_taj.png'],
    description: 'Iconic heritage hotel overlooking the Gateway of India, blending Moorish, Oriental, and Florentine styles.',
    totalRooms: 60,
  },
  {
    name: 'ITC Gardenia Bangalore',
    location: { city: 'Bangalore', country: 'India', coordinates: [77.5946, 12.9716] },
    starRating: 5,
    amenities: ['WiFi', 'Rooftop Pool', 'Spa', 'Gym', 'Fine Dining', 'Business Centre'],
    images: ['/public/images/hotels/delhi_luxury.png'],
    description: 'A LEED Platinum-rated luxury hotel, combining sustainability with world-class comfort in the Silicon Valley of India.',
    totalRooms: 40,
  },
  {
    name: 'Burj Al Arab Dubai',
    location: { city: 'Dubai', country: 'UAE', coordinates: [55.1853, 25.1412] },
    starRating: 5,
    amenities: ['Private Beach', 'Helipad', 'Butler Service', 'Infinity Pool', 'Michelin Star Dining', 'Spa'],
    images: ['/public/images/hotels/delhi_luxury.png'],
    description: 'The world\'s most iconic 7-star hotel, offering ultra-luxurious suites and personalised butler service.',
    totalRooms: 25,
  },
  {
    name: 'The Ritz London',
    location: { city: 'London', country: 'United Kingdom', coordinates: [-0.1419, 51.5074] },
    starRating: 5,
    amenities: ['Afternoon Tea', 'Spa', 'Fine Dining', 'Bar', 'Concierge', 'WiFi'],
    images: ['/public/images/hotels/mumbai_taj.png'],
    description: 'A quintessential London institution since 1906, celebrated for afternoon tea and unmatched British elegance.',
    totalRooms: 35,
  },
  {
    name: 'Marina Bay Sands Singapore',
    location: { city: 'Singapore', country: 'Singapore', coordinates: [103.8610, 1.2834] },
    starRating: 5,
    amenities: ['Infinity Pool', 'Casino', 'Shops', 'Spa', 'Multiple Restaurants', 'SkyPark'],
    images: ['/public/images/hotels/delhi_luxury.png'],
    description: 'An iconic integrated resort featuring the world-famous rooftop infinity pool with panoramic city views.',
    totalRooms: 80,
  },
  {
    name: 'Hotel Leela Palace Delhi',
    location: { city: 'Delhi', country: 'India', coordinates: [77.2273, 28.6219] },
    starRating: 5,
    amenities: ['WiFi', 'Spa', 'Pool', 'Fine Dining', 'Gym', 'Business Centre', 'Valet Parking'],
    images: ['/public/images/hotels/delhi_luxury.png'],
    description: 'A palatial urban resort offering regal architecture, landscaped gardens, and iconic Indian hospitality.',
    totalRooms: 45,
  },
  {
    name: 'The Oberoi Mumbai',
    location: { city: 'Mumbai', country: 'India', coordinates: [72.8230, 18.9322] },
    starRating: 5,
    amenities: ['WiFi', 'Sea View', 'Spa', 'Pool', 'Fine Dining', 'Gym'],
    images: ['/public/images/hotels/mumbai_taj.png'],
    description: 'Overlooking the Arabian Sea and Marine Drive, this elegant high-rise delivers a world-class luxury experience.',
    totalRooms: 30,
  },
  {
    name: 'Raffles Singapore',
    location: { city: 'Singapore', country: 'Singapore', coordinates: [103.8527, 1.2950] },
    starRating: 5,
    amenities: ['WiFi', 'Historic Architecture', 'Fine Dining', 'Spa', 'Courtyard Bar', 'Concierge'],
    images: ['/public/images/hotels/mumbai_taj.png'],
    description: 'A legendary colonial landmark since 1887, home of the Singapore Sling and unrivalled old-world charm.',
    totalRooms: 20,
  },
  {
    name: 'JW Marriott Dubai Marina',
    location: { city: 'Dubai', country: 'UAE', coordinates: [55.1415, 25.0781] },
    starRating: 5,
    amenities: ['WiFi', 'Marina View', 'Pool', 'Spa', 'Gym', 'Multiple Restaurants', 'Rooftop Bar'],
    images: ['/public/images/hotels/delhi_luxury.png'],
    description: 'A sleek contemporary tower in Dubai Marina, offering full luxury amenities with stunning waterfront views.',
    totalRooms: 55,
  },
];

const ROOM_TYPES = ['standard', 'deluxe', 'suite'];

const ROOM_AMENITIES = {
  standard: ['WiFi', 'TV', 'AC', 'Mini Bar'],
  deluxe: ['WiFi', 'TV', 'AC', 'Mini Bar', 'City View', 'King Bed', 'Bathtub'],
  suite: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Panoramic View', 'King Bed', 'Jacuzzi', 'Living Room', 'Private Balcony'],
};

const PRICE_RANGES = {
  standard: { min: 3000, max: 8000 },
  deluxe: { min: 8000, max: 20000 },
  suite: { min: 20000, max: 60000 },
};

const generateRoomsForHotel = (hotelId) => {
  const rooms = [];
  // 5 rooms per hotel (2 standard, 2 deluxe, 1 suite)
  const types = ['standard', 'standard', 'deluxe', 'deluxe', 'suite'];
  
  types.forEach((type, idx) => {
    const floor = randomInt(1, 20);
    const roomNumber = `${floor}0${idx + 1}`;
    const priceRange = PRICE_RANGES[type];
    
    rooms.push({
      hotelId,
      roomNumber,
      type,
      pricePerNight: randomInt(priceRange.min, priceRange.max),
      status: pick(['available', 'available', 'available', 'booked']),
      capacity: type === 'standard' ? 2 : type === 'deluxe' ? 3 : 4,
      amenities: ROOM_AMENITIES[type],
    });
  });
  
  return rooms;
};

// ─────────────────────────────────────────────
// Train Seed Data
// ─────────────────────────────────────────────
const TRAIN_ROUTES = [
  { origin: 'SBC', originName: 'KSR Bengaluru', destination: 'PUNE', destinationName: 'Pune Jn', minutes: 750 },
  { origin: 'PUNE', originName: 'Pune Jn', destination: 'SBC', destinationName: 'KSR Bengaluru', minutes: 750 },
  { origin: 'NDLS', originName: 'New Delhi', destination: 'BCT', destinationName: 'Mumbai Central', minutes: 960 },
  { origin: 'BCT', originName: 'Mumbai Central', destination: 'NDLS', destinationName: 'New Delhi', minutes: 960 },
];

const TRAIN_NAMES = ['Udyan Express', 'Coimbatore Express', 'Rajdhani Express', 'Duronto Express', 'Shatabdi Express'];

const generateTrains = () => {
  const trains = [];
  TRAIN_ROUTES.forEach((route, idx) => {
    TRAIN_NAMES.forEach((name, nIdx) => {
      const trainNumber = `${randomInt(10000, 29999)}`;
      trains.push({
        trainNumber,
        name,
        operator: 'Indian Railways',
        runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        route: [
          { stationCode: route.origin, stationName: route.originName, departureTime: '08:00', day: 1 },
          { stationCode: route.destination, stationName: route.destinationName, arrivalTime: '20:30', day: 1 }
        ],
        classes: [
          { type: '2A', price: 2500, totalSeats: 40, availableSeats: 12 },
          { type: '3A', price: 1800, totalSeats: 64, availableSeats: 30 },
          { type: 'SL', price: 650, totalSeats: 80, availableSeats: 5 }
        ]
      });
    });
  });
  return trains;
};

// ─────────────────────────────────────────────
// Bus Seed Data
// ─────────────────────────────────────────────
const BUS_OPERATORS = ['VRL Travels', 'SRS Travels', 'National Travels', 'Orange Travels', 'KSRTC'];
const BUS_TYPES = ['AC Sleeper', 'Non-AC Sleeper', 'Luxury Multi-Axle'];

const generateBuses = () => {
  const buses = [];
  const baseDate = new Date();
  
  ['Bengaluru', 'Pune', 'Mumbai', 'Delhi'].forEach(origin => {
    ['Pune', 'Bengaluru', 'Mumbai', 'Delhi'].forEach(destination => {
      if (origin === destination) return;
      
      BUS_OPERATORS.forEach((op, opIdx) => {
        const departureTime = addHours(baseDate, randomInt(18, 22)); // Evening buses
        const arrivalTime = addHours(departureTime, 12);
        
        buses.push({
          busNumber: `KA-${randomInt(10, 99)}-${randomInt(1000, 9999)}`,
          operatorName: op,
          busType: pick(BUS_TYPES),
          origin: { city: origin, stationName: `${origin} Main Stand`, departureTime },
          destination: { city: destination, stationName: `${destination} Terminal`, arrivalTime },
          price: randomInt(800, 2500),
          totalSeats: 36,
          availableSeats: randomInt(5, 30),
          amenities: ['WiFi', 'Charging Point', 'Water Bottle']
        });
      });
    });
  });
  return buses;
};


// ─────────────────────────────────────────────
// Admin User for Seeding
// ─────────────────────────────────────────────
const ADMIN_USER = {
  name: 'TravelDesk Admin',
  email: 'admin@traveldesk.io',
  password: 'Admin@12345',
  role: 'admin',
};

// ─────────────────────────────────────────────
// Import (Seed) Data
// ─────────────────────────────────────────────
const importData = async () => {
  try {
    await connectDB();

    // Wipe existing data
    await Flight.deleteMany({});
    await Hotel.deleteMany({});
    await Room.deleteMany({});
    await Seat.deleteMany({});
    await Train.deleteMany({});
    await Bus.deleteMany({});
    await User.deleteMany({ role: 'admin' });

    console.log('🗑️  Existing data destroyed...');

    // Create Admin user
    await User.create(ADMIN_USER);
    console.log('👤  Admin user created: admin@traveldesk.io / Admin@12345');

    // Insert Flights
    const flightData = generateFlights();
    await Flight.insertMany(flightData);
    console.log(`✈️   ${flightData.length} flights seeded across ${ROUTES.length} routes`);

    // Insert Hotels + Rooms
    let totalRooms = 0;
    for (const hotelRaw of HOTELS_RAW) {
      const hotel = await Hotel.create(hotelRaw);
      const rooms = generateRoomsForHotel(hotel._id);
      await Room.insertMany(rooms);
      totalRooms += rooms.length;
    }
    console.log(`🏨  ${HOTELS_RAW.length} hotels seeded with ${totalRooms} total rooms`);

    // Insert Trains
    const trainData = generateTrains();
    await Train.insertMany(trainData);
    console.log(`🚆  ${trainData.length} trains seeded`);

    // Insert Buses
    const busData = generateBuses();
    await Bus.insertMany(busData);
    console.log(`🚌  ${busData.length} buses seeded`);

    console.log('✅  Data import complete!');
    process.exit(0);
  } catch (err) {
    console.error(`❌  Error seeding data: ${err.message}`);
    process.exit(1);
  }
};

// ─────────────────────────────────────────────
// Destroy (Wipe) Data
// ─────────────────────────────────────────────
const destroyData = async () => {
  try {
    await connectDB();

    await Flight.deleteMany({});
    await Hotel.deleteMany({});
    await Room.deleteMany({});
    await Seat.deleteMany({});
    await User.deleteMany({ role: 'admin' });

    console.log('💥  Data destroyed!');
    process.exit(0);
  } catch (err) {
    console.error(`❌  Error destroying data: ${err.message}`);
    process.exit(1);
  }
};

// CLI flag: node seeder.js -d to destroy, else import
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}

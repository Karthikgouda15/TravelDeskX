// /Users/karthikgouda/Desktop/TravelDesk/server/seedTransport.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Train = require('./models/Train');
const Bus = require('./models/Bus');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/traveldesk');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Train.deleteMany();
    await Bus.deleteMany();

    // Seed Trains
    const trains = [
      {
        trainNumber: '12951',
        name: 'Mumbai Rajdhani Express',
        operator: 'Indian Railways',
        runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        route: [
          { stationCode: 'BCT', stationName: 'Mumbai Central', arrivalTime: '--', departureTime: '17:00', day: 1 },
          { stationCode: 'ST', stationName: 'Surat', arrivalTime: '20:15', departureTime: '20:20', day: 1 },
          { stationCode: 'BRC', stationName: 'Vadodara', arrivalTime: '21:40', departureTime: '21:50', day: 1 },
          { stationCode: 'NDLS', stationName: 'New Delhi', arrivalTime: '08:30', departureTime: '--', day: 2 },
        ],
        classes: [
          { type: '1A', price: 4500, totalSeats: 20, availableSeats: 5 },
          { type: '2A', price: 2800, totalSeats: 40, availableSeats: 12 },
          { type: '3A', price: 1900, totalSeats: 60, availableSeats: 25 },
        ]
      },
      {
        trainNumber: '12002',
        name: 'Bhopal Shatabdi Express',
        operator: 'Indian Railways',
        runsOn: ['Mon', 'Tue', 'Wed', 'Fri', 'Sat', 'Sun'],
        route: [
          { stationCode: 'NDLS', stationName: 'New Delhi', arrivalTime: '--', departureTime: '06:00', day: 1 },
          { stationCode: 'AGC', stationName: 'Agra Cantt', arrivalTime: '07:50', departureTime: '07:55', day: 1 },
          { stationCode: 'GWL', stationName: 'Gwalior', arrivalTime: '09:20', departureTime: '09:25', day: 1 },
          { stationCode: 'HBJ', stationName: 'Habibganj', arrivalTime: '14:25', departureTime: '--', day: 1 },
        ],
        classes: [
          { type: 'CC', price: 1100, totalSeats: 120, availableSeats: 45 },
          { type: 'EC', price: 2200, totalSeats: 30, availableSeats: 10 },
        ]
      }
    ];

    // Seed Buses
    const buses = [
      {
        busNumber: 'MH-12-QU-1234',
        operatorName: 'Purple Travels',
        busType: 'AC Sleeper',
        origin: { city: 'Mumbai', stationName: 'Borivali', departureTime: new Date('2026-06-15T21:00:00') },
        destination: { city: 'Pune', stationName: 'Swargate', arrivalTime: new Date('2026-06-16T00:30:00') },
        price: 850,
        totalSeats: 30,
        availableSeats: 12,
        amenities: ['WiFi', 'Charging Point', 'Blanket'],
        rating: 4.5
      },
      {
        busNumber: 'DL-01-AX-9999',
        operatorName: 'ZingBus',
        busType: 'Luxury Multi-Axle',
        origin: { city: 'Delhi', stationName: 'ISBT Kashmiri Gate', departureTime: new Date('2026-06-15T22:00:00') },
        destination: { city: 'Jaipur', stationName: 'Sindhi Camp', arrivalTime: new Date('2026-06-16T04:00:00') },
        price: 1200,
        totalSeats: 40,
        availableSeats: 22,
        amenities: ['WiFi', 'Water Bottle', 'CCTV'],
        rating: 4.8
      }
    ];

    await Train.insertMany(trains);
    await Bus.insertMany(buses);

    console.log('Seeding completed successfully!');
    process.exit();
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

seedData();

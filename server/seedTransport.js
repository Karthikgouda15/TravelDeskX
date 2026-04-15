const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Train = require('./models/Train');
const Bus = require('./models/Bus');

dotenv.config();

// Configuration
const ROUTES = [
  { from: 'Mumbai', to: 'Goa', basePrice: 1200, duration: 720 },
  { from: 'Bangalore', to: 'Hyderabad', basePrice: 900, duration: 540 },
  { from: 'Delhi', to: 'Manali', basePrice: 1800, duration: 840 },
  { from: 'Chennai', to: 'Bangalore', basePrice: 600, duration: 360 },
  { from: 'Pune', to: 'Mumbai', basePrice: 400, duration: 180 },
  { from: 'Delhi', to: 'Jaipur', basePrice: 500, duration: 300 },
  { from: 'Hyderabad', to: 'Bangalore', basePrice: 950, duration: 560 },
  { from: 'Kolkata', to: 'Siliguri', basePrice: 1100, duration: 660 },
  { from: 'Ahmedabad', to: 'Rajkot', basePrice: 450, duration: 240 },
  { from: 'Mumbai', to: 'Pune', basePrice: 400, duration: 180 }
];

const OPERATORS = [
  'Purple Metrolink', 'ZingBus Premium', 'IntrCity SmartBus', 'SRS Travels', 
  'Neeta Tours', 'VRL Travels', 'KPN Travels', 'Humsafar Travels', 
  'Shrinath Travels', 'Hebron Transports'
];

const BUS_TYPES = [
  'AC Sleeper', 'Non-AC Sleeper', 'AC Semi-Sleeper', 'Luxury Multi-Axle', 'Standard', 'Scania Multi-Axle', 'Volvo B11R'
];

const AMENITIES = [
  'WiFi', 'Charging Point', 'Water Bottle', 'Blanket', 'Reading Light', 
  'CCTV', 'GPS', 'Pillow', 'M-Ticket', 'Emergency Contact'
];

const generateBuses = () => {
  const buses = [];
  const today = new Date();
  
  // For each route, generate buses for the next 30 days
  ROUTES.forEach(route => {
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const date = new Date(today);
      date.setDate(today.getDate() + dayOffset);
      
      // 2 buses per route per day
      for (let i = 0; i < 2; i++) {
        const departureTime = new Date(date);
        departureTime.setHours(18 + i * 2, 0, 0, 0); // 6PM and 8PM departures
        
        const arrivalTime = new Date(departureTime);
        arrivalTime.setMinutes(departureTime.getMinutes() + route.duration + (Math.random() * 60 - 30));

        const operator = OPERATORS[Math.floor(Math.random() * OPERATORS.length)];
        const busType = BUS_TYPES[Math.floor(Math.random() * BUS_TYPES.length)];
        
        buses.push({
          busNumber: `${route.from.substring(0,2)}-${dayOffset}-${i}-${Math.floor(Math.random()*1000)}`.toUpperCase(),
          operatorName: operator,
          busType: busType,
          origin: { 
            city: route.from, 
            stationName: `${route.from} Main Terminal`, 
            departureTime: departureTime 
          },
          destination: { 
            city: route.to, 
            stationName: `${route.to} Central Station`, 
            arrivalTime: arrivalTime 
          },
          price: route.basePrice + Math.floor(Math.random() * 500),
          totalSeats: 36,
          availableSeats: 10 + Math.floor(Math.random() * 20),
          bookedSeats: [],
          amenities: AMENITIES.sort(() => 0.5 - Math.random()).slice(0, 6),
          boardingPoints: [
            { name: `${route.from} Circle`, time: departureTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12: false}), landmark: 'Main Gate' }
          ],
          droppingPoints: [
            { name: `${route.to} Tower`, time: arrivalTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12: false}), landmark: 'City Center' }
          ],
          seatLayout: { hasUpperDeck: true, rows: 9, columns: 4 },
          rating: (4.0 + Math.random().toFixed(1) * 0.9).toFixed(1),
          reviewsCount: 100 + Math.floor(Math.random() * 1000)
        });
      }
    }
  });
  
  return buses;
};

const trainData = [
  {
    trainNumber: '12951',
    name: 'Mumbai Rajdhani Express',
    operator: 'Indian Railways',
    trainType: 'Rajdhani',
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    distance: 1384,
    duration: { hours: 15, minutes: 30 },
    pantryAvailable: true,
    sourceStation: { code: 'BCT', name: 'Mumbai Central' },
    destinationStation: { code: 'NDLS', name: 'New Delhi' },
    classes: [
      { type: '1A', price: 4750, totalSeats: 22, availableSeats: 5 },
      { type: '2A', price: 2850, totalSeats: 48, availableSeats: 12 },
      { type: '3A', price: 2100, totalSeats: 64, availableSeats: 25 },
    ]
  }
];

const seedData = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/traveldesk');
    console.log(`Connected to MongoDB: ${conn.connection.host}`);

    await Bus.deleteMany();
    await Train.deleteMany();

    const buses = generateBuses();
    await Bus.insertMany(buses);
    await Train.insertMany(trainData);

    console.log(`Seeding completed successfully with ${buses.length} buses and ${trainData.length} trains!`);
    process.exit();
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

seedData();

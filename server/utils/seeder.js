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

const addMinutes = (d, m) => new Date(d.getTime() + m * 60000);
const addHours = (d, h) => addMinutes(d, h * 60);
const addDays = (d, days) => new Date(d.getTime() + days * 864e5);
const rInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (a) => a[rInt(0, a.length - 1)];

// ── FLIGHTS ──
const AIRLINES = ['IndiGo','Air India','SpiceJet','Vistara','Emirates','British Airways','Singapore Airlines','Qatar Airways','Lufthansa','United Airlines'];
const LOGO_MAP = {'IndiGo':'/public/images/airlines/indigo.png','Air India':'/public/images/airlines/air_india.png','SpiceJet':'/public/images/airlines/indigo.png','Vistara':'/public/images/airlines/air_india.png','Emirates':'/public/images/airlines/emirates.png','British Airways':'/public/images/airlines/emirates.png','Singapore Airlines':'/public/images/airlines/singapore.png','Qatar Airways':'/public/images/airlines/emirates.png','Lufthansa':'/public/images/airlines/indigo.png','United Airlines':'/public/images/airlines/indigo.png'};
const ROUTES = [
  {o:'DEL',oc:'New Delhi',d:'BOM',dc:'Mumbai',m:130,s:0},{o:'BOM',oc:'Mumbai',d:'DEL',dc:'New Delhi',m:130,s:0},
  {o:'DEL',oc:'New Delhi',d:'BLR',dc:'Bengaluru',m:170,s:0},{o:'BLR',oc:'Bengaluru',d:'DEL',dc:'New Delhi',m:170,s:0},
  {o:'BOM',oc:'Mumbai',d:'BLR',dc:'Bengaluru',m:110,s:0},{o:'BLR',oc:'Bengaluru',d:'BOM',dc:'Mumbai',m:110,s:0},
  {o:'DEL',oc:'New Delhi',d:'MAA',dc:'Chennai',m:180,s:0},{o:'MAA',oc:'Chennai',d:'DEL',dc:'New Delhi',m:180,s:0},
  {o:'DEL',oc:'New Delhi',d:'GOI',dc:'Goa',m:150,s:0},{o:'GOI',oc:'Goa',d:'DEL',dc:'New Delhi',m:150,s:0},
  {o:'DEL',oc:'New Delhi',d:'HYD',dc:'Hyderabad',m:140,s:0},{o:'HYD',oc:'Hyderabad',d:'DEL',dc:'New Delhi',m:140,s:0},
  {o:'BOM',oc:'Mumbai',d:'GOI',dc:'Goa',m:70,s:0},{o:'BOM',oc:'Mumbai',d:'MAA',dc:'Chennai',m:120,s:0},
  {o:'BLR',oc:'Bengaluru',d:'MAA',dc:'Chennai',m:60,s:0},{o:'MAA',oc:'Chennai',d:'BLR',dc:'Bengaluru',m:60,s:0},
  {o:'HYD',oc:'Hyderabad',d:'BLR',dc:'Bengaluru',m:80,s:0},{o:'BLR',oc:'Bengaluru',d:'HYD',dc:'Hyderabad',m:80,s:0},
  {o:'DEL',oc:'New Delhi',d:'DXB',dc:'Dubai',m:240,s:0},{o:'DXB',oc:'Dubai',d:'DEL',dc:'New Delhi',m:240,s:0},
  {o:'BOM',oc:'Mumbai',d:'DXB',dc:'Dubai',m:180,s:0},{o:'BOM',oc:'Mumbai',d:'SIN',dc:'Singapore',m:330,s:0},
  {o:'DEL',oc:'New Delhi',d:'SIN',dc:'Singapore',m:350,s:0},{o:'DEL',oc:'New Delhi',d:'LHR',dc:'London',m:540,s:1},
  {o:'BOM',oc:'Mumbai',d:'LHR',dc:'London',m:570,s:1},{o:'DEL',oc:'New Delhi',d:'JFK',dc:'New York',m:900,s:1},
];
const CLASSES = ['economy','business','first'];
const BPRICE = {economy:{min:3500,max:25000},business:{min:15000,max:90000},first:{min:50000,max:180000}};

const generateFlights = () => {
  const flights = []; const used = new Set(); const base = new Date(); base.setHours(0,0,0,0);
  ROUTES.forEach(r => {
    const count = r.m > 400 ? 3 : 5;
    for (let i = 0; i < count; i++) {
      const airline = pick(AIRLINES); const cc = CLASSES[i % 3]; const day = i * 2; const hr = rInt(5,22);
      const dep = addHours(addDays(base, day), hr); const dur = r.m + rInt(-15,30); const arr = addMinutes(dep, dur);
      const pr = BPRICE[cc]; const ts = cc==='economy'?150:cc==='business'?30:10;
      let fn; do { fn = `${airline.substring(0,2).toUpperCase()}${rInt(1000,9999)}`; } while(used.has(fn)); used.add(fn);
      flights.push({airline,flightNumber:fn,origin:r.o,originCity:r.oc,destination:r.d,destinationCity:r.dc,departureTime:dep,arrivalTime:arr,stops:r.s,price:rInt(pr.min,pr.max),cabinClass:cc,totalSeats:ts,availableSeats:rInt(Math.floor(ts*0.2),ts),status:pick(['scheduled','scheduled','scheduled','delayed']),airlineLogo:LOGO_MAP[airline]||'/public/images/airlines/indigo.png'});
    }
  });
  return flights;
};

// ── HOTELS ──
const HOTELS_RAW = [
  {name:'The Imperial New Delhi',location:{city:'Delhi',country:'India',coordinates:[77.2167,28.6139]},starRating:5,amenities:['WiFi','Pool','Spa','Gym','Restaurant','Bar','Concierge'],images:['/public/images/hotels/delhi_luxury.png'],description:'A heritage luxury hotel in the heart of Lutyens Delhi.',totalRooms:50},
  {name:'Taj Mahal Palace Mumbai',location:{city:'Mumbai',country:'India',coordinates:[72.8347,18.9217]},starRating:5,amenities:['WiFi','Sea View','Pool','Spa','Restaurant','Bar'],images:['/public/images/hotels/mumbai_taj.png'],description:'Iconic heritage hotel overlooking the Gateway of India.',totalRooms:60},
  {name:'ITC Gardenia Bangalore',location:{city:'Bangalore',country:'India',coordinates:[77.5946,12.9716]},starRating:5,amenities:['WiFi','Rooftop Pool','Spa','Gym','Fine Dining'],images:['/public/images/hotels/delhi_luxury.png'],description:'LEED Platinum-rated luxury hotel in Silicon Valley of India.',totalRooms:40},
  {name:'ITC Grand Chola Chennai',location:{city:'Chennai',country:'India',coordinates:[80.2507,13.0827]},starRating:5,amenities:['WiFi','Pool','Spa','Gym','Fine Dining','Business Centre'],images:['/public/images/hotels/delhi_luxury.png'],description:'South India\'s grandest luxury hotel inspired by Chola dynasty.',totalRooms:45},
  {name:'Taj Fort Aguada Goa',location:{city:'Goa',country:'India',coordinates:[73.7738,15.4909]},starRating:5,amenities:['Private Beach','Pool','Spa','Water Sports','Restaurant'],images:['/public/images/hotels/mumbai_taj.png'],description:'Perched on a cliff overlooking the Arabian Sea in North Goa.',totalRooms:35},
  {name:'Taj Falaknuma Palace Hyderabad',location:{city:'Hyderabad',country:'India',coordinates:[78.4580,17.3310]},starRating:5,amenities:['WiFi','Pool','Spa','Heritage Walk','Fine Dining'],images:['/public/images/hotels/mumbai_taj.png'],description:'A restored 19th-century Nizam palace high above Hyderabad.',totalRooms:30},
  {name:'The Oberoi Mumbai',location:{city:'Mumbai',country:'India',coordinates:[72.8230,18.9322]},starRating:5,amenities:['WiFi','Sea View','Spa','Pool','Fine Dining'],images:['/public/images/hotels/mumbai_taj.png'],description:'Overlooking the Arabian Sea and Marine Drive.',totalRooms:30},
  {name:'Hotel Leela Palace Delhi',location:{city:'Delhi',country:'India',coordinates:[77.2273,28.6219]},starRating:5,amenities:['WiFi','Spa','Pool','Fine Dining','Gym','Business Centre'],images:['/public/images/hotels/delhi_luxury.png'],description:'Palatial urban resort with regal architecture.',totalRooms:45},
  {name:'Marriott Suites Pune',location:{city:'Pune',country:'India',coordinates:[73.8567,18.5204]},starRating:4,amenities:['WiFi','Pool','Gym','Restaurant','Bar'],images:['/public/images/hotels/delhi_luxury.png'],description:'Modern business hotel in the heart of Pune.',totalRooms:35},
  {name:'Hilton Garden Inn Bangalore',location:{city:'Bangalore',country:'India',coordinates:[77.6100,12.9800]},starRating:4,amenities:['WiFi','Pool','Gym','Restaurant','Business Centre'],images:['/public/images/hotels/delhi_luxury.png'],description:'Contemporary comfort in Bangalore\'s tech corridor.',totalRooms:40},
  {name:'Hyatt Regency Chennai',location:{city:'Chennai',country:'India',coordinates:[80.2600,13.0600]},starRating:5,amenities:['WiFi','Pool','Spa','Gym','Multiple Restaurants'],images:['/public/images/hotels/delhi_luxury.png'],description:'Luxury redefined on Anna Salai, Chennai.',totalRooms:30},
  {name:'Novotel Goa Dona Sylvia',location:{city:'Goa',country:'India',coordinates:[73.9200,15.2700]},starRating:4,amenities:['WiFi','Beach Access','Pool','Spa','Restaurant'],images:['/public/images/hotels/mumbai_taj.png'],description:'Boutique resort on Cavelossim Beach, South Goa.',totalRooms:25},
  {name:'Radisson Blu Hyderabad',location:{city:'Hyderabad',country:'India',coordinates:[78.3800,17.4400]},starRating:4,amenities:['WiFi','Pool','Gym','Restaurant','Bar','Spa'],images:['/public/images/hotels/delhi_luxury.png'],description:'Premium stay in HITEC City, Hyderabad.',totalRooms:35},
  {name:'The Leela Palace Bangalore',location:{city:'Bangalore',country:'India',coordinates:[77.6200,12.9600]},starRating:5,amenities:['WiFi','Pool','Spa','Gym','Fine Dining','Butler Service'],images:['/public/images/hotels/delhi_luxury.png'],description:'Ultra-luxury palace hotel in the Garden City.',totalRooms:25},
  {name:'Taj Coromandel Chennai',location:{city:'Chennai',country:'India',coordinates:[80.2500,13.0600]},starRating:5,amenities:['WiFi','Pool','Spa','Gym','Fine Dining'],images:['/public/images/hotels/mumbai_taj.png'],description:'Landmark luxury on Nungambakkam High Road.',totalRooms:30},
  {name:'JW Marriott Mumbai Sahar',location:{city:'Mumbai',country:'India',coordinates:[72.8600,19.1000]},starRating:5,amenities:['WiFi','Pool','Spa','Gym','Multiple Restaurants','Bar'],images:['/public/images/hotels/delhi_luxury.png'],description:'Upscale airport hotel with world-class amenities.',totalRooms:40},
  {name:'Crowne Plaza Pune',location:{city:'Pune',country:'India',coordinates:[73.8400,18.5300]},starRating:4,amenities:['WiFi','Pool','Gym','Restaurant','Business Centre'],images:['/public/images/hotels/delhi_luxury.png'],description:'Business-class comfort in vibrant Pune.',totalRooms:30},
  {name:'Park Hyatt Goa',location:{city:'Goa',country:'India',coordinates:[73.9100,15.2600]},starRating:5,amenities:['Private Beach','Pool','Spa','Golf','Fine Dining'],images:['/public/images/hotels/mumbai_taj.png'],description:'Indo-Portuguese-inspired luxury on Arossim Beach.',totalRooms:25},
  {name:'Burj Al Arab Dubai',location:{city:'Dubai',country:'UAE',coordinates:[55.1853,25.1412]},starRating:5,amenities:['Private Beach','Helipad','Butler Service','Infinity Pool','Michelin Dining'],images:['/public/images/hotels/delhi_luxury.png'],description:'The world\'s most iconic 7-star hotel.',totalRooms:25},
  {name:'JW Marriott Dubai Marina',location:{city:'Dubai',country:'UAE',coordinates:[55.1415,25.0781]},starRating:5,amenities:['WiFi','Marina View','Pool','Spa','Rooftop Bar'],images:['/public/images/hotels/delhi_luxury.png'],description:'Sleek contemporary tower in Dubai Marina.',totalRooms:55},
  {name:'Marina Bay Sands Singapore',location:{city:'Singapore',country:'Singapore',coordinates:[103.8610,1.2834]},starRating:5,amenities:['Infinity Pool','Casino','Shops','Spa','SkyPark'],images:['/public/images/hotels/delhi_luxury.png'],description:'Iconic integrated resort with rooftop infinity pool.',totalRooms:80},
  {name:'Raffles Singapore',location:{city:'Singapore',country:'Singapore',coordinates:[103.8527,1.2950]},starRating:5,amenities:['WiFi','Historic Architecture','Fine Dining','Spa','Courtyard Bar'],images:['/public/images/hotels/mumbai_taj.png'],description:'Legendary colonial landmark since 1887.',totalRooms:20},
  {name:'The Ritz London',location:{city:'London',country:'United Kingdom',coordinates:[-0.1419,51.5074]},starRating:5,amenities:['Afternoon Tea','Spa','Fine Dining','Bar','Concierge'],images:['/public/images/hotels/mumbai_taj.png'],description:'A quintessential London institution since 1906.',totalRooms:35},
  {name:'Waldorf Astoria New York',location:{city:'New York',country:'USA',coordinates:[-73.9734,40.7565]},starRating:5,amenities:['WiFi','Spa','Fine Dining','Bar','Gym','Concierge'],images:['/public/images/hotels/delhi_luxury.png'],description:'Art Deco landmark on Park Avenue.',totalRooms:40},
  {name:'W Hotel Goa',location:{city:'Goa',country:'India',coordinates:[73.9000,15.2500]},starRating:5,amenities:['WiFi','Beach','Pool','DJ Nights','Spa','Restaurant'],images:['/public/images/hotels/mumbai_taj.png'],description:'Trendy beachfront resort with vibrant nightlife.',totalRooms:20},
];

const ROOM_AMENITIES = {standard:['WiFi','TV','AC','Mini Bar'],deluxe:['WiFi','TV','AC','Mini Bar','City View','King Bed','Bathtub'],suite:['WiFi','TV','AC','Mini Bar','Panoramic View','King Bed','Jacuzzi','Living Room']};
const ROOM_PRICES = {standard:{min:3000,max:8000},deluxe:{min:8000,max:20000},suite:{min:20000,max:60000}};

const generateRoomsForHotel = (hotelId) => {
  const rooms = []; const types = ['standard','standard','deluxe','deluxe','suite'];
  types.forEach((type, idx) => {
    const floor = rInt(1,20);
    rooms.push({hotelId,roomNumber:`${floor}0${idx+1}`,type,pricePerNight:rInt(ROOM_PRICES[type].min,ROOM_PRICES[type].max),status:pick(['available','available','available','booked']),capacity:type==='standard'?2:type==='deluxe'?3:4,amenities:ROOM_AMENITIES[type]});
  });
  return rooms;
};

// ── TRAINS ──
const TRAIN_ROUTES = [
  {o:'SBC',on:'KSR Bengaluru',d:'MAS',dn:'Chennai Central',m:360,dt:'06:00',at:'12:00'},
  {o:'MAS',on:'Chennai Central',d:'SBC',dn:'KSR Bengaluru',m:360,dt:'07:30',at:'13:30'},
  {o:'NDLS',on:'New Delhi',d:'BCT',dn:'Mumbai Central',m:960,dt:'16:55',at:'08:35'},
  {o:'BCT',on:'Mumbai Central',d:'NDLS',dn:'New Delhi',m:960,dt:'17:00',at:'08:30'},
  {o:'NDLS',on:'New Delhi',d:'BSB',dn:'Varanasi Jn',m:480,dt:'18:30',at:'06:30'},
  {o:'SBC',on:'KSR Bengaluru',d:'PUNE',dn:'Pune Jn',m:750,dt:'14:00',at:'02:30'},
  {o:'PUNE',on:'Pune Jn',d:'SBC',dn:'KSR Bengaluru',m:750,dt:'15:00',at:'03:30'},
  {o:'HWH',on:'Howrah Jn',d:'PURI',dn:'Puri',m:300,dt:'22:00',at:'03:00'},
  {o:'BCT',on:'Mumbai Central',d:'GOI',dn:'Madgaon',m:600,dt:'23:00',at:'09:00'},
  {o:'SC',on:'Secunderabad',d:'NDLS',dn:'New Delhi',m:780,dt:'06:00',at:'19:00'},
  {o:'NDLS',on:'New Delhi',d:'SC',dn:'Secunderabad',m:780,dt:'06:50',at:'19:30'},
  {o:'MAS',on:'Chennai Central',d:'SC',dn:'Secunderabad',m:420,dt:'18:00',at:'01:00'},
  {o:'SBC',on:'KSR Bengaluru',d:'SC',dn:'Secunderabad',m:360,dt:'22:30',at:'04:30'},
  {o:'NDLS',on:'New Delhi',d:'SBC',dn:'KSR Bengaluru',m:1440,dt:'20:50',at:'06:50'},
  {o:'NDLS',on:'New Delhi',d:'MAS',dn:'Chennai Central',m:1680,dt:'15:55',at:'07:55'},
  {o:'HWH',on:'Howrah Jn',d:'NDLS',dn:'New Delhi',m:1020,dt:'17:00',at:'10:00'},
  {o:'NDLS',on:'New Delhi',d:'HWH',dn:'Howrah Jn',m:1020,dt:'16:00',at:'09:00'},
  {o:'ADI',on:'Ahmedabad Jn',d:'BCT',dn:'Mumbai Central',m:400,dt:'23:00',at:'05:40'},
  {o:'BCT',on:'Mumbai Central',d:'ADI',dn:'Ahmedabad Jn',m:400,dt:'23:25',at:'06:05'},
  {o:'LKO',on:'Lucknow Nr',d:'NDLS',dn:'New Delhi',m:420,dt:'22:45',at:'05:45'},
  {o:'NDLS',on:'New Delhi',d:'LKO',dn:'Lucknow Nr',m:420,dt:'20:50',at:'03:50'},
  {o:'PNBE',on:'Patna Jn',d:'NDLS',dn:'New Delhi',m:750,dt:'19:30',at:'08:00'},
  {o:'NDLS',on:'New Delhi',d:'PNBE',dn:'Patna Jn',m:750,dt:'17:15',at:'05:45'},
  {o:'SBC',on:'KSR Bengaluru',d:'MAO',dn:'Madgaon',m:720,dt:'20:00',at:'08:00'},
  {o:'MAO',on:'Madgaon',d:'SBC',dn:'KSR Bengaluru',m:720,dt:'19:30',at:'07:30'},
  {o:'MAS',on:'Chennai Central',d:'MDU',dn:'Madurai Jn',m:450,dt:'21:00',at:'04:30'},
  {o:'MDU',on:'Madurai Jn',d:'MAS',dn:'Chennai Central',m:450,dt:'22:45',at:'06:15'},
  {o:'HWH',on:'Howrah Jn',d:'MAS',dn:'Chennai Central',m:1650,dt:'23:45',at:'03:15'},
  {o:'MAS',on:'Chennai Central',d:'HWH',dn:'Howrah Jn',m:1650,dt:'17:00',at:'20:30'},
  {o:'BCT',on:'Mumbai Central',d:'PUNE',dn:'Pune Jn',m:180,dt:'07:00',at:'10:00'},
  {o:'PUNE',on:'Pune Jn',d:'BCT',dn:'Mumbai Central',m:180,dt:'17:30',at:'20:30'},
  {o:'JP',on:'Jaipur',d:'NDLS',dn:'New Delhi',m:270,dt:'06:00',at:'10:30'},
  {o:'NDLS',on:'New Delhi',d:'JP',dn:'Jaipur',m:270,dt:'18:00',at:'22:30'}
];
const TRAIN_NAMES = [
  {n:'Rajdhani Express',t:'Rajdhani'},{n:'Shatabdi Express',t:'Shatabdi'},{n:'Duronto Express',t:'Duronto'},
  {n:'Vande Bharat Express',t:'Vande Bharat'},{n:'Garib Rath',t:'Garib Rath'},
];

const generateTrains = () => {
  const trains = []; const usedNums = new Set();
  TRAIN_ROUTES.forEach(r => {
    const nameCount = r.m <= 400 ? 3 : 4;
    for (let i = 0; i < nameCount; i++) {
      const tn = TRAIN_NAMES[i % TRAIN_NAMES.length];
      let num; do { num = `${rInt(10000,29999)}`; } while(usedNums.has(num)); usedNums.add(num);
      trains.push({
        trainNumber:num, name:tn.n, operator:'Indian Railways', trainType:tn.t,
        distance: Math.round(r.m * 1.2), pantryAvailable: r.m > 400,
        duration:{hours:Math.floor(r.m/60),minutes:r.m%60},
        sourceStation:{code:r.o,name:r.on}, destinationStation:{code:r.d,name:r.dn},
        route:[
          {stationCode:r.o,stationName:r.on,departureTime:r.dt,day:1},
          {stationCode:r.d,stationName:r.dn,arrivalTime:r.at,day:r.m>720?2:1}
        ],
        classes:[
          {type:'1A',price:rInt(3500,6000),totalSeats:18,availableSeats:rInt(2,18)},
          {type:'2A',price:rInt(2000,3500),totalSeats:40,availableSeats:rInt(5,40)},
          {type:'3A',price:rInt(1200,2000),totalSeats:64,availableSeats:rInt(10,64)},
          {type:'SL',price:rInt(400,900),totalSeats:80,availableSeats:rInt(5,80)},
        ],
        runsOn:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], isActive:true,
      });
    }
  });
  return trains;
};

// ── BUSES ──
const BUS_OPS = ['VRL Travels','SRS Travels','National Travels','Orange Travels','KSRTC','Neeta Travels','Paulo Travels','KPN Travels'];
const BUS_TYPES = ['AC Sleeper','Non-AC Sleeper','Luxury Multi-Axle','Volvo B11R','Scania Multi-Axle','AC Semi-Sleeper'];
const BUS_CITIES = ['Bengaluru','Pune','Mumbai','Delhi','Chennai','Hyderabad','Goa','Mangalore','Mysore','Coimbatore'];

const generateBuses = () => {
  const buses = []; const base = new Date(); const usedNums = new Set();
  const pairs = [];
  for (let i = 0; i < BUS_CITIES.length; i++) {
    for (let j = i+1; j < BUS_CITIES.length; j++) {
      pairs.push([BUS_CITIES[i], BUS_CITIES[j]]);
      if (pairs.length >= 22) break;
    }
    if (pairs.length >= 22) break;
  }
  pairs.forEach(([o, d]) => {
    const opCount = 2;
    for (let k = 0; k < opCount; k++) {
      const op = pick(BUS_OPS); const bt = pick(BUS_TYPES);
      const dep = addHours(base, rInt(18,23)); const arr = addHours(dep, rInt(6,14));
      let bn; do { bn = `KA-${rInt(10,99)}-${rInt(1000,9999)}`; } while(usedNums.has(bn)); usedNums.add(bn);
      buses.push({
        busNumber:bn, operatorName:op, busType:bt,
        origin:{city:o,stationName:`${o} Main Stand`,departureTime:dep},
        destination:{city:d,stationName:`${d} Terminal`,arrivalTime:arr},
        boardingPoints:[{name:`${o} Central`,time:'20:00',landmark:'Near Bus Station'},{name:`${o} Highway`,time:'20:30',landmark:'Service Road'}],
        droppingPoints:[{name:`${d} Central`,time:'06:00',landmark:'Near Bus Station'},{name:`${d} City`,time:'06:30',landmark:'Main Road'}],
        price:rInt(600,2800), totalSeats:36, availableSeats:rInt(5,30),
        amenities:['WiFi','Charging Point','Water Bottle','Blanket'],
        rating:parseFloat((rInt(35,49)/10).toFixed(1)), reviewsCount:rInt(50,500),
      });
    }
  });
  return buses;
};

// ── USERS ──
const USERS = [
  {name:'TravelDesk Admin',email:'admin@traveldesk.io',password:'Admin@12345',role:'admin'},
  {name:'Demo User',email:'user@traveldesk.io',password:'User@12345',role:'user'},
];

// ── IMPORT ──
const importData = async () => {
  try {
    await connectDB();
    await Flight.deleteMany({}); await Hotel.deleteMany({}); await Room.deleteMany({});
    await Seat.deleteMany({}); await Train.deleteMany({}); await Bus.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Existing data destroyed...');

    for (const u of USERS) { await User.create(u); }
    console.log('👤 Users created: admin@traveldesk.io / Admin@12345, user@traveldesk.io / User@12345');

    const flights = generateFlights();
    await Flight.insertMany(flights);
    console.log(`✈️  ${flights.length} flights seeded`);

    let totalRooms = 0;
    for (const h of HOTELS_RAW) {
      const hotel = await Hotel.create(h);
      const rooms = generateRoomsForHotel(hotel._id);
      await Room.insertMany(rooms);
      totalRooms += rooms.length;
    }
    console.log(`🏨 ${HOTELS_RAW.length} hotels seeded with ${totalRooms} rooms`);

    const trains = generateTrains();
    await Train.insertMany(trains);
    console.log(`🚆 ${trains.length} trains seeded`);

    const buses = generateBuses();
    await Bus.insertMany(buses);
    console.log(`🚌 ${buses.length} buses seeded`);

    console.log('✅ Data import complete!');
    process.exit(0);
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await Flight.deleteMany({}); await Hotel.deleteMany({}); await Room.deleteMany({});
    await Seat.deleteMany({}); await User.deleteMany({}); await Train.deleteMany({}); await Bus.deleteMany({});
    console.log('💥 Data destroyed!');
    process.exit(0);
  } catch (err) { console.error(`❌ Error: ${err.message}`); process.exit(1); }
};

if (process.argv[2] === '-d') { destroyData(); } else { importData(); }

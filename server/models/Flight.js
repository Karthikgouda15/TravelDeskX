// /Users/karthikgouda/Desktop/TravelDesk/server/models/Flight.js
const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema(
  {
    airline: {
      type: String,
      required: [true, 'Please add an airline'],
    },
    flightNumber: {
      type: String,
      required: [true, 'Please add a flight number'],
      unique: true,
    },
    origin: {
      type: String,
      required: [true, 'Please add an origin airport code'],
    },
    originCity: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: [true, 'Please add a destination airport code'],
    },
    destinationCity: {
      type: String,
      required: true,
    },
    departureTime: {
      type: Date,
      required: [true, 'Please add a departure time'],
    },
    arrivalTime: {
      type: Date,
      required: [true, 'Please add an arrival time'],
    },
    duration: {
      type: Number, // Stored in minutes
      required: false, // Calculated on save
    },
    stops: {
      type: Number,
      default: 0,
      enum: [0, 1, 2, 3], // Limiting stops to reasonable values
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
    },
    cabinClass: {
      type: String,
      required: [true, 'Please specify cabin class'],
      enum: ['economy', 'business', 'first'],
    },
    totalSeats: {
      type: Number,
      required: [true, 'Please specify total seats'],
    },
    availableSeats: {
      type: Number,
      required: [true, 'Please specify available seats'],
    },
    status: {
      type: String,
      enum: ['scheduled', 'delayed', 'cancelled'],
      default: 'scheduled',
    },
    airlineLogo: {
      type: String,
      default: '/public/images/airlines/default.png',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate duration automatically
flightSchema.pre('save', function(next) {
  if (this.departureTime && this.arrivalTime) {
    // Duration in minutes
    const diffMs = new Date(this.arrivalTime) - new Date(this.departureTime);
    this.duration = Math.abs(Math.floor(diffMs / 60000));
  }
  next();
});

// Added required compound indexes based on prompt
flightSchema.index({ origin: 1, destination: 1, departureTime: 1 });
flightSchema.index({ price: 1, stops: 1 });

module.exports = mongoose.model('Flight', flightSchema);

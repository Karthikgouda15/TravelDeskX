// /Users/karthikgouda/Desktop/TravelDesk/server/models/Bus.js
const mongoose = require('mongoose');

const busSchema = new mongoose.Schema(
  {
    busNumber: {
      type: String,
      required: [true, 'Please add a bus license or route number'],
      unique: true,
    },
    operatorName: {
      type: String,
      required: [true, 'Please add an operator name'],
    },
    busType: {
      type: String,
      required: [true, 'Please specify bus type'],
      enum: ['AC Sleeper', 'Non-AC Sleeper', 'AC Semi-Sleeper', 'Luxury Multi-Axle', 'Standard'],
    },
    origin: {
      city: { type: String, required: true },
      stationName: { type: String, required: true },
      departureTime: { type: Date, required: true },
    },
    destination: {
      city: { type: String, required: true },
      stationName: { type: String, required: true },
      arrivalTime: { type: Date, required: true },
    },
    duration: {
      type: Number, // In minutes
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
    },
    totalSeats: {
      type: Number,
      required: true,
    },
    availableSeats: {
      type: Number,
      required: true,
    },
    amenities: {
      type: [String], // ['WiFi', 'Charging Point', 'Water Bottle', 'Blanket']
      default: [],
    },
    rating: {
      type: Number,
      default: 4.0,
      min: 0,
      max: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save duration calculation
busSchema.pre('save', function(next) {
  if (this.origin.departureTime && this.destination.arrivalTime) {
    const diffMs = new Date(this.destination.arrivalTime) - new Date(this.origin.departureTime);
    this.duration = Math.abs(Math.floor(diffMs / 60000));
  }
  next();
});

busSchema.index({ 'origin.city': 1, 'destination.city': 1 });
busSchema.index({ price: 1 });

module.exports = mongoose.model('Bus', busSchema);

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
      enum: ['AC Sleeper', 'Non-AC Sleeper', 'AC Semi-Sleeper', 'Luxury Multi-Axle', 'Standard', 'Scania Multi-Axle', 'Volvo B11R'],
    },
    images: {
      type: [String],
      default: [
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957',
        'https://images.unsplash.com/photo-1570125909232-eb263c188f7e'
      ]
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
    boardingPoints: [
      {
        name: { type: String, required: true },
        time: { type: String, required: true },
        landmark: String
      }
    ],
    droppingPoints: [
      {
        name: { type: String, required: true },
        time: { type: String, required: true },
        landmark: String
      }
    ],
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
    seatLayout: {
      hasUpperDeck: { type: Boolean, default: false },
      rows: { type: Number, default: 10 },
      columns: { type: Number, default: 4 }, // 2+2 layout
    },
    bookedSeats: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String],
      default: ['WiFi', 'Charging Point'],
    },
    cancellationPolicy: {
      type: String,
      default: 'Full refund if cancelled 24h before departure. 50% refund within 24h.'
    },
    rating: {
      type: Number,
      default: 4.2,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 124
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

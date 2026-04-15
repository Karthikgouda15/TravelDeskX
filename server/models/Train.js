// /Users/karthikgouda/Desktop/TravelDesk/server/models/Train.js
const mongoose = require('mongoose');

const trainSchema = new mongoose.Schema(
  {
    trainNumber: {
      type: String,
      required: [true, 'Please add a train number'],
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a train name'],
    },
    operator: {
      type: String,
      default: 'Indian Railways',
    },
    trainType: {
      type: String,
      enum: ['Rajdhani', 'Shatabdi', 'Duronto', 'Vande Bharat', 'Garib Rath', 'Superfast', 'Express', 'Mail', 'Tejas', 'Humsafar', 'Shatabdi', 'Antyodaya', 'Jan Shatabdi'],
      default: 'Express',
    },
    distance: {
      type: Number, // total distance in km
    },
    duration: {
      hours: { type: Number, default: 0 },
      minutes: { type: Number, default: 0 },
    },
    pantryAvailable: {
      type: Boolean,
      default: false,
    },
    coachComposition: {
      type: String, // e.g., "1A-1, 2A-3, 3A-6, SL-10"
    },
    sourceStation: {
      code: String,
      name: String,
    },
    destinationStation: {
      code: String,
      name: String,
    },
    route: [
      {
        stationCode: { type: String, required: true },
        stationName: { type: String, required: true },
        arrivalTime: { type: String }, // e.g., "10:30"
        departureTime: { type: String }, // e.g., "10:35"
        haltTime: { type: Number }, // in minutes
        day: { type: Number, default: 1 },
      },
    ],
    classes: [
      {
        type: {
          type: String,
          enum: ['1A', '2A', '3A', 'SL', '2S', 'CC', 'EC', 'EA'],
          required: true,
        },
        price: { type: Number, required: true },
        totalSeats: { type: Number, required: true },
        availableSeats: { type: Number, required: true },
      },
    ],
    runsOn: {
      type: [String], // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      required: true,
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

// Index for route searching
trainSchema.index({ 'route.stationCode': 1 });
trainSchema.index({ 'route.stationName': 1 });
trainSchema.index({ 'sourceStation.code': 1, 'destinationStation.code': 1 });
trainSchema.index({ trainNumber: 1 });

module.exports = mongoose.model('Train', trainSchema);

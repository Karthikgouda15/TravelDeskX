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

module.exports = mongoose.model('Train', trainSchema);

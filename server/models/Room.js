// /Users/karthikgouda/Desktop/TravelDesk/server/models/Room.js
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    roomNumber: {
      type: String,
      required: [true, 'Please add a room number'],
    },
    type: {
      type: String,
      enum: ['standard', 'deluxe', 'suite'],
      required: [true, 'Please declare room type'],
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Please add room price'],
    },
    status: {
      type: String,
      enum: ['available', 'booked', 'maintenance'],
      default: 'available',
    },
    capacity: {
      type: Number,
      required: [true, 'Please add capacity based on persons'],
      min: 1,
    },
    amenities: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  }
);

roomSchema.index({ hotelId: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model('Room', roomSchema);

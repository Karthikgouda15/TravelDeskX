// /Users/karthikgouda/Desktop/TravelDesk/server/models/Hotel.js
const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a hotel name'],
    },
    location: {
      city: {
        type: String,
        required: [true, 'Please add a city'],
      },
      country: {
        type: String,
        required: [true, 'Please add a country'],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere',
      },
    },
    starRating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    totalRooms: {
      type: Number,
      required: [true, 'Please add total rooms limit'],
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

// Index as requested
hotelSchema.index({ 'location.city': 1 });

module.exports = mongoose.model('Hotel', hotelSchema);

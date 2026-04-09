// /Users/karthikgouda/Desktop/TravelDesk/server/models/Itinerary.js
const mongoose = require('mongoose');
const crypto = require('crypto');

const itinerarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Itinerary must belong to a user'],
    },
    title: {
      type: String,
      required: [true, 'Please add a title for your itinerary'],
      trim: true,
    },
    pnr: {
      type: String,
      unique: true,
      uppercase: true,
      minlength: 6,
      maxlength: 6,
    },
    destination: {
      type: String,
      required: [true, 'Please add a destination'],
    },
    dateRange: {
      startDate: {
        type: Date,
        required: [true, 'Please add a start date'],
      },
      endDate: {
        type: Date,
        required: [true, 'Please add an end date'],
      },
    },
    flights: [
      {
        flightId: {
          type: mongoose.Schema.ObjectId,
          ref: 'Flight',
        },
        departureTime: Date,
        arrivalTime: Date,
        airline: String,
        flightNumber: String,
      },
    ],
    hotels: [
      {
        hotelId: {
          type: mongoose.Schema.ObjectId,
          ref: 'Hotel',
        },
        roomId: {
          type: mongoose.Schema.ObjectId,
          ref: 'Room',
        },
        name: String,
        checkIn: Date,
        checkOut: Date,
      },
    ],
    activities: [
      {
        name: String,
        description: String,
        date: Date,
        location: String,
      },
    ],
    weatherData: {
      type: Object, // Mock storage for weather snapshot
    },
    shareToken: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate a share token and PNR if not present
itinerarySchema.pre('save', function (next) {
  if (!this.shareToken) {
    this.shareToken = crypto.randomBytes(20).toString('hex');
  }
  
  if (!this.pnr) {
    // Generate 6-char alphanumeric PNR (Amadeus style)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.pnr = result;
  }
  next();
});

// Indexes for fast lookup
itinerarySchema.index({ userId: 1 });
itinerarySchema.index({ shareToken: 1 });

module.exports = mongoose.model('Itinerary', itinerarySchema);

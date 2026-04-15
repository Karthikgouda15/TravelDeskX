// /Users/karthikgouda/Desktop/TravelDesk/server/models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a user'],
    },
    type: {
      type: String,
      enum: ['flight', 'hotel', 'train', 'bus'],
      required: [true, 'Please specify booking type'],
    },
    // referenceId is a polymorphic link to Flight, Hotel, Train, or Bus
    referenceId: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'Please specify the transport / accommodation ID'],
      refPath: 'categoryModel', // switching to a custom field for cleaner resolution
    },
    categoryModel: {
      type: String,
      required: true,
      enum: ['Flight', 'Hotel', 'Train', 'Bus'],
      default: function() {
        if (this.type === 'flight') return 'Flight';
        if (this.type === 'hotel') return 'Hotel';
        if (this.type === 'train') return 'Train';
        if (this.type === 'bus') return 'Bus';
      }
    },
    // For flight bookings: array of Seat._id
    seats: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Seat',
      },
    ],
    // For hotel bookings: which room
    roomId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Room',
      default: null,
    },
    checkIn: {
      type: Date,
      default: null,
    },
    checkOut: {
      type: Date,
      default: null,
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    passengers: [
      {
        name: { type: String, required: true },
        age: { type: Number, required: true },
        gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
        seatNumber: String // Specifically for Bus/Train
      }
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index for user's booking lookups
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);

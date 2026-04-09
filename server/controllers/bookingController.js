// /Users/karthikgouda/Desktop/TravelDesk/server/controllers/bookingController.js
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const Seat = require('../models/Seat');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Train = require('../models/Train');
const Bus = require('../models/Bus');
const apiResponse = require('../utils/apiResponse');
const apiListResponse = require('../utils/apiListResponse');
const { getIO, emitFlightUpdate } = require('../sockets/index');

// ─────────────────────────────────────────────
// Helper: Generate or fetch seats for a flight
// ─────────────────────────────────────────────
/**
 * Ensures seats exist for a given flight.
 * Seeds them on-demand if not yet created (lazy seat generation).
 * @param {Object} flight - Flight document
 */
const ensureSeatsForFlight = async (flight) => {
  const existingCount = await Seat.countDocuments({ flightId: flight._id });
  if (existingCount > 0) return;

  const seatsToCreate = [];
  const rows = Math.ceil(flight.totalSeats / 6);

  for (let row = 1; row <= rows; row++) {
    const cols = ['A', 'B', 'C', 'D', 'E', 'F'];
    for (const col of cols) {
      if (seatsToCreate.length >= flight.totalSeats) break;
      seatsToCreate.push({
        flightId: flight._id,
        seatNumber: `${row}${col}`,
        class: flight.cabinClass,
        status: 'available',
      });
    }
  }

  await Seat.insertMany(seatsToCreate);
};

// ─────────────────────────────────────────────
// POST /api/bookings/flight
// ─────────────────────────────────────────────
/**
 * @desc    Book a flight — holds selected seats for 10 mins with TTL,
 *          then confirms on payment. Uses optimistic locking via __v.
 * @route   POST /api/bookings/flight
 * @access  Private
 */
exports.bookFlight = asyncHandler(async (req, res, next) => {
  const { flightId, seatNumbers, cabinClass } = req.body;

  if (!flightId || !seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
    return apiResponse(res, 400, false, null, 'flightId and seatNumbers[] are required');
  }

  const flight = await Flight.findById(flightId);
  if (!flight) {
    return apiResponse(res, 404, false, null, 'Flight not found');
  }

  if (flight.status === 'cancelled') {
    return apiResponse(res, 400, false, null, 'Cannot book a cancelled flight');
  }

  if (flight.availableSeats < seatNumbers.length) {
    return apiResponse(res, 400, false, null, `Only ${flight.availableSeats} seats available`);
  }

  // Ensure seats exist in DB (lazy generation)
  await ensureSeatsForFlight(flight);

  // Find the requested available seats
  const seats = await Seat.find({
    flightId,
    seatNumber: { $in: seatNumbers },
    status: 'available',
  });

  if (seats.length !== seatNumbers.length) {
    const foundNums = seats.map((s) => s.seatNumber);
    const unavailable = seatNumbers.filter((n) => !foundNums.includes(n));
    return apiResponse(res, 409, false, null, `Seats already held or booked: ${unavailable.join(', ')}`);
  }

  const heldUntil = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
  const session = await mongoose.startSession();

  let booking;

  try {
    await session.withTransaction(async () => {
      // Optimistic locking: update each seat only if __v matches (concurrent conflict guard)
      for (const seat of seats) {
        const updated = await Seat.findOneAndUpdate(
          { _id: seat._id, __v: seat.__v, status: 'available' },
          {
            $set: { status: 'held', heldBy: req.user._id, heldUntil },
            $inc: { __v: 1 },
          },
          { new: true, session }
        );

        if (!updated) {
          throw new Error(`Seat ${seat.seatNumber} was just taken by another user. Please select a different seat.`);
        }
      }

      // Decrement available seats on flight
      await Flight.findByIdAndUpdate(
        flightId,
        { $inc: { availableSeats: -seatNumbers.length } },
        { session }
      );

      // Create a pending booking
      [booking] = await Booking.create(
        [
          {
            userId: req.user._id,
            type: 'flight',
            referenceId: flightId,
            seats: seats.map((s) => s._id),
            totalPrice: flight.price * seatNumbers.length,
            status: 'pending',
            paymentStatus: 'unpaid',
          },
        ],
        { session }
      );
    });
  } catch (err) {
    return apiResponse(res, 409, false, null, err.message || 'Booking conflict. Please try again.');
  } finally {
    session.endSession();
  }

  // Emit real-time seat + price update to all connected socket clients
  try {
    const updatedFlight = await Flight.findById(flightId).select('availableSeats price airline').lean();
    emitFlightUpdate(
      flightId,
      updatedFlight?.availableSeats,
      updatedFlight?.price,
      updatedFlight?.airline || ''
    );
    getIO().emit('seat:updated', {
      flightId,
      seats: seats.map((s) => ({ seatNumber: s.seatNumber, status: 'held' })),
    });
  } catch (_) {
    // Socket not critical — don't break the request
  }

  return apiResponse(res, 201, true, { booking, heldUntil }, 'Seats held for 10 minutes. Complete payment to confirm.');
});

// ─────────────────────────────────────────────
// POST /api/bookings/hotel
// ─────────────────────────────────────────────
/**
 * @desc    Book a hotel room
 * @route   POST /api/bookings/hotel
 * @access  Private
 */
exports.bookHotel = asyncHandler(async (req, res, next) => {
  const { hotelId, roomId, checkIn, checkOut } = req.body;

  if (!hotelId || !roomId || !checkIn || !checkOut) {
    return apiResponse(res, 400, false, null, 'hotelId, roomId, checkIn, and checkOut are required');
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (isNaN(checkInDate) || isNaN(checkOutDate)) {
    return apiResponse(res, 400, false, null, 'checkIn and checkOut must be valid dates');
  }

  if (checkOutDate <= checkInDate) {
    return apiResponse(res, 400, false, null, 'checkOut must be after checkIn');
  }

  const hotel = await Hotel.findById(hotelId);
  if (!hotel) return apiResponse(res, 404, false, null, 'Hotel not found');

  // Optimistic locking on room
  const room = await Room.findOne({ _id: roomId, hotelId, status: 'available' });
  if (!room) {
    return apiResponse(res, 409, false, null, 'Room is not available or does not belong to this hotel');
  }

  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  const totalPrice = room.pricePerNight * nights;

  const session = await mongoose.startSession();
  let booking;

  try {
    await session.withTransaction(async () => {
      // Optimistic locking via __v
      const updatedRoom = await Room.findOneAndUpdate(
        { _id: room._id, __v: room.__v, status: 'available' },
        { $set: { status: 'booked' }, $inc: { __v: 1 } },
        { new: true, session }
      );

      if (!updatedRoom) {
        throw new Error('Room was just booked by another user. Please select a different room.');
      }

      [booking] = await Booking.create(
        [
          {
            userId: req.user._id,
            type: 'hotel',
            referenceId: hotelId,
            roomId,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            totalPrice,
            status: 'confirmed',
            paymentStatus: 'unpaid',
          },
        ],
        { session }
      );
    });
  } catch (err) {
    return apiResponse(res, 409, false, null, err.message || 'Booking conflict. Please try again.');
  } finally {
    session.endSession();
  }

  // Emit real-time room update
  try {
    const io = getIO();
    io.emit('room:updated', {
      hotelId,
      roomId,
      status: 'booked',
    });
  } catch (_) {
    // Non-critical
  }

  return apiResponse(res, 201, true, { booking }, 'Hotel room booked successfully');
});

// ─────────────────────────────────────────────
// GET /api/bookings/my
// ─────────────────────────────────────────────
/**
 * @desc    Get all bookings for the logged-in user
 * @route   GET /api/bookings/my
 * @access  Private
 */
exports.getMyBookings = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const filter = { userId: req.user._id };
  if (req.query.type) filter.type = req.query.type;
  if (req.query.status) filter.status = req.query.status;

  const bookings = await Booking.find(filter)
    .populate('seats', 'seatNumber class status')
    .populate('roomId', 'roomNumber type pricePerNight')
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  const total = await Booking.countDocuments(filter);

  return apiListResponse(res, 200, bookings, total, page, limit);
});

// ─────────────────────────────────────────────
// PATCH /api/bookings/:id/cancel
// ─────────────────────────────────────────────
/**
 * @desc    Cancel a booking — releases seats/rooms back to available
 * @route   PATCH /api/bookings/:id/cancel
 * @access  Private
 */
exports.cancelBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return apiResponse(res, 404, false, null, 'Booking not found');
  }

  // Ensure the booking belongs to the requesting user (or admin)
  if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return apiResponse(res, 403, false, null, 'Not authorized to cancel this booking');
  }

  if (booking.status === 'cancelled') {
    return apiResponse(res, 400, false, null, 'Booking is already cancelled');
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // Release flight seats back to available
      if (booking.type === 'flight' && booking.seats.length > 0) {
        await Seat.updateMany(
          { _id: { $in: booking.seats } },
          { $set: { status: 'available', heldBy: null, heldUntil: null } },
          { session }
        );

        await Flight.findByIdAndUpdate(
          booking.referenceId,
          { $inc: { availableSeats: booking.seats.length } },
          { session }
        );

        // Emit seat availability update
        try {
          const io = getIO();
          io.emit('seat:updated', {
            flightId: booking.referenceId,
            seatIds: booking.seats,
            status: 'available',
          });
        } catch (_) {}
      }

      // Release hotel room
      if (booking.type === 'hotel' && booking.roomId) {
        await Room.findByIdAndUpdate(
          booking.roomId,
          { $set: { status: 'available' } },
          { session }
        );

        // Emit room availability update
        try {
          const io = getIO();
          io.emit('room:updated', {
            hotelId: booking.referenceId,
            roomId: booking.roomId,
            status: 'available',
          });
        } catch (_) {}
      }

      booking.status = 'cancelled';
      booking.paymentStatus = booking.paymentStatus === 'paid' ? 'refunded' : booking.paymentStatus;
      await booking.save({ session });
    });
  } catch (err) {
    return apiResponse(res, 500, false, null, 'Failed to cancel booking', err.message);
  } finally {
    session.endSession();
  }

  return apiResponse(res, 200, true, { booking }, 'Booking cancelled successfully');
});

// ─────────────────────────────────────────────
// POST /api/bookings/train
// ─────────────────────────────────────────────
/**
 * @desc    Book a train seat
 * @route   POST /api/bookings/train
 * @access  Private
 */
exports.bookTrain = asyncHandler(async (req, res, next) => {
  const { trainId, classType, passengers } = req.body;

  if (!trainId || !classType || !passengers) {
    return apiResponse(res, 400, false, null, 'trainId, classType, and passengers count are required');
  }

  const train = await Train.findById(trainId);
  if (!train) return apiResponse(res, 404, false, null, 'Train not found');

  const coachClass = train.classes.find(c => c.type === classType);
  if (!coachClass || coachClass.availableSeats < passengers) {
    return apiResponse(res, 400, false, null, 'Not enough seats available in this class');
  }

  const totalPrice = coachClass.price * passengers;

  const session = await mongoose.startSession();
  let booking;

  try {
    await session.withTransaction(async () => {
      // De-increment available seats in specific class
      const updatedTrain = await Train.findOneAndUpdate(
        { _id: trainId, 'classes.type': classType, 'classes.availableSeats': { $gte: passengers } },
        { $inc: { 'classes.$.availableSeats': -passengers } },
        { new: true, session }
      );

      if (!updatedTrain) throw new Error('Seats were taken by another user. Please retry.');

      [booking] = await Booking.create(
        [
          {
            userId: req.user._id,
            type: 'train',
            categoryModel: 'Train',
            referenceId: trainId,
            totalPrice,
            status: 'confirmed',
            paymentStatus: 'unpaid',
          },
        ],
        { session }
      );
    });
  } catch (err) {
    return apiResponse(res, 409, false, null, err.message);
  } finally {
    session.endSession();
  }

  return apiResponse(res, 201, true, { booking }, 'Train ticket booked successfully');
});

// ─────────────────────────────────────────────
// POST /api/bookings/bus
// ─────────────────────────────────────────────
/**
 * @desc    Book a bus seat
 * @route   POST /api/bookings/bus
 * @access  Private
 */
exports.bookBus = asyncHandler(async (req, res, next) => {
  const { busId, seatCount } = req.body;

  if (!busId || !seatCount) {
    return apiResponse(res, 400, false, null, 'busId and seatCount are required');
  }

  const bus = await Bus.findById(busId);
  if (!bus || bus.availableSeats < seatCount) {
    return apiResponse(res, 400, false, null, 'Bus not found or seats unavailable');
  }

  const totalPrice = bus.price * seatCount;

  const session = await mongoose.startSession();
  let booking;

  try {
    await session.withTransaction(async () => {
      const updatedBus = await Bus.findOneAndUpdate(
        { _id: busId, availableSeats: { $gte: seatCount } },
        { $inc: { availableSeats: -seatCount } },
        { new: true, session }
      );

      if (!updatedBus) throw new Error('Seats no longer available');

      [booking] = await Booking.create(
        [
          {
            userId: req.user._id,
            type: 'bus',
            categoryModel: 'Bus',
            referenceId: busId,
            totalPrice,
            status: 'confirmed',
            paymentStatus: 'unpaid',
          },
        ],
        { session }
      );
    });
  } catch (err) {
    return apiResponse(res, 409, false, null, err.message);
  } finally {
    session.endSession();
  }

  return apiResponse(res, 201, true, { booking }, 'Bus booking successful');
});


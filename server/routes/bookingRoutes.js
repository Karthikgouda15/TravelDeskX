// /Users/karthikgouda/Desktop/TravelDesk/server/routes/bookingRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const {
  bookFlight,
  bookHotel,
  bookTrain,
  bookBus,
  getMyBookings,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const apiResponse = require('../utils/apiResponse');

const router = express.Router();

// All booking routes are private
router.use(protect);

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((err) => err.msg);
    return apiResponse(res, 400, false, null, 'Validation Failed', messages);
  }
  next();
};

// POST /api/bookings/flight
router.post(
  '/flight',
  [
    body('flightId').notEmpty().withMessage('Flight ID is required'),
    body('seatNumbers').isArray({ min: 1 }).withMessage('Provide at least one seat number'),
  ],
  validate,
  bookFlight
);

// POST /api/bookings/hotel
router.post(
  '/hotel',
  [
    body('hotelId').notEmpty().withMessage('Hotel ID is required'),
    body('roomId').notEmpty().withMessage('Room ID is required'),
    body('checkIn').isISO8601().withMessage('checkIn must be a valid date'),
    body('checkOut').isISO8601().withMessage('checkOut must be a valid date'),
  ],
  validate,
  bookHotel
);

// GET /api/bookings/my
router.get('/my', getMyBookings);

// PATCH /api/bookings/:id/cancel
router.patch('/:id/cancel', cancelBooking);

// POST /api/bookings/train
router.post(
  '/train',
  [
    body('trainId').notEmpty().withMessage('Train ID is required'),
    body('classType').notEmpty().withMessage('Coach class is required'),
    body('passengers').isInt({ min: 1 }).withMessage('At least one passenger is required'),
  ],
  validate,
  bookTrain
);

// POST /api/bookings/bus
router.post(
  '/bus',
  [
    body('busId').notEmpty().withMessage('Bus ID is required'),
    body('seatCount').isInt({ min: 1 }).withMessage('At least one seat is required'),
  ],
  validate,
  bookBus
);

module.exports = router;

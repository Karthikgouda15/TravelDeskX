// /Users/karthikgouda/Desktop/TravelDesk/server/routes/flightRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { getFlights, getFlight, createFlight, getPriceTrend } = require('../controllers/flightController');
const { protect, restrictTo } = require('../middleware/auth');
const apiResponse = require('../utils/apiResponse');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((err) => err.msg);
    return apiResponse(res, 400, false, null, 'Validation Failed', messages);
  }
  next();
};

router.route('/')
  .get(getFlights)
  .post(
    protect,
    restrictTo('admin'),
    [
      body('airline').notEmpty().withMessage('Airline is required'),
      body('flightNumber').notEmpty().withMessage('Flight number is required'),
      body('origin').notEmpty().withMessage('Origin is required'),
      body('destination').notEmpty().withMessage('Destination is required'),
      body('departureTime').isISO8601().withMessage('Valid departure time is required'),
      body('arrivalTime').isISO8601().withMessage('Valid arrival time is required'),
      body('price').isNumeric().withMessage('Price must be a number'),
      body('cabinClass').isIn(['economy', 'business', 'first']).withMessage('Invalid cabin class'),
      body('totalSeats').isNumeric().withMessage('Total seats must be a number'),
      body('availableSeats').isNumeric().withMessage('Available seats must be a number'),
    ],
    validate,
    createFlight
  );

// Must be above /:id to avoid conflict
router.get('/price-trend', getPriceTrend);

router.route('/:id').get(getFlight);

module.exports = router;

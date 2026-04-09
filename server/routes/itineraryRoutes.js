// /Users/karthikgouda/Desktop/TravelDesk/server/routes/itineraryRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const {
  createItinerary,
  getMyItineraries,
  getItinerary,
  deleteItinerary,
} = require('../controllers/itineraryController');
const { protect } = require('../middleware/auth');
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

// Public Access — Share by ID or Token
router.get('/:idOrToken', getItinerary);

// Private Access — Itinerary Management
router.use(protect);

router.get('/my', getMyItineraries);

router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Itinerary title is required'),
    body('destination').notEmpty().withMessage('Destination is required'),
    body('dateRange.startDate').isISO8601().withMessage('startDate must be a valid date'),
    body('dateRange.endDate').isISO8601().withMessage('endDate must be a valid date'),
  ],
  validate,
  createItinerary
);

router.delete('/:id', deleteItinerary);

module.exports = router;

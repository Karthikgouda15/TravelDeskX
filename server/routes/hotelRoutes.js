// /Users/karthikgouda/Desktop/TravelDesk/server/routes/hotelRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { getHotels, getHotel, createHotel } = require('../controllers/hotelController');
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
  .get(getHotels)
  .post(
    protect,
    restrictTo('admin'),
    [
      body('name').notEmpty().withMessage('Hotel name is required'),
      body('location.city').notEmpty().withMessage('City is required'),
      body('location.country').notEmpty().withMessage('Country is required'),
      body('starRating').isInt({ min: 1, max: 5 }).withMessage('Star rating must be between 1 and 5'),
      body('description').notEmpty().withMessage('Description is required'),
      body('totalRooms').isNumeric().withMessage('Total rooms must be a number'),
    ],
    validate,
    createHotel
  );

router.route('/:id').get(getHotel);

module.exports = router;

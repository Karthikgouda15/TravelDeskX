// /Users/karthikgouda/Desktop/TravelDesk/server/routes/busRoutes.js
const express = require('express');
const router = express.Router();
const { 
  searchBuses, 
  getCities, 
  getBusById, 
  getPoints 
} = require('../controllers/busController');

// @route   GET /api/buses/search
router.get('/search', searchBuses);

// @route   GET /api/buses/cities
router.get('/cities', getCities);

// @route   GET /api/buses/:id
router.get('/:id', getBusById);

// @route   GET /api/buses/:id/points
router.get('/:id/points', getPoints);

module.exports = router;

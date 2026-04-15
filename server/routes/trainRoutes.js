// /Users/karthikgouda/Desktop/TravelDesk/server/routes/trainRoutes.js
const express = require('express');
const router = express.Router();
const { 
  searchTrains, 
  getStations, 
  getPNRStatus, 
  getLiveStatus, 
  getPopularRoutes 
} = require('../controllers/trainController');

// All train specific routes
router.get('/search', searchTrains);
router.get('/stations', getStations);
router.get('/pnr/:pnr', getPNRStatus);
router.get('/:number/status', getLiveStatus);
router.get('/popular-routes', getPopularRoutes);

module.exports = router;

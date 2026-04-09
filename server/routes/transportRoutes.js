// /Users/karthikgouda/Desktop/TravelDesk/server/routes/transportRoutes.js
const express = require('express');
const router = express.Router();
const { searchTransport, trackStatus } = require('../controllers/transportController');

router.get('/search', searchTransport);
router.get('/track', trackStatus);

module.exports = router;

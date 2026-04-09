// /Users/karthikgouda/Desktop/TravelDesk/server/routes/authRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { register, login, logout, getMe, refreshToken } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const apiResponse = require('../utils/apiResponse');

const router = express.Router();

// Specific rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, // Increased for smoother testing
  message: 'Security Alert: Access restricted due to multiple failed attempts. Please retry in 15 minutes.',
  handler: (req, res, next, options) => {
    return apiResponse(res, 429, false, null, options.message);
  },
});

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((err) => err.msg).join(', ');
    return apiResponse(res, 400, false, null, 'Validation Failed', messages);
  }
  next();
};

// Authentication Endpoints
router.post(
  '/register',
  authLimiter,
  [
    body('name').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid corporate email required'),
    body('password').isLength({ min: 6 }).withMessage('Security constraint: password must be at least 6 characters'),
  ],
  validate,
  register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid corporate email required'),
    body('password').exists().withMessage('Credentials incomplete: password required'),
  ],
  validate,
  login
);

router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;

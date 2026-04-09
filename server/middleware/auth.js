// /Users/karthikgouda/Desktop/TravelDesk/server/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const apiResponse = require('../utils/apiResponse');

/**
 * Protect routes by verifying JWT in HttpOnly cookie
 */
exports.protect = async (req, res, next) => {
  let token;

  // Read access token from HTTP Only cookie
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  // Make sure token exists
  if (!token) {
    return apiResponse(res, 401, false, null, 'Not authorized. Session expired or missing tokens.');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'access_secret');

    // Attach user to request
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return apiResponse(res, 401, false, null, 'User no longer exists');
    }

    next();
  } catch (err) {
    // If token is expired, the client-side axios interceptor will handle /refresh
    return apiResponse(res, 401, false, null, 'Token expired or invalid', err.message);
  }
};

/**
 * Grant access to specific roles
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return apiResponse(res, 403, false, null, `Access Forbidden: '${req.user.role}' role unauthorized`);
    }
    next();
  };
};

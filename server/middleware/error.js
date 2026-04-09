// /Users/karthikgouda/Desktop/TravelDesk/server/middleware/error.js
const apiResponse = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return apiResponse(res, 400, false, null, 'Validation Error', messages.join(', '));
  }

  if (err.code === 11000) {
    return apiResponse(res, 400, false, null, 'Duplicate field value entered', err.keyValue);
  }

  // Fallback for unexpected errors
  const message = err.message || 'Server Error';
  
  apiResponse(res, statusCode, false, null, message, process.env.NODE_ENV === 'development' ? err.stack : undefined);
};

module.exports = errorHandler;

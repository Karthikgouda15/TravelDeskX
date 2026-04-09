// /Users/karthikgouda/Desktop/TravelDesk/server/utils/apiResponse.js

/**
 * Standardized API response formatter.
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {Boolean} success - Success status
 * @param {Object|null} data - Response payload
 * @param {String} message - User-friendly message
 * @param {String|Object} [error=""] - Error details or message
 */
const apiResponse = (res, statusCode, success, data, message, error = "") => {
  return res.status(statusCode).json({
    success,
    data: data || {},
    message,
    error: error || ""
  });
};

module.exports = apiResponse;

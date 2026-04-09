// /Users/karthikgouda/Desktop/TravelDesk/server/utils/apiListResponse.js

/**
 * Standardized API response formatter for Lists/Collections.
 * Strictly adheres to the requirement:
 * { success: true, count: X, pagination: {...}, data: [] }
 * 
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {Array} data - Array of records
 * @param {Number} total - Total records overall
 * @param {Number} page - Current page
 * @param {Number} limit - Records per page
 */
const apiListResponse = (res, statusCode, data, total, page, limit) => {
  const count = data.length;
  const pages = Math.ceil(total / limit);

  return res.status(statusCode).json({
    success: true,
    count,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      pages,
    },
    data,
  });
};

module.exports = apiListResponse;

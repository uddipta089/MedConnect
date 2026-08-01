/**
 * Standardize API responses
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Success message
 * @param {Object|Array} data - Data payload
 * @param {Object|Array} errors - Error details
 */
export const sendResponse = (res, statusCode, message, data = null, errors = null) => {
  return res.status(statusCode).json({
    success: statusCode >= 200 && statusCode < 300,
    message,
    data,
    errors
  });
};

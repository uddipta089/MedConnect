import logger from '../utils/logger.js';
import { sendResponse } from '../utils/responseHandler.js';

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;
  let errors = null;

  // If Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    message = 'Resource not found';
    statusCode = 404;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    message = 'Validation Error';
    statusCode = 422;
    errors = Object.values(err.errors).map(val => val.message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    message = 'Duplicate field value entered';
    statusCode = 400;
  }

  // Zod Validation Error
  if (err.name === 'ZodError') {
    message = 'Validation Error';
    statusCode = 422;
    errors = err.errors.map(e => ({ field: e.path.join('.'), message: e.message }));
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Not authorized, token failed';
    statusCode = 401;
  }
  
  if (err.name === 'TokenExpiredError') {
    message = 'Not authorized, token expired';
    statusCode = 401;
  }

  logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip} - ${err.stack}`);

  sendResponse(res, statusCode, message, null, process.env.NODE_ENV === 'development' ? { stack: err.stack, ...errors } : errors);
};

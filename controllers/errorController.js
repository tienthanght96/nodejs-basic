const AppError = require('../utils/appError');

const sendErrorDev = (error, res) => {
  res.status(error.statusCode).json({
    status: error.status,
    error: error,
    message: error.message,
    stack: error.stack
  });
};

const sendErrorProduction = (error, res) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message
    });
  } else {
    // eslint-disable-next-line no-console
    console.error('ERROR =>', error);

    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
};

// Handle Cast Error from DB
const handleCastErrorDB = error => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
};

// Handle Duplicate Error from DB
const handleDuplicateDB = error => {
  const valueDuplicate = error.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field ${valueDuplicate}. Please use another value`;
  return new AppError(message, 400);
};

// Handle Validation Error from DB
const handleValidationErrorDB = error => {
  const errors = Object.values(error.errors).map(value => value.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

module.exports = (err, req, res, next) => {
  let error = { ...err };
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV === 'production') {
    // Cast Error from DB
    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    // Duplicate Field DB
    if (error.code === 11000) {
      error = handleDuplicateDB(error);
    }
    // Validation Error Field DB
    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }

    sendErrorProduction(error, res);
  }
};

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
  // Operational, trusted error: send message to client
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message
    });
  } else {
    // 1) Log error
    // eslint-disable-next-line no-console
    console.error('ERROR 💥', error);

    // 2) Send generic message
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
const handleDuplicateFieldsDB = error => {
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

const handleJWTErrror = () => {
  return new AppError('Invalid token. Please login again!', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('Your token has been expired. Please login again', 401);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }
    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }
    if (error.name === 'JsonWebTokenError') {
      error = handleJWTErrror();
    }
    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }

    sendErrorProduction(error, res);
  }
};

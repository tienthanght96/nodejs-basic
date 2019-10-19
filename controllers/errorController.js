const AppError = require('../utils/appError');

const sendErrorDev = (error, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(error.statusCode).json({
      status: error.status,
      error: error,
      message: error.message,
      stack: error.stack
    });
  }

  // B) RENDERED WEBSITE
  // console.error('ERROR 💥', error);
  return res.status(error.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: error.message
  });
};

const sendErrorProduction = (error, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    if (error.isOperational) {
      return res.status(error.statusCode).json({
        status: error.status,
        message: error.message
      });
    }
    // 1) Log error
    // eslint-disable-next-line no-console
    console.error('ERROR 💥', error);

    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
  // RENDERED WEBSITE
  // Operational, trusted error: send message to client
  if (error.isOperational) {
    return res.status(error.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: error.message
    });
  }

  return res.status(error.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.'
  });
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
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

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

    sendErrorProduction(error, req, res);
  }
};

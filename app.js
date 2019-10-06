const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const tourRouter = require('./routers/tourRoutes');
const userRouter = require('./routers/userRoutes');
const reviewRouter = require('./routers/reviewRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// Set Security HTTP Header
app.use(helmet());

// Dev Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  app.use((req, res, next) => {
    // eslint-disable-next-line no-console
    console.log('Hello this is custom middleware...');
    next();
  });
}

// Limit 100 request in an hours from one IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again in an hour'
});

// Data sanitization against NoSQL query Injection
app.use(mongoSanitize({}));

// Data sanitization against XSS attacth
app.use(xss());

// Prevent Parameter Pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Body Parse
app.use(express.json({ limit: '10kb' }));

// Serving static file
app.use(express.static(`${__dirname}/public`));

// Routes
app.use('/api', limiter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// Handle incorrect request
app.all('*', (req, res, next) => {
  const message = `Can't find ${req.originalUrl} on this server!`;
  const statusCode = 404;
  next(new AppError(message, statusCode));
});
// Handle middleware error with express
app.use(globalErrorHandler);

module.exports = app;

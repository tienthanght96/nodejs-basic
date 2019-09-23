const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routers/tourRoutes');
const userRouter = require('./routers/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();
app.use(express.static(`${__dirname}/public`));
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  app.use((req, res, next) => {
    // eslint-disable-next-line no-console
    console.log('Hello this is custom middleware...');
    next();
  });
}

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
// Handle incorrect request
app.all('*', (req, res, next) => {
  const message = `Can't find ${req.originalUrl} on this server!`;
  const statusCode = 404;
  next(new AppError(message, statusCode));
});
// Handle middleware error with express
app.use(globalErrorHandler);

module.exports = app;

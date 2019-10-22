const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const handlerFatory = require('./handlerFactory');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');

module.exports = {
  getCheckoutSession: catchAsync(async (req, res, next) => {
    // Get the currently booked tour
    const tour = await Tour.findById(req.params.tourId);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${
        req.params.tourId
      }&user=${req.user.id}&price=${tour.price}`,
      cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
      line_items: [
        {
          name: `${tour.name} Tour`,
          description: tour.summary,
          images: [
            'https://media.gettyimages.com/photos/moraine-lake-in-banff-national-park-canada-picture-id500177214?s=612x612'
          ],
          amount: tour.price * 1000,
          currency: 'usd',
          quantity: 1
        }
      ]
    });

    // Create session as response
    res.status(200).json({
      status: 'success',
      session: session
    });
  }),
  // Create new booking when chkeckout success with tour, user, price in query params
  createBookingCheckout: catchAsync(async (req, res, next) => {
    const { tour, user, price } = req.query;

    if (!tour && !user && !price) {
      return next();
    }
    await Booking.create({ tour, user, price });
    res.redirect(req.originalUrl.split('?')[0]); // split success_url
  }),
  createBooking: handlerFatory.createOne(Booking),
  getBooking: handlerFatory.getOne(Booking),
  getAllBookings: handlerFatory.getAll(Booking),
  updateBooking: handlerFatory.updateOne(Booking),
  deleteBooking: handlerFatory.deleteOne(Booking)
};

const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

module.exports = {
  getOverview: catchAsync(async (req, res, next) => {
    const tours = await Tour.find();

    res.status(200).render('overview', {
      title: 'All Tours',
      tours
    });
  }),
  getTour: catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
      path: 'reviews',
      fields: 'rating user review'
    });
    if (!tour) {
      return next(new AppError('There is no tour with that name', 404));
    }
    res.status(200).render('tour', {
      tour,
      title: tour.name
    });
  }),
  getLoginForm: catchAsync(async (req, res, next) => {
    res.status(200).render('login', {
      title: 'Login into your account'
    });
  }),
  getAccount: catchAsync(async (req, res, next) => {
    res.status(200).render('account', {
      title: req.user.name
    });
  }),
  updateUserData: catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: req.body.name,
        email: req.body.email
      },
      { new: true, runValidators: true }
    );
    res.status(200).render('account', {
      title: 'Login into your account',
      user
    });
  })
};

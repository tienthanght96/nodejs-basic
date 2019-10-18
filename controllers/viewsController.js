const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

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

    res.status(200).render('tour', {
      tour,
      title: tour.name
    });
  }),
  getLoginForm: catchAsync(async (req, res, next) => {
    res.status(200).render('login', {
      title: 'Login into your account'
    });
  })
};

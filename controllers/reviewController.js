const Review = require('../models/reviewModel');
const handlerFatory = require('./handlerFactory');
// const catchAsync = require('../utils/catchAsync');

module.exports = {
  setTourUserIds(req, res, next) {
    if (!req.body.tour) {
      req.body.tour = req.params.tourId;
    }
    if (!req.body.user) {
      req.body.user = req.user.id;
    }
    next();
  },
  getAllReviews: handlerFatory.getAll(Review),
  getReview: handlerFatory.getOne(Review),
  createNewReview: handlerFatory.createOne(Review),
  updateReview: handlerFatory.updateOne(Review),
  deleteReview: handlerFatory.deleteOne(Review)
};

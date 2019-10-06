const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');

module.exports = {
  getAllReviews: catchAsync(async (req, res) => {
    const reviewsResult = await Review.find();
    res.status(200).json({
      result: reviewsResult.length,
      data: {
        reviews: reviewsResult
      },
      status: 'success'
    });
  }),
  createNewReview: catchAsync(async (req, res) => {
    const newReview = await Review.create(req.body);
    res.status(201).json({
      data: {
        review: newReview
      },
      status: 'success'
    });
  })
};

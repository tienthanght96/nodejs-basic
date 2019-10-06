const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

module.exports = {
  // middleware to set query to filter top 5 tours cheap
  aliasTopTour: (req, res, next) => {
    req.query = {
      limit: '5',
      sort: '-ratingsAverage,price',
      fields: 'name,price,ratingsAverage,summary,difficulty'
    };
    next();
  },
  getAllTours: catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();

    const toursResult = await features.mongoQuery;
    res.status(200).json({
      result: toursResult.length,
      data: {
        tours: toursResult
      },
      status: 'success'
    });
  }),
  createTour: catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body);
    res.status(200).json({
      tour: newTour,
      status: 'success'
    });
  }),
  getTour: catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id).populate('reviews');
    if (!tour) {
      return next(new AppError('No tour found with that ID', 404));
    }
    res.status(200).json({
      tour: tour,
      status: 'success'
    });
  }),
  updateTour: catchAsync(async (req, res, next) => {
    const tourUpdated = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!tourUpdated) {
      return next(new AppError('No tour found with that ID', 404));
    }
    return res.status(200).json({
      data: {
        tour: tourUpdated,
        message: 'Tour was updated success!'
      },
      status: 'success'
    });
  }),
  deleteTour: catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) {
      return next(new AppError('No tour found with that ID', 404));
    }
    return res.status(200).json({
      data: {
        message: 'Tour was deleted success!'
      },
      status: 'success'
    });
  }),
  getTourStats: catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
      {
        $match: {
          ratingsAverage: { $gte: 4.5 }
        }
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numsRating: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      {
        $sort: {
          avgPrice: 1
        }
      }
    ]);
    return res.status(200).json({
      data: { stats },
      status: 'success'
    });
  }),
  getMonthlyPlan: catchAsync(async (req, res) => {
    const year = +req.params.year;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numToursStats: { $sum: 1 },
          tours: { $push: '$name' }
        }
      },
      {
        $addFields: {
          month: '$_id'
        }
      },
      {
        $project: {
          _id: 0
        }
      },
      {
        $sort: {
          numToursStats: 1
        }
      },
      {
        $limit: 12
      }
    ]);

    return res.status(200).json({
      result: plan.length,
      data: {
        plan
      },
      status: 'success'
    });
  })
};

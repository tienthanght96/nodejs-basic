const Tour = require('../models/tourModel');
const handlerFatory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');

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
  }),
  getAllTours: handlerFatory.getAll(Tour),
  createTour: handlerFatory.createOne(Tour),
  getTour: handlerFatory.getOne(Tour, { path: 'reviews' }),
  updateTour: handlerFatory.updateOne(Tour),
  deleteTour: handlerFatory.deleteOne(Tour)
};

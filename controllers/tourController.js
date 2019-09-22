const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

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
  getAllTours: async (req, res) => {
    try {
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
    } catch (error) {
      res.status(404).json({
        status: 'fail',
        message: `Can not get tours!`
      });
    }
  },
  createTour: async (req, res) => {
    try {
      const newTour = await Tour.create(req.body);
      res.status(200).json({
        tour: newTour,
        status: 'success'
      });
    } catch (error) {
      res.status(400).json({
        status: 'fail',
        message: error
      });
    }
  },
  getTour: async (req, res) => {
    try {
      const tour = await Tour.findById(req.params.id);
      res.status(200).json({
        tour: tour,
        status: 'success'
      });
    } catch (error) {
      return res.status(404).json({
        data: {
          message: 'Can not find your tour!'
        },
        status: 'fail'
      });
    }
  },
  updateTour: async (req, res) => {
    try {
      const tourUpdated = await Tour.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      return res.status(200).json({
        data: {
          tour: tourUpdated,
          message: 'Tour was updated success!'
        },
        status: 'success'
      });
    } catch (error) {
      return res.status(404).json({
        data: {
          message: 'Can not find tour with your info to update!'
        },
        status: 'fail'
      });
    }
  },
  deleteTour: async (req, res) => {
    try {
      await Tour.findByIdAndDelete(req.params.id);
      return res.status(200).json({
        data: {
          message: 'Tour was deleted success!'
        },
        status: 'success'
      });
    } catch (error) {
      return res.status(404).json({
        data: {
          message: 'Can not find tour with your info to delete!'
        },
        status: 'fail'
      });
    }
  },
  getTourStats: async (req, res) => {
    try {
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
    } catch (error) {
      return res.status(404).json({
        message: error,
        status: 'fail'
      });
    }
  },
  getMonthlyPlan: async (req, res) => {
    try {
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
    } catch (error) {
      return res.status(404).json({
        message: error,
        status: 'fail'
      });
    }
  }
};

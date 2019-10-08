const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

module.exports = {
  deleteOne: Model => {
    return catchAsync(async (req, res, next) => {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) {
        return next(new AppError('No document found with that ID', 404));
      }
      return res.status(200).json({
        data: {
          message: 'Deleted success!'
        },
        status: 'success'
      });
    });
  },
  updateOne: Model => {
    return catchAsync(async (req, res, next) => {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });
      if (!doc) {
        return next(new AppError('No document found with that ID', 404));
      }
      return res.status(200).json({
        data: {
          message: 'Data was updated success!',
          data: doc
        },
        status: 'success'
      });
    });
  },
  createOne: Model => {
    return catchAsync(async (req, res, next) => {
      const doc = await Model.create(req.body);
      return res.status(200).json({
        data: {
          message: 'Data was created success!',
          data: doc
        },
        status: 'success'
      });
    });
  },
  getOne: (Model, populateOptions) => {
    return catchAsync(async (req, res, next) => {
      let mongoQuery = Model.findById(req.params.id);

      if (populateOptions) {
        mongoQuery = mongoQuery.populate(populateOptions);
      }

      const doc = await mongoQuery;

      if (!doc) {
        return next(new AppError('No document found with that ID', 404));
      }

      return res.status(200).json({
        data: {
          data: doc
        },
        status: 'success'
      });
    });
  },
  getAll: Model => {
    return catchAsync(async (req, res, next) => {
      // To allow for nested GET Reviews router on tours
      const filter = {};
      if (req.params.tourId) {
        filter.tour = req.params.tourId;
      }

      const features = new APIFeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .pagination();

      const docsResult = await features.mongoQuery;
      res.status(200).json({
        result: docsResult.length,
        data: {
          data: docsResult
        },
        status: 'success'
      });
    });
  }
};

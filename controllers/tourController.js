const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
const handlerFatory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

module.exports = {
  uploadTourImages: upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
  ]),
  resizeTourImages: catchAsync(async (req, res, next) => {
    if (!req.files || !req.files.imageCover || !req.files.images) {
      return next();
    }
    // Cover image
    const imageCoverFilename = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${imageCoverFilename}`);
    req.body.imageCover = imageCoverFilename;
    // Images list

    req.body.images = [];
    await Promise.all(
      req.files.images.map((file, index) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${index +
          1}.jpeg`;
        req.body.images.push(filename);
        return sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/tours/${filename}`);
      })
    );
    next();
  }),
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
  getAllToursWithin: catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitutr and longitude in the format lat,lng.',
          400
        )
      );
    }

    const tours = await Tour.find({
      startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        data: tours
      }
    });
  }),
  getDistances: catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if (!lat || !lng) {
      return next(
        new AppError(
          'Please provide latitude and longitude in the format lat,lng.',
          400
        )
      );
    }

    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1]
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier
        }
      },
      {
        $project: {
          distance: 1,
          name: 1
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        data: distances
      }
    });
  }),
  getAllTours: handlerFatory.getAll(Tour),
  createTour: handlerFatory.createOne(Tour),
  getTour: handlerFatory.getOne(Tour, { path: 'reviews' }),
  updateTour: handlerFatory.updateOne(Tour),
  deleteTour: handlerFatory.deleteOne(Tour)
};

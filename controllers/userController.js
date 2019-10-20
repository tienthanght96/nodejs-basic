const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const handlerFatory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     // format user-user_id-timestamp
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });
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

function filterObject(obj, ...allowedFields) {
  const newObject = {};
  Object.keys(obj).forEach(key => {
    if (allowedFields.includes(key)) {
      newObject[key] = obj[key];
    }
  });
  return newObject;
}

module.exports = {
  uploadPhoto: upload.single('photo'),
  resizeUserPhoto: catchAsync(async (req, res, next) => {
    if (!req.file) {
      return next();
    }
    const filename = `user-${req.user.id}-${Date.now()}.jpeg`;
    req.file.filename = filename;
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/users/${filename}`);
    next();
  }),
  getMe: (req, res, next) => {
    req.params.id = req.user.id;
    next();
  },
  updateMe: catchAsync(async (req, res, next) => {
    // Error if user post password data
    const { password, passwordConfirm } = req.body;
    if (password || passwordConfirm) {
      return next(
        new AppError(
          'This route is not for password updates. Please use /update-password.'
        )
      );
    }
    // user findByIdAndUpdate to avoid validator password
    const dataUpdate = filterObject(req.body, 'name', 'email');
    if (req.file) {
      dataUpdate.photo = req.file.filename;
    }

    const user = await User.findByIdAndUpdate(req.user.id, dataUpdate, {
      new: true,
      runValidators: true
    });
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  }),
  deleteMe: catchAsync(async (req, res, next) => {
    // user findByIdAndUpdate to avoid validator password
    const dataUpdate = { active: false };
    await User.findByIdAndUpdate(req.user.id, dataUpdate);
    res.status(200).json({
      status: 'success',
      message: 'Delete success',
      data: null
    });
  }),
  getAllUsers: handlerFatory.getAll(User),
  getUser: handlerFatory.getOne(User),
  updateUser: handlerFatory.updateOne(User),
  deleteUser: handlerFatory.deleteOne(User)
};

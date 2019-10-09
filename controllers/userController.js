const User = require('../models/userModel');
const handlerFatory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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

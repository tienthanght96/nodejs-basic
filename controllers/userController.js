const User = require('../models/userModel');
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
  getAllUsers: catchAsync(async (req, res) => {
    const usersResult = await User.find();
    res.status(200).json({
      result: usersResult.length,
      data: {
        users: usersResult
      },
      status: 'success'
    });
  }),
  createUser: (req, res) => {
    res.status(200).json({
      data: {},
      status: 'success'
    });
  },
  getUser: (req, res) => {
    return res.status(200).json({
      data: {},
      status: 'success'
    });
  },
  updateUser: (req, res) => {
    return res.status(200).json({
      data: {},
      status: 'success'
    });
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
  deleteUser: (req, res) => {
    return res.status(200).json({
      data: {
        message: 'Delete user success'
      },
      status: 'success'
    });
  }
};

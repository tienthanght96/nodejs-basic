const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
}

module.exports = {
  signup: catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);
    const token = signToken(newUser._id);
    res.status(201).json({
      token,
      status: 'success',
      data: {
        user: newUser
      }
    });
  }),
  login: catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provice email or password!', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password!', 401));
    }

    const token = signToken(user._id);
    res.status(200).json({
      status: 'success',
      token
    });
  }),
  protect: catchAsync(async (req, res, next) => {
    // Get token
    let token = null;
    const { authorization } = req.headers;

    if (authorization && authorization.startsWith('Bearer')) {
      token = authorization.split(' ')[1];
    }
    if (!token) {
      return next(
        new AppError('Your are not login! Please login to get access', 401)
      );
    }

    // Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Check user still exits or was deleted
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
      return next(
        new AppError('The user belonging to this token does not exists', 401)
      );
    }

    // Check if user changed password after token was issued
    if (freshUser.changePasswordAfter(decoded.iat)) {
      return next(
        new AppError('User recently changed password. Please login again', 401)
      );
    }

    req.user = freshUser;

    next();
  }),
  restrictTo: (...roles) => {
    // roles: ['user', 'guide', 'lead-guide', 'admin']
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return next(
          new AppError('You do not have permission to perform this action', 403)
        );
      }
      next();
    };
  },
  forgotPassword: catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new AppError('There is no user with email address', 404));
    }

    // Genrate random reset token
    const resetToken = user.createPasswordResetToken();
    // console.log('resetToken', resetToken);
    await user.save({ validateBeforeSave: false });

    // Send email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/reset-password/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH requeset with your new password and password confirm to ${resetURL}`;
    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token(valid for 10 min)',
        message
      });
      res.status(200).json({
        status: 'success',
        message: 'Token sent to the email'
      });
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return next(
        new AppError(
          'There was error sending the email! Try again later !',
          400
        )
      );
    }
  }),
  resetPassword: catchAsync((req, res, next) => {})
};

const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
}

function createSendToken(user, statusCode, req, res) {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || process.env.NODE_ENV === 'production'
  };

  if (req.secure || process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }
  res.cookie('jwt', token, cookieOptions);

  // Remove password
  user.password = undefined;

  res.status(statusCode).json({
    token,
    status: 'success',
    data: {
      user
    }
  });
}

module.exports = {
  signup: catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);
    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser, url).sendWelcome();
    createSendToken(newUser, 201, req, res);
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
    createSendToken(user, 200, req, res);
  }),
  logout: (req, res) => {
    res.cookie('jwt', '', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });
    res.status(200).json({
      status: 'success'
    });
  },
  protect: catchAsync(async (req, res, next) => {
    // Get token
    let token = null;
    const { authorization } = req.headers;

    if (authorization && authorization.startsWith('Bearer')) {
      token = authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
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
    res.locals.user = freshUser;
    next();
  }),
  // Only for rendered pages, no errors
  isLoggedIn: async (req, res, next) => {
    try {
      if (req.cookies.jwt) {
        const token = req.cookies.jwt;

        // Verification token
        const decoded = await promisify(jwt.verify)(
          token,
          process.env.JWT_SECRET
        );

        // Check user still exits or was deleted
        const freshUser = await User.findById(decoded.id);
        if (!freshUser) {
          return next();
        }

        // Check if user changed password after token was issued
        if (freshUser.changePasswordAfter(decoded.iat)) {
          return next();
        }

        // There is a logged in user
        // res.locals will be used in pug template
        res.locals.user = freshUser;
        return next();
      }
      next();
    } catch (error) {
      next();
    }
  },
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
    try {
      const resetURL = `${req.protocol}://${req.get(
        'host'
      )}/api/v1/reset-password/${resetToken}`;
      await new Email(user, resetURL).sendPasswordReset();

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
  resetPassword: catchAsync(async (req, res, next) => {
    // Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    // Find user and check password token expire & set new password
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });
    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }
    // when reset new password success, we will remove token reset in database and token expire reset password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, req, res);
  }),
  updatePassword: catchAsync(async (req, res, next) => {
    const { password, passwordCurrent, passwordConfirm } = req.body;
    // Get user info
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.correctPassword(passwordCurrent, user.password))) {
      return next(new AppError('Your current password is wrong', 401));
    }
    // Update the password
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    await user.save();
    // Login user in, send JWT
    createSendToken(user, 200, req, res);
  })
};

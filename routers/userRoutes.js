const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const userRouter = express.Router();

userRouter.post('/signup', authController.signup);
userRouter.post('/login', authController.login);

userRouter.post('/forgot-password', authController.forgotPassword);
userRouter.patch('/reset-password/:token', authController.resetPassword);

// Protect all routes after this middleware
userRouter.use(authController.protect);

userRouter.patch('/update-password', authController.updatePassword);

userRouter.get('/me', userController.getMe, userController.getUser);
userRouter.patch('/update-me', userController.updateMe);
userRouter.delete('/delete-me', userController.deleteMe);

// Protect all routes for admin role after this middleware
userRouter.use(authController.restrictTo('admin'));

userRouter.route('/').get(userController.getAllUsers);

userRouter
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = userRouter;

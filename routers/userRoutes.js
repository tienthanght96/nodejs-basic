const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const userRouter = express.Router();

userRouter.post('/signup', authController.signup);
userRouter.post('/login', authController.login);

userRouter.post('/forgot-password', authController.forgotPassword);
userRouter.patch('/reset-password/:token', authController.resetPassword);
userRouter.patch(
  '/update-password',
  authController.protect,
  authController.updatePassword
);
userRouter.patch('/update-me', authController.protect, userController.updateMe);
userRouter.delete(
  '/delete-me',
  authController.protect,
  userController.deleteMe
);

userRouter
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

userRouter
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = userRouter;

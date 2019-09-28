const User = require('../models/userModel');

module.exports = {
  getAllUsers: async (req, res) => {
    const usersResult = await User.find();
    res.status(200).json({
      result: usersResult.length,
      data: {
        users: usersResult
      },
      status: 'success'
    });
  },
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
  deleteUser: (req, res) => {
    return res.status(200).json({
      data: {
        message: 'Delete user success'
      },
      status: 'success'
    });
  }
};

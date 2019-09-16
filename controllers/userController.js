module.exports = {
  getAllUsers: (req, res) => {
    res.status(200).json({
      data: {
      },
      status: 'success'
    });
  },
  createUser: (req, res) => {
    res.status(200).json({
      data: {
      },
      status: 'success'
    });
  },
  getUser: (req, res) => {
    return res.status(200).json({
      data: {
      },
      status: 'success'
    });
  },
  updateUser: (req, res) => {
    return res.status(200).json({
      data: {
      },
      status: 'success'
    });
  },
  deleteUser: (req, res) => {
    return res.status(200).json({
      data: {
        message: "Delete user success"
      },
      status: 'success'
    });
  }
};
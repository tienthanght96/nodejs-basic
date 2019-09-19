const Tour = require('../models/tourModel');

module.exports = {
  getAllTours: async (req, res) => {
    try {
      const tours = await Tour.find();
      res.status(200).json({
        data: {
          tours
        },
        result: tours.length,
        status: 'success'
      });
    } catch (error) {
      res.status(404).json({
        status: 'fail',
        message: `Can not get tours!`
      });
    }
  },
  createTour: async (req, res) => {
    try {
      const newTour = await Tour.create(req.body);
      res.status(200).json({
        tour: newTour,
        status: 'success'
      });
    } catch (error) {
      res.status(400).json({
        status: 'fail',
        message: `Can not create new tour! Invaild tour data`
      });
    }
  },
  getTour: async (req, res) => {
    try {
      const tour = await Tour.findById(req.params.id);
      res.status(200).json({
        tour: tour,
        status: 'success'
      });
    } catch (error) {
      return res.status(404).json({
        data: {
          message: 'Can not find your tour!'
        },
        status: 'error'
      });
    }
  },
  updateTour: async (req, res) => {
    try {
      const tourUpdated = await Tour.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      return res.status(200).json({
        data: {
          tour: tourUpdated,
          message: 'Tour was updated success!'
        },
        status: 'success'
      });
    } catch (error) {
      return res.status(404).json({
        data: {
          message: 'Can not find tour with your info to update!'
        },
        status: 'error'
      });
    }
  },
  deleteTour: async (req, res) => {
    try {
      await Tour.findByIdAndDelete(req.params.id);
      return res.status(200).json({
        data: {
          message: 'Tour was deleted success!'
        },
        status: 'success'
      });
    } catch (error) {
      return res.status(404).json({
        data: {
          message: 'Can not find tour with your info to delete!'
        },
        status: 'error'
      });
    }
  }
};

const fs = require('fs');

const JSON_FILE_PATH = `${__dirname}/../dev-data/data/tours-simple.json`;
const tours = JSON.parse(fs.readFileSync(JSON_FILE_PATH));

module.exports = {
  checkID: (req, res, next, val) => {
    if (!+req.params.id || +req.params.id > tours.length) {
      return res.status(404).json({
        data: {
          message: 'Can not find tour with your id !'
        },
        status: 'error'
      });
    }
    next();
  },
  checkBody: (req, res, next) => {
    const { name, price } = req.body;
    if (!name || !price) {
      return res.status(400).json({
        data: {
          message: 'Missing name or price !'
        },
        status: 'error'
      });
    }
    next();
  },
  getAllTours: (req, res) => {
    res.status(200).json({
      data: {
        tours
      },
      result: tours.length,
      status: 'success'
    });
  },
  createTour: (req, res) => {
    const newTourId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({ id: newTourId }, req.body);
    tours.push(newTour);

    fs.writeFile(JSON_FILE_PATH, JSON.stringify(tours), error => {
      res.status(200).json({
        data: {
          tour: newTour
        },
        status: 'success'
      });
    });
  },
  getTour: (req, res) => {
    const tour = tours.find(t => +t.id === +req.params.id);
    if (tour && tour.id) {
      return res.status(200).json({
        data: {
          tour
        },
        status: 'success'
      });
    }
    return res.status(404).json({
      data: {
        message: 'Can not find tour with your id !'
      },
      status: 'error'
    });
  },
  updateTour: (req, res) => {
    let tour = tours.find(t => +t.id === +req.params.id);
    if (tour && tour.id) {
      return res.status(200).json({
        data: {
          tour
        },
        status: 'success'
      });
    }

    return res.status(404).json({
      data: {
        message: 'Can not find tour with your id to update!'
      },
      status: 'error'
    });
  },
  deleteTour: (req, res) => {
    let tour = tours.find(t => +t.id === +req.params.id);
    if (tour && tour.id) {
      return res.status(200).json({
        data: {
          message: 'Delete tour success'
        },
        status: 'success'
      });
    }

    return res.status(204).json({
      data: {
        message: 'Can not find tour with your id to delete!'
      },
      status: 'error'
    });
  }
};

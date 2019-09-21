const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: [true, 'A tour must have name']
  },
  rating: {
    type: Number,
    default: 4.5
  },
  ratingsAverage: {
    type: Number,
    default: 4.5
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have duration']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have max group size']
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have difficulty']
  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'A tour must have summary']
  },
  description: {
    type: String,
    trim: true,
    required: [true, 'A tour must have description']
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image']
  },
  images: {
    type: [String],
    required: [true, 'A tour must have a cover image']
  },
  createdDate: {
    type: Date,
    default: Date.now(),
    select: false
  },
  startDates: {
    type: [Date]
  },
  price: {
    type: Number,
    required: [true, 'A tour must have price']
  },
  priceDiscount: {
    type: Number
  }
});

const Tour = mongoose.model('tour', tourSchema);

module.exports = Tour;

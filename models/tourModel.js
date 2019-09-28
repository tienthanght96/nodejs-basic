const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      required: [true, 'A tour must have name']
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: {
      type: String,
      unique: true
    },
    rating: {
      type: Number,
      default: 4.5
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0']
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
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message:
          'A tour must have difficulty is either: easy, medium, difficult'
      },
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
    secretTour: {
      type: Boolean,
      default: false
    },
    price: {
      type: Number,
      required: [true, 'A tour must have price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(value) {
          return value < this.price;
        },
        message: 'Discount price ({ VALUE }) should be below regular price'
      }
    }
  },
  // Show virtual property in response output
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual property
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// Document Middleware
tourSchema.pre('save', function(next) {
  // Create slug when create new tour
  if (this.name) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

// Query Middleware
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

// Aggregation Middleware
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({
    $match: {
      secretTour: { $ne: true }
    }
  });
  next();
});

const Tour = mongoose.model('tour', tourSchema);

module.exports = Tour;

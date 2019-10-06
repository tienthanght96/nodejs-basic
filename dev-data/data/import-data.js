const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' });

const DATABASE_URI = process.env.DATABASE_URI_LOCAL;

mongoose
  .connect(DATABASE_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('DB connect success !');
  })
  .catch(error => {
    // eslint-disable-next-line no-console
    console.log('DB connect errored', error);
  });

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

// Import data to mongodb
const importData = async () => {
  try {
    await Tour.create(tours);
    // eslint-disable-next-line no-console
    console.log('Data was imported');
    process.exit();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Can not import data', error);
    process.exit();
  }
};

// Delete data in mongodb
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    // eslint-disable-next-line no-console
    console.log('All data was deleted');
    process.exit();
  } catch (error) {
    await Tour.deleteMany();
    // eslint-disable-next-line no-console
    console.log('Can not delete data', error);
    process.exit();
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

// module.exports = { deleteData, importData };

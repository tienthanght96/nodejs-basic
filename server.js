const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

const { DATABASE_URI } = process.env;

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
  });

const app = require('./app');

// Add listener to close server when have uncaughtException
process.on('uncaughtException', error => {
  // eslint-disable-next-line no-console
  console.log(error.name, error.message);
  // eslint-disable-next-line no-console
  console.log('CLOSING SERVER uncaughtException.......');
  process.exit(1);
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App running on port ${PORT}....`);
});

// Add listener to close server when have unhandledRejection
process.on('unhandledRejection', error => {
  // eslint-disable-next-line no-console
  console.log(error.name, error.message);
  // eslint-disable-next-line no-console
  console.log('CLOSING SERVER unhandledRejection.......');
  server.close(() => {
    process.exit(1);
  });
});

const dotenv = require('dotenv');
const mongoose = require('mongoose');

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

const app = require('./app');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App running on port ${PORT}....`);
});

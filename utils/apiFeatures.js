class APIFeatures {
  constructor(mongoQuery, queryString) {
    this.mongoQuery = mongoQuery;
    this.queryString = queryString;
  }

  filter() {
    const query = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(field => delete query[field]);

    // Advance filtering
    let queryString = JSON.stringify(query);

    // Replace gte, gt, lte, lt with operation of mongodb
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      match => `$${match}`
    );
    const finalFilterQuery = JSON.parse(queryString);

    this.mongoQuery = this.mongoQuery.find(finalFilterQuery);
    return this;
  }

  sort() {
    // Sorting Query
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.mongoQuery = this.mongoQuery.sort(sortBy);
    } else {
      this.mongoQuery = this.mongoQuery.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    // Limit fields will be add to response to client
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.mongoQuery = this.mongoQuery.select(fields);
    } else {
      this.mongoQuery = this.mongoQuery.select('-__v');
    }
    return this;
  }

  pagination() {
    // Pagination
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 10;
    const skip = (page - 1) * limit;

    this.mongoQuery = this.mongoQuery.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;

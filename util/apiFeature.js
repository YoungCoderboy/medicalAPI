class APIFeature {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    console.log(this.queryString);
  }
  filter() {
    // console.log(this.queryString);
    const queryObject = { ...this.queryString };
    const exclude = ["page", "fields", "sort", "limit"];
    exclude.forEach((Element) => delete queryObject[Element]);

    //? Advance filtering (adding $ in front of objects)
    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortby = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortby);
    } else {
      //?newest first
      this.query = this.query.sort("-createdAt");
    }
    return this; //? return this beacause if we want to chain the method we need something to work withx
  }

  fields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    }
    return this;
  }

  page() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;

    this.query = this.query.skip(limit * (page - 1)).limit(limit);
    return this;
  }
}
module.exports = APIFeature;

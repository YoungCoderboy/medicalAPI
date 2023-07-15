const mongoose = require("mongoose");
const slugify = require("slugify");
// const validator = require('validator');

// ! mongoose.Schema({ schema},{object});
const medSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "You Should specify  name"],
      unique: true,
      trim: true, //remove the wide spaces from the string
    },
    slug: String, // alternative name for routes
    price: {
      type: Number,
      default: 0,
      required: [true, "You Should specify price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        // this will not work will we call update
        validator: function (value) {
          //this will point to current document or new created document
          return value < this.price;
        },
        message: "Discount must be less than price",
      },
    },
    content: {
      type: [String],
      required: [true, "Medicine should have Content"],
      trim: true,
    },

    manufacturer: {
      type: [String],
      require: [true, "you should at least provide one manufacturer"],
    },
    generic: {
      type: Boolean,
      default: false,
      required: true,
    },

    description: {
      type: String,
      trim: true, //remove the wide spaces from
    },
    useInstruction: {
      type: String,
      default: "as directed by physician",
    },
    overdose: {
      type: [String],
      default: ["No as such sideeffects"],
    },
    dose: {
      type: [String], //TODO: create object of <date,string> which represent <age,amount/dose>
    },
    noOfStrip: {
      type: Number,
      default: 1, //assume we have atleast one strip
    },
    noOfTabletPerStrip: {
      type: Number,
      default: 1, // assume we have atleast one tablet in a strip
    },
    expire: {
      type: Date,
    },
    secretMed: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      //? this will hide the data from the user
      select: false,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true }, //! this and below required to provide the virtual fields in schema
    toObject: { virtuals: true }, //
  }
);
//! we cannot use the virtual fields for queries because they are not part of the schema after all
medSchema.virtual("totalStock").get(function () {
  return this.noOfStrip * this.noOfTabletPerStrip;
});
//! Document Middlware ------------------------------------------------------
//! document middleware: 'save' => run before .save() and .create() methods but not on insertmany()

medSchema.pre("save", function (next) {
  //! this-> this will provide access to the currently processed documents
  // console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});

//! Query Middleware----------------------------------------------------------------

medSchema.pre(/^find/, function (next) {
  //? expression start with find will execute here

  this.start = Date.now();
  this.find({ secretMed: { $ne: true } });
  next();
});

//! Aggregation Middleware--------------------------------------------------

medSchema.pre("aggregate", function (next) {
  // this _> will contain current aggregated object
  // console.log(this.pipline())

  this.pipeline().unshift({ $match: { secretMed: { $ne: true } } });
  next();
});

const Medicine = mongoose.model("Medicine", medSchema);

module.exports = Medicine;

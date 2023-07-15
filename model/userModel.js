const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { parse } = require("dotenv");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "User should have a username"],
  },
  email: {
    type: String,
    required: [true, "User should have a email"],
    unique: [true, "this email already exists"],
    lowercase: true,
    validate: {
      validator: validator.isEmail,
      message: "Invalid email address",
    },
  },
  photo: {
    type: String,
    // required: [true,"User should have a photo"]
  },
  password: {
    select: false,
    type: String,
    required: [true, "User should have a password"],
    minlength: 8,
  },
  role: {
    type: String,
    enum: ["admin", "user", "patient", "clinic"],
    default: "user",
  },
  confirmPassword: {
    type: String,
    required: [true, "User should have a confirm password"],
    validate: {
      validator: function (val) {
        return val == this.password; // only work on save and on create
      },
      message: "Password does not match",
    },
  },
  passwordChangeAt: {
    type: Date,
  },

  passwordResetToken: String,
  passwordResetExpire: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre("save", async function (next) {
  //only run this function if password is actually modified
  if (!this.isModified("password")) return next();
  // console.log("this is error")
  this.passwordChangeAt = Date.now() - 2;
  //hash the password with the cost of 12
  this.password = await bcrypt.hash(this.password, 14);

  // removing the confirm password from the database
  this.confirmPassword = undefined;
  next();
});

// remove the user which are not active
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// ? Instance Methods
userSchema.methods.changePasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangeAt) {
    const changeTime = parseInt(this.passwordChangeAt.getTime() / 1000, 10);
    // console.log(changeTime, JWTTimeStamp);
    return JWTTimeStamp < changeTime;
  }
  return false;
};
// this is called the instance method which is associated with each object
userSchema.methods.correctPassword = async function (
  inPassword,
  actualPassword
) {
  return await bcrypt.compare(inPassword, actualPassword);
};

userSchema.methods.createPasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  // console.log(token)
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.passwordResetExpire = Date.now() + 10 * 60 * 1000;
  return token;
};

const User = mongoose.model("User", userSchema);
module.exports = User;

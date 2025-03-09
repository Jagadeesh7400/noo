const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // Added bcrypt import for password hashing
const Schema = mongoose.Schema

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  occupation: {
    type: String,
    default: "",
  },
  location: {
    type: String,
    default: "",
  },
  socialLinks: {
    type: [String],
    default: [],
  },
  profilePhoto: {
    type: String,
    default: "",
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model("User", UserSchema);

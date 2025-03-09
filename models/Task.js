const mongoose = require("mongoose")
const Schema = mongoose.Schema

const TaskSchema = new Schema({
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  important: {
    type: Boolean,
    default: false,
  },
  archived: {
    type: Boolean,
    default: false,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Task", TaskSchema)

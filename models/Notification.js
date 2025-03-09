const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["task_completed", "task_due", "task_reminder", "system"],
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  relatedTask: {
    type: Schema.Types.ObjectId,
    ref: "Task",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add a method to mark notification as read
NotificationSchema.methods.markAsRead = function() {
  this.read = true;
  return this.save();
};


module.exports = mongoose.model("Notification", NotificationSchema)

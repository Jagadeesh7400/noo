const express = require("express")
const router = express.Router()
const Notification = require("../models/Notification")
const auth = require("../middleware/auth")

// Socket.io instance
let io

// Set Socket.io instance
const setSocketIO = (socketIO) => {
  io = socketIO
}

// Get all notifications for a user
router.get("/:userId", auth, async (req, res) => {
  try {
    // Check if the user is authorized to view these notifications
    if (req.params.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ message: "Not authorized" })
    }

    const notifications = await Notification.find({ user: req.params.userId }).sort({ createdAt: -1 })

    res.json(notifications)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Mark notification as read
router.put("/:id/read", auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" })
    }

    // Check if the user is authorized to update this notification
    if (notification.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ message: "Not authorized" })
    }

    notification.read = true
    await notification.save()

    res.json(notification)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Mark all notifications as read for a user
router.put("/read-all/:userId", auth, async (req, res) => {
  try {
    // Check if the user is authorized
    if (req.params.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ message: "Not authorized" })
    }

    await Notification.updateMany({ user: req.params.userId, read: false }, { $set: { read: true } })

    res.json({ message: "All notifications marked as read" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create a notification (internal use)
const createNotification = async (data) => {
  try {
    const notification = new Notification(data)
    await notification.save()

    // Emit socket event to the user
    if (io) {
      io.to(data.user.toString()).emit("notification", notification)
    }

    return notification
  } catch (error) {
    console.error("Error creating notification:", error)
    return null
  }
}

module.exports = {
  router,
  setSocketIO,
  createNotification,
}


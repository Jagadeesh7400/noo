const express = require("express")
const router = express.Router()
const Task = require("../models/Task")
const auth = require("../middleware/auth")
const mongoose = require("mongoose") // Added missing mongoose import

// Get task completion stats for a user
router.get("/task-completion/:userId", auth, async (req, res) => {
  try {
    // Check if the user is authorized to view these stats
    if (req.params.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ message: "Not authorized" })
    }

    const totalTasks = await Task.countDocuments({ user: req.params.userId })
    const completedTasks = await Task.countDocuments({ user: req.params.userId, completed: true })
    const pendingTasks = await Task.countDocuments({ user: req.params.userId, completed: false })

    // Get tasks completed by day for the last 7 days
    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(today.getDate() - 7)

    const tasksByDay = await Task.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(req.params.userId),
          completed: true,
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ])

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      tasksByDay,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get task distribution by status
router.get("/task-distribution/:userId", auth, async (req, res) => {
  try {
    // Check if the user is authorized to view these stats
    if (req.params.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ message: "Not authorized" })
    }

    const completed = await Task.countDocuments({ user: req.params.userId, completed: true })
    const pending = await Task.countDocuments({ user: req.params.userId, completed: false })
    const important = await Task.countDocuments({ user: req.params.userId, important: true })
    const archived = await Task.countDocuments({ user: req.params.userId, archived: true })

    res.json({
      completed,
      pending,
      important,
      archived,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router


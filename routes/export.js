const express = require("express")
const router = express.Router()
const User = require("../models/User")
const Task = require("../models/Task")
const auth = require("../middleware/auth")
const adminAuth = require("../middleware/adminAuth")
const { Parser } = require("json2csv")
const PDFDocument = require("pdfkit")

    // Check if the user is authorized to export data
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Export users as CSV
    router.get("/users/csv", [auth, adminAuth], async (req, res) => {
      try {
        const users = await User.find().select("-password");

    const fields = ["_id", "name", "email", "role", "occupation", "location", "createdAt"]
    const opts = { fields }
    const parser = new Parser(opts)
    const csv = parser.parse(users)

    res.header("Content-Type", "text/csv")
    res.attachment("users.csv")
    return res.send(csv)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Export users as PDF
router.get("/users/pdf", [auth, adminAuth], async (req, res) => {
  try {
    const users = await User.find().select("-password")

        const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf")
        res.setHeader("Content-Disposition", "attachment; filename=users.pdf");

    doc.pipe(res)

    doc.fontSize(16).text("Users Report", { align: "center" })
    doc.moveDown()

    users.forEach((user, index) => {
      doc.fontSize(12).text(`${index + 1}. ${user.name} (${user.email})`)
      doc.fontSize(10).text(`Role: ${user.role}`)
      doc.fontSize(10).text(`Occupation: ${user.occupation || "Not specified"}`)
      doc.fontSize(10).text(`Location: ${user.location || "Not specified"}`)
      doc.fontSize(10).text(`Created: ${new Date(user.createdAt).toLocaleDateString()}`)
      doc.moveDown()
    })

    doc.end()
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Export tasks as CSV
router.get("/tasks/csv", [auth, adminAuth], async (req, res) => {
  try {
        const tasks = await Task.find().populate("user", "name email");

    // Transform tasks for CSV
    const transformedTasks = tasks.map((task) => ({
      _id: task._id,
      title: task.title,
      description: task.description,
      date: task.date,
      time: task.time,
      deadline: new Date(task.deadline).toLocaleString(),
      completed: task.completed ? "Yes" : "No",
      important: task.important ? "Yes" : "No",
      archived: task.archived ? "Yes" : "No",
      userName: task.user.name,
      userEmail: task.user.email,
      createdAt: new Date(task.createdAt).toLocaleString(),
    }))

    const fields = [
      "_id",
      "title",
      "description",
      "date",
      "time",
      "deadline",
      "completed",
      "important",
      "archived",
      "userName",
      "userEmail",
      "createdAt",
    ]
    const opts = { fields }
    const parser = new Parser(opts)
    const csv = parser.parse(transformedTasks)

    res.header("Content-Type", "text/csv")
    res.attachment("tasks.csv")
    return res.send(csv)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Export tasks as PDF
router.get("/tasks/pdf", [auth, adminAuth], async (req, res) => {
  try {
    const tasks = await Task.find().populate("user", "name email")

        const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf")
        res.setHeader("Content-Disposition", "attachment; filename=tasks.pdf");

    doc.pipe(res)

    doc.fontSize(16).text("Tasks Report", { align: "center" })
    doc.moveDown()

    tasks.forEach((task, index) => {
      doc.fontSize(12).text(`${index + 1}. ${task.title}`)
      doc.fontSize(10).text(`Description: ${task.description}`)
      doc.fontSize(10).text(`Deadline: ${task.date} at ${task.time}`)
      doc.fontSize(10).text(`Status: ${task.completed ? "Completed" : "Pending"}`)
      doc.fontSize(10).text(`Assigned to: ${task.user.name} (${task.user.email})`)
      doc.moveDown()
    })

    doc.end()
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router

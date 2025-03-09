const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const auth = require("../middleware/auth");

    // Get all tasks for a user
router.get("/user/:userId", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.params.userId });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

    // Get a specific task by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if the user is authorized to view this task
    if (task.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

    // Create a new task for the user
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, date, time, deadline, user } = req.body;

    // Check for required fields
    if (!title || !description || !date || !time || !deadline) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    // Check if the user is authorized to create a task for this user
    if (user !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ message: "Not authorized" });
    }

    const newTask = new Task({
      title,
      description,
      date,
      time,
      deadline,
      user,
    });

    const task = await newTask.save();
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

    // Update an existing task
router.put("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if the user is authorized to update this task
    if (task.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { title, description, date, time, deadline } = req.body;

    task.title = title || task.title;
    task.description = description || task.description;
    task.date = date || task.date;
    task.time = time || task.time;
    task.deadline = deadline || task.deadline;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

    // Mark a task as completed
router.put("/:id/complete", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if the user is authorized to update this task
    if (task.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ message: "Not authorized" });
    }

    task.completed = true;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

    // Delete a task by ID
router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if the user is authorized to delete this task
    if (task.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ message: "Not authorized" });
    }

    await task.deleteOne();
    res.json({ message: "Task removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Task = require("../models/Task");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const bcrypt = require("bcryptjs"); // Added bcrypt import

// Get dashboard statistics
router.get("/dashboard", [auth, adminAuth], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ completed: true });
    const pendingTasks = await Task.countDocuments({ completed: false });

    res.json({
      totalUsers,
      totalTasks,
      completedTasks,
      pendingTasks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get a list of all users
router.get("/users", [auth, adminAuth], async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get a list of all tasks
router.get("/tasks", [auth, adminAuth], async (req, res) => {
  try {
    const tasks = await Task.find().populate("user", "name email");
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new user (admin access required)
router.post("/users", [auth, adminAuth], async (req, res) => {
  try {
    const { name, email, password, role, occupation, location } = req.body;

    // Check for required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      role: role || "user",
      occupation: occupation || "",
      location: location || "",
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update a user (admin access required)
router.put("/users/:id", [auth, adminAuth], async (req, res) => {
  try {
    const { name, email, role, occupation, location } = req.body;

    // Build user object
    const userFields = {};
    if (name) userFields.name = name;
    if (email) userFields.email = email;
    if (role) userFields.role = role;
    if (occupation) userFields.occupation = occupation;
    if (location) userFields.location = location;

    // Update user
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a user (admin access required)
router.delete("/users/:id", [auth, adminAuth], async (req, res) => {
  try {
    // Find user
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete user's tasks
    await Task.deleteMany({ user: req.params.id });

    // Delete user
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const auth = require("../middleware/auth")
const crypto = require("crypto")
const nodemailer = require("nodemailer")

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex for email validation

// Register a user
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Validate email format
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if user already exists
    let user = await User.findOne({ email })

    if (user) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
    })

    // Hash password
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt)

    await user.save()

    // Create and return JWT token
    const payload = {
      id: user.id,
    }

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" }, (err, token) => {
      if (err) throw err
      res.json({ token })
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Login a user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if user exists
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Create and return JWT token
    const payload = {
      id: user.id,
    }

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" }, (err, token) => {
      if (err) throw err
      res.json({ token })
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    res.json(user)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

router.post("/forgot-password", async (req, res) => {
    // Forgot password
  try {
    const { email } = req.body

    // Find user by email
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Generate a reset token
    if (!user.resetPasswordToken || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    const resetToken = crypto.randomBytes(20).toString("hex")

    // Set the token and expiry on the user model
    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = Date.now() + 3600000 // 1 hour

    await user.save()

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`

    // Setup email transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    // Email options for sending the reset link
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Password Reset",
      html: `
        <p>You requested a password reset</p>
        <p>Click this link to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
      `,
    }

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error)
        return res.status(500).json({ message: "Email could not be sent" })
      }

      res.json({ message: "Email sent" })
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Reset password
router.put("/reset-password/:resetToken", async (req, res) => {
  try {
    const { password } = req.body

    // Find user by reset token and check if token is still valid
    const user = await User.findOne({
      resetPasswordToken: req.params.resetToken,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" })
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt)

    // Clear reset token fields
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined

    await user.save()

    res.json({ message: "Password reset successful" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router

const express = require("express")
const router = express.Router()
const User = require("../models/User")
const auth = require("../middleware/auth")
const multer = require("multer")
const path = require("path")
const fs = require("fs")

// Set up storage for profile photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads/profile"
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    cb(null, `user-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`)
  },
})

// File filter for images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true)
  } else {
    cb(new Error("Not an image! Please upload only images."), false)
  }
}

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB
  },
  fileFilter,
})

// Get user profile
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if the user is authorized to view this profile
    if (req.params.id !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ message: "Not authorized" })
    }

    res.json(user)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get current user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update user profile
router.put("/:id", auth, async (req, res) => {
  try {
    // Check if the user is authorized to update this profile
    if (req.params.id !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ message: "Not authorized" })
    }

    const { name, occupation, location, socialLinks } = req.body

    // Build profile object
    const profileFields = {}
    if (name) profileFields.name = name
    if (occupation) profileFields.occupation = occupation
    if (location) profileFields.location = location
    if (socialLinks) profileFields.socialLinks = socialLinks

    // Update user
    const user = await User.findByIdAndUpdate(req.params.id, { $set: profileFields }, { new: true }).select("-password")

    res.json(user)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Upload profile photo
router.post("/profile-photo", auth, upload.single("profilePhoto"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" })
    }

    const user = await User.findById(req.user.id)

    // Delete old profile photo if exists
    if (user.profilePhoto) {
      const oldPhotoPath = path.join(__dirname, "..", user.profilePhoto)
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath)
      }
    }

    // Update user with new profile photo
    user.profilePhoto = `/uploads/profile/${req.file.filename}`
    await user.save()

    res.json({
      message: "Profile photo uploaded successfully",
      profilePhoto: user.profilePhoto,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router


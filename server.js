require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const path = require("path")
const connectDB = require("./config/db")
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/user")
const taskRoutes = require("./routes/task")
const adminRoutes = require("./routes/admin")
const exportRoutes = require("./routes/export")
const { router: notificationRoutes, setSocketIO } = require("./routes/notification")
const statsRoutes = require("./routes/stats")

// Initialize Express app
const app = express()

// Connect to MongoDB
connectDB()

// Middleware
app.use(express.json())
app.use(cors())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/export", exportRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/stats", statsRoutes)

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"))

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"))
  })
}

const PORT = process.env.PORT || 5000

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Socket.io setup
const io = require("socket.io")(server, {
  cors: {
    origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"],
  },
})

// Pass Socket.io instance to notification routes
setSocketIO(io)

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("New client connected")

  // Register user to a room based on their ID
  socket.on("registerUser", (userId) => {
    socket.join(userId)
    console.log(`User ${userId} registered`)
  })

  socket.on("disconnect", () => {
    console.log("Client disconnected")
  })
})


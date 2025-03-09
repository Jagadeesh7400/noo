"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { useEffect, useState } from "react"

// Auth Pages
import LoginPage from "./pages/login-page"
import SignupPage from "./pages/signup-page"
import ForgotPasswordPage from "./pages/forgot-password-page"

// User Pages
import DashboardPage from "./pages/dashboard-page"
import ProfilePage from "./pages/profile-page"

// Admin Pages
import AdminDashboardPage from "./pages/admin-dashboard-page"
import AdminUsersPage from "./pages/admin-users-page"
import AdminTasksPage from "./pages/admin-tasks-page"

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = "user" }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user") || "{}")

    setIsAuthenticated(!!token)
    setUserRole(user?.role || "")
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  if (requiredRole === "admin" && userRole !== "admin") {
    return <Navigate to="/dashboard" />
  }

  return children
}

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* User Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/:filter"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tasks"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminTasksPage />
            </ProtectedRoute>
          }
        />

        {/* Redirect root to login or dashboard based on auth status */}
        <Route
          path="/"
          element={localStorage.getItem("token") ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  )
}


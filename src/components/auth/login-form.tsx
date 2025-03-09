"use client"

import type React from "react"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, LogIn } from "lucide-react"
import axios from "axios"
import { toast } from "react-hot-toast"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      })

      // Store token in localStorage
      localStorage.setItem("token", response.data.token)

      // Get user info
      const userResponse = await axios.get("http://localhost:5000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${response.data.token}`,
        },
      })

      // Store user info
      localStorage.setItem("user", JSON.stringify(userResponse.data))

      toast.success("Login successful!")

      // Redirect based on role
      if (userResponse.data.role === "admin") {
        navigate("/admin")
      } else {
        navigate("/dashboard")
      }
    } catch (error) {
      toast.error("Invalid credentials")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg">
      <div className="w-full max-w-md p-1 bg-white/10 rounded-2xl backdrop-blur-sm">
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-accent-light">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-accent-light">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-sm font-medium text-accent-light">
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm text-accent hover:text-accent-light transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-secondary hover:bg-secondary-light text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Login</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-accent-light">
              Don't have an account?{" "}
              <Link to="/signup" className="text-white hover:text-accent-light font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


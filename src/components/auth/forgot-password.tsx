"use client"

import type React from "react"

import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Send } from "lucide-react"
import axios from "axios"
import { toast } from "react-hot-toast"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await axios.post("http://localhost:5000/api/auth/forgot-password", { email })
      setIsSubmitted(true)
      toast.success("Password reset link sent to your email")
    } catch (error) {
      toast.error("Failed to send reset link")
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
            <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-accent-light">
              {isSubmitted
                ? "Check your email for reset instructions"
                : "Enter your email to receive a password reset link"}
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-accent-light">
                  Email Address
                </label>
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

              <button
                type="submit"
                className="w-full py-3 px-4 bg-secondary hover:bg-secondary-light text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Send Reset Link</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="bg-white/10 p-6 rounded-lg text-center">
              <p className="text-white mb-4">
                We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the
                instructions.
              </p>
              <p className="text-sm text-accent-light">If you don't see the email, check your spam folder.</p>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="text-white hover:text-accent-light font-medium flex items-center justify-center gap-1"
            >
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


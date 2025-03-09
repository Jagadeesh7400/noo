"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import axios from "axios"
import { toast } from "react-hot-toast"

interface TaskFormProps {
  isOpen: boolean
  onClose: () => void
  taskToEdit?: any
  onTaskAdded?: () => void
  onTaskUpdated?: () => void
}

export default function TaskForm({ isOpen, onClose, taskToEdit, onTaskAdded, onTaskUpdated }: TaskFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || "")
      setDescription(taskToEdit.description || "")

      // Format date for input
      if (taskToEdit.date) {
        const taskDate = new Date(taskToEdit.date)
        setDate(taskDate.toISOString().split("T")[0])
      }

      setTime(taskToEdit.time || "")
    } else {
      // Set default values for new task
      setTitle("")
      setDescription("")
      setDate("")
      setTime("")
    }
  }, [taskToEdit, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      const user = JSON.parse(localStorage.getItem("user") || "{}")

      if (!token || !user.id) {
        toast.error("You must be logged in")
        return
      }

      // Calculate deadline from date and time
      const deadlineDate = new Date(date)
      const [hours, minutes] = time.split(":").map(Number)
      deadlineDate.setHours(hours, minutes)

      const taskData = {
        title,
        description,
        date,
        time,
        deadline: deadlineDate.toISOString(),
        user: user.id,
      }

      if (taskToEdit) {
        // Update existing task
        await axios.put(`http://localhost:5000/api/tasks/${taskToEdit._id}`, taskData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success("Task updated successfully")
        if (onTaskUpdated) onTaskUpdated()
      } else {
        // Create new task
        await axios.post("http://localhost:5000/api/tasks", taskData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success("Task added successfully")
        if (onTaskAdded) onTaskAdded()
      }

      onClose()
    } catch (error) {
      console.error("Error saving task:", error)
      toast.error("Failed to save task")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}></div>

        <div className="glass-card w-full max-w-md z-10 relative">
          <div className="flex justify-between items-center p-5 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">{taskToEdit ? "Edit Task" : "Add New Task"}</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium text-accent-light">
                Task Title
              </label>
              <input
                id="title"
                type="text"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Enter task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-accent-light">
                Description
              </label>
              <textarea
                id="description"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent min-h-[100px] resize-none"
                placeholder="Enter task description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="date" className="block text-sm font-medium text-accent-light">
                  Date
                </label>
                <input
                  id="date"
                  type="date"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="time" className="block text-sm font-medium text-accent-light">
                  Time
                </label>
                <input
                  id="time"
                  type="time"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary-light text-white transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : taskToEdit ? "Update Task" : "Add Task"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}


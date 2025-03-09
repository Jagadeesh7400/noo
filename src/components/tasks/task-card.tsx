"use client"

import { useState, useEffect } from "react"
import { Clock, CheckCircle, Trash, Edit } from "lucide-react"
import TaskCountdown from "./task-countdown"

interface TaskCardProps {
  task: {
    _id: string
    title: string
    description: string
    date: string
    time: string
    deadline: string
    completed: boolean
  }
  onComplete: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (id: string) => void
}

export default function TaskCard({ task, onComplete, onDelete, onEdit }: TaskCardProps) {
  const [showActions, setShowActions] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    // Calculate time remaining
    const deadline = new Date(task.deadline).getTime()
    const now = new Date().getTime()
    const remaining = deadline - now

    setTimeRemaining(remaining)

    // Show notification when task is approaching deadline (10 minutes)
    if (remaining > 0 && remaining < 10 * 60 * 1000 && !task.completed) {
      setShowNotification(true)
    }
  }, [task])

  const handleComplete = () => {
    onComplete(task._id)
    setShowNotification(false)
  }

  // Determine card border color based on status
  const getBorderColor = () => {
    if (task.completed) return "border-green-500"
    if (timeRemaining && timeRemaining < 3600000) return "border-yellow-500"
    return "border-transparent"
  }

  return (
    <div
      className={`glass-card overflow-hidden transition-all duration-300 hover:shadow-xl ${getBorderColor()} border-l-4`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className={`text-lg font-medium text-white ${task.completed ? "line-through opacity-70" : ""}`}>
            {task.title}
          </h3>
          {showActions && (
            <div className="flex space-x-2">
              {!task.completed && (
                <button
                  onClick={() => handleComplete()}
                  className="p-1.5 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                  title="Mark as completed"
                >
                  <CheckCircle size={16} />
                </button>
              )}
              <button
                onClick={() => onEdit(task._id)}
                className="p-1.5 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                title="Edit task"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => onDelete(task._id)}
                className="p-1.5 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                title="Delete task"
              >
                <Trash size={16} />
              </button>
            </div>
          )}
        </div>

        <p className="mt-2 text-accent-light text-sm">{task.description}</p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center text-xs text-accent">
            <Clock size={14} className="mr-1" />
            <span>
              {new Date(task.date).toLocaleDateString()} at {task.time}
            </span>
          </div>

          {!task.completed && timeRemaining && timeRemaining > 0 && <TaskCountdown deadline={task.deadline} />}

          {task.completed && (
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Completed</span>
          )}

          {!task.completed && timeRemaining && timeRemaining <= 0 && (
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">Overdue</span>
          )}
        </div>
      </div>

      {showNotification && (
        <div className="bg-yellow-500/20 p-3 border-t border-yellow-500/30 flex items-center justify-between">
          <p className="text-sm text-yellow-300">This task is due soon! Would you like to mark it as completed?</p>
          <div className="flex space-x-2">
            <button onClick={handleComplete} className="px-2 py-1 text-xs bg-green-500 text-white rounded">
              Complete
            </button>
            <button
              onClick={() => setShowNotification(false)}
              className="px-2 py-1 text-xs bg-white/20 text-white rounded"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


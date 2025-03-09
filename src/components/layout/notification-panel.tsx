"use client"

import { useState, useEffect } from "react"
import { X, Bell, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import axios from "axios"

interface Notification {
  id: string
  message: string
  type: "task_completed" | "task_due" | "task_reminder"
  createdAt: string
  read: boolean
}

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      // Get user ID from localStorage
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      const token = localStorage.getItem("token")

      if (user.id && token) {
        const response = await axios.get(`http://localhost:5000/api/notifications/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setNotifications(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error)
      // For demo purposes, add some sample notifications
      setNotifications([
        {
          id: "1",
          message: 'Task "Update website content" is due in 30 minutes',
          type: "task_due",
          createdAt: new Date().toISOString(),
          read: false,
        },
        {
          id: "2",
          message: 'Task "Design new logo" has been completed',
          type: "task_completed",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          read: true,
        },
        {
          id: "3",
          message: 'Reminder: "Review project timelines" is scheduled for tomorrow',
          type: "task_reminder",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          read: false,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      // Update in backend
      // await axios.put(`http://localhost:5000/api/notifications/${id}/read`)

      // Update locally
      setNotifications(notifications.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
    } catch (error) {
      console.error("Failed to mark notification as read", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task_completed":
        return <CheckCircle size={18} className="text-green-400" />
      case "task_due":
        return <AlertTriangle size={18} className="text-yellow-400" />
      case "task_reminder":
        return <Clock size={18} className="text-blue-400" />
      default:
        return <Bell size={18} className="text-gray-400" />
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm" onClick={onClose}></div>
      <div className="absolute right-0 top-0 bottom-0 w-80 sm:w-96 glass-card transform transition-transform duration-300">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Notifications</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto h-full pb-20">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-white/70">
              <Bell size={24} />
              <p className="mt-2">No notifications</p>
            </div>
          ) : (
            <ul>
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`p-4 border-b border-white/10 hover:bg-white/5 ${notification.read ? "opacity-70" : ""}`}
                >
                  <div className="flex">
                    <div className="mr-3 mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1">
                      <p className={`text-sm ${notification.read ? "text-white/70" : "text-white font-medium"}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-white/50">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-accent hover:text-accent-light"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}


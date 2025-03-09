"use client"

import { useState, useEffect } from "react"
import { Bell, Search, User } from "lucide-react"
import { Link } from "react-router-dom"

interface HeaderProps {
  onToggleNotifications: () => void
}

export default function Header({ onToggleNotifications }: HeaderProps) {
  const [user, setUser] = useState<any>(null)
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    // Simulate fetching notification count
    setNotificationCount(3)
  }, [])

  return (
    <header className="bg-white/5 backdrop-blur-sm py-3 px-6 border-b border-white/10">
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" size={18} />
        </div>

        <div className="flex items-center space-x-4">
          <button
            className="relative p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            onClick={onToggleNotifications}
          >
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>

          <div className="flex items-center">
            {user?.profilePhoto ? (
              <img
                src={user.profilePhoto || "/placeholder.svg"}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-white border-2 border-white/20">
                <User size={16} />
              </div>
            )}

            <div className="ml-3">
              <Link to="/profile" className="text-sm font-medium text-white hover:text-accent-light transition-colors">
                {user?.name || "User"}
              </Link>
              <p className="text-xs text-accent">{user?.occupation || "Zidio User"}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}


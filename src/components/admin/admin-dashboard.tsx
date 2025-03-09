"use client"

import { useState, useEffect } from "react"
import { Users, CheckSquare, Clock, BarChart2 } from "lucide-react"
import axios from "axios"
import { toast } from "react-hot-toast"

interface DashboardStats {
  totalUsers: number
  totalTasks: number
  completedTasks: number
  pendingTasks: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        toast.error("You must be logged in")
        return
      }

      const response = await axios.get("http://localhost:5000/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      })

      setStats(response.data)
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      toast.error("Failed to load dashboard data")

      // For demo purposes, set sample stats
      setStats({
        totalUsers: 15,
        totalTasks: 48,
        completedTasks: 32,
        pendingTasks: 16,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <Users size={24} className="text-accent" />,
      bgColor: "bg-primary-dark/30",
      textColor: "text-white",
    },
    {
      title: "Total Tasks",
      value: stats.totalTasks,
      icon: <BarChart2 size={24} className="text-accent" />,
      bgColor: "bg-primary/30",
      textColor: "text-white",
    },
    {
      title: "Completed Tasks",
      value: stats.completedTasks,
      icon: <CheckSquare size={24} className="text-green-400" />,
      bgColor: "bg-green-500/20",
      textColor: "text-white",
    },
    {
      title: "Pending Tasks",
      value: stats.pendingTasks,
      icon: <Clock size={24} className="text-yellow-400" />,
      bgColor: "bg-yellow-500/20",
      textColor: "text-white",
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((card, index) => (
              <div key={index} className={`glass-card ${card.bgColor} p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-accent-light">{card.title}</p>
                    <h3 className={`text-3xl font-bold mt-2 ${card.textColor}`}>{card.value}</h3>
                  </div>
                  <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm">{card.icon}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Task Completion Rate</h2>
              <div className="h-64 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full flex items-center justify-center bg-white/10 relative">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(#00B4D8 ${(stats.completedTasks / stats.totalTasks) * 100}%, #1e293b 0)`,
                      clipPath: "circle(50% at 50% 50%)",
                    }}
                  ></div>
                  <div className="w-36 h-36 rounded-full bg-primary-dark/50 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">
                        {Math.round((stats.completedTasks / stats.totalTasks) * 100)}%
                      </p>
                      <p className="text-sm text-accent-light">Completion Rate</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3 pb-4 border-b border-white/10">
                  <div className="p-2 rounded-full bg-green-500/20">
                    <CheckSquare size={16} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Task Completed</p>
                    <p className="text-xs text-accent-light">User completed "Design new logo" task</p>
                    <p className="text-xs text-white/50 mt-1">2 hours ago</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3 pb-4 border-b border-white/10">
                  <div className="p-2 rounded-full bg-blue-500/20">
                    <Users size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">New User</p>
                    <p className="text-xs text-accent-light">Sarah Johnson joined the platform</p>
                    <p className="text-xs text-white/50 mt-1">5 hours ago</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="p-2 rounded-full bg-yellow-500/20">
                    <Clock size={16} className="text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Task Due Soon</p>
                    <p className="text-xs text-accent-light">3 tasks are due in the next 24 hours</p>
                    <p className="text-xs text-white/50 mt-1">1 day ago</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  )
}


"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  CheckSquare,
  Clock,
  ListTodo,
  Award,
  Archive,
  PlusCircle,
  BarChart,
  User,
  LogOut,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

interface SidebarProps {
  userRole?: string
}

export default function Sidebar({ userRole = "user" }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  const userMenuItems = [
    { path: "/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { path: "/tasks/completed", icon: <CheckSquare size={20} />, label: "Completed Tasks" },
    { path: "/tasks/pending", icon: <Clock size={20} />, label: "Pending Tasks" },
    { path: "/tasks/in-progress", icon: <ListTodo size={20} />, label: "In Progress Tasks" },
    { path: "/tasks/important", icon: <Award size={20} />, label: "Important Tasks" },
    { path: "/tasks/archived", icon: <Archive size={20} />, label: "Archived Tasks" },
    { path: "/tasks/add", icon: <PlusCircle size={20} />, label: "Add New Task" },
  ]

  const adminMenuItems = [
    { path: "/admin", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { path: "/admin/users", icon: <User size={20} />, label: "User Management" },
    { path: "/admin/tasks", icon: <ListTodo size={20} />, label: "Task Monitoring" },
    { path: "/admin/analytics", icon: <BarChart size={20} />, label: "Analytics" },
  ]

  const menuItems = userRole === "admin" ? adminMenuItems : userMenuItems

  return (
    <div
      className={`bg-primary-dark h-screen ${collapsed ? "w-20" : "w-64"} transition-all duration-300 flex flex-col`}
    >
      <div className="p-4 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center">
            <span className="text-xl font-bold text-white">Zidio</span>
            <span className="ml-2 text-xs bg-secondary px-2 py-0.5 rounded">Task Manager</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-full hover:bg-primary-medium text-white/70"
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="mt-6">
          <ul className="space-y-2 px-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`nav-item ${isActive(item.path) ? "nav-item-active" : "nav-item-inactive"}`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="p-4 border-t border-primary-medium">
        <Link to="/profile" className="nav-item nav-item-inactive mb-2">
          <span className="mr-3">
            <User size={20} />
          </span>
          {!collapsed && <span>Profile</span>}
        </Link>
        <button onClick={handleLogout} className="nav-item nav-item-inactive w-full">
          <span className="mr-3">
            <LogOut size={20} />
          </span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  )
}


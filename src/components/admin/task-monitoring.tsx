"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Download, FileText, RefreshCw, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import axios from "axios"
import { toast } from "react-hot-toast"

interface Task {
  _id: string
  title: string
  description: string
  date: string
  time: string
  deadline: string
  completed: boolean
  user: {
    _id: string
    name: string
    email: string
  }
}

export default function TaskMonitoring() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending">("all")

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        toast.error("You must be logged in as admin")
        return
      }

      const response = await axios.get("http://localhost:5000/api/admin/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      })

      setTasks(response.data)
    } catch (error) {
      console.error("Error fetching tasks:", error)
      toast.error("Failed to load tasks")

      // For demo purposes, set sample tasks
      setTasks([
        {
          _id: "task1",
          title: "Implement user authentication",
          description: "Add user authentication functionality to the website",
          date: "2023-09-15",
          time: "10:00",
          deadline: "2023-09-15T10:00:00.000Z",
          completed: true,
          user: {
            _id: "user1",
            name: "John Doe",
            email: "john@example.com",
          },
        },
        {
          _id: "task2",
          title: "Update website content",
          description: "Update the About Us page with new team members",
          date: "2023-09-20",
          time: "14:00",
          deadline: "2023-09-20T14:00:00.000Z",
          completed: false,
          user: {
            _id: "user2",
            name: "Jane Smith",
            email: "jane@example.com",
          },
        },
        {
          _id: "task3",
          title: "Design new logo",
          description: "Create a new logo for the company rebranding",
          date: "2023-09-25",
          time: "09:00",
          deadline: "2023-09-25T09:00:00.000Z",
          completed: false,
          user: {
            _id: "user1",
            name: "John Doe",
            email: "john@example.com",
          },
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = (format: "csv" | "pdf") => {
    const token = localStorage.getItem("token")

    if (!token) {
      toast.error("You must be logged in as admin")
      return
    }

    window.open(`http://localhost:5000/api/export/tasks/${format}?token=${token}`, "_blank")
  }

  const getTaskStatus = (task: Task) => {
    if (task.completed) return "completed"

    const deadline = new Date(task.deadline).getTime()
    const now = new Date().getTime()

    if (deadline < now) return "overdue"
    if (deadline - now < 24 * 60 * 60 * 1000) return "due-soon"
    return "pending"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            <CheckCircle size={12} className="mr-1" />
            Completed
          </span>
        )
      case "overdue":
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
            <AlertTriangle size={12} className="mr-1" />
            Overdue
          </span>
        )
      case "due-soon":
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
            <Clock size={12} className="mr-1" />
            Due Soon
          </span>
        )
      default:
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
            <Clock size={12} className="mr-1" />
            Pending
          </span>
        )
    }
  }

  const filteredTasks = tasks.filter((task) => {
    // Apply search filter
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.user.email.toLowerCase().includes(searchTerm.toLowerCase())

    // Apply status filter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "completed" && task.completed) ||
      (statusFilter === "pending" && !task.completed)

    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Task Monitoring</h1>

        <div className="flex flex-wrap gap-3">
          <div className="dropdown relative">
            <button className="btn btn-outline flex items-center gap-2">
              <Download size={18} />
              <span>Export</span>
            </button>
            <div className="dropdown-menu absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden">
              <button
                onClick={() => handleExport("csv")}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
              >
                <FileText size={16} className="mr-2" />
                <span>Export as CSV</span>
              </button>
              <button
                onClick={() => handleExport("pdf")}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
              >
                <FileText size={16} className="mr-2" />
                <span>Export as PDF</span>
              </button>
            </div>
          </div>

          <button onClick={fetchTasks} className="btn btn-outline flex items-center gap-2" title="Refresh task list">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>

          <div className="flex items-center">
            <Filter size={18} className="text-gray-400 mr-2" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "completed" | "pending")}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Tasks</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-6 text-center">
            <Clock size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No tasks found</h3>
            <p className="text-gray-500">
              {searchTerm ? `No tasks match "${searchTerm}"` : "There are no tasks in the system yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <tr key={task._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{task.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">{task.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{task.user.name}</div>
                      <div className="text-sm text-gray-500">{task.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(task.deadline).toLocaleDateString()}</div>
                      <div className="text-sm text-gray-500">{task.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(getTaskStatus(task))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}


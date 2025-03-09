"use client"

import { useState, useEffect } from "react"
import { User, Search, Edit, Trash, UserPlus, Download, FileText, RefreshCw } from "lucide-react"
import axios from "axios"
import { toast } from "react-hot-toast"

interface UserData {
  _id: string
  name: string
  email: string
  occupation: string
  location: string
  role: string
  profilePhoto?: string
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [isUserFormOpen, setIsUserFormOpen] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        toast.error("You must be logged in as admin")
        return
      }

      const response = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      })

      setUsers(response.data)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Failed to load users")

      // For demo purposes, set sample users
      setUsers([
        {
          _id: "user1",
          name: "John Doe",
          email: "john@example.com",
          occupation: "Web Developer",
          location: "New York, USA",
          role: "user",
        },
        {
          _id: "user2",
          name: "Jane Smith",
          email: "jane@example.com",
          occupation: "UI Designer",
          location: "San Francisco, USA",
          role: "user",
        },
        {
          _id: "user3",
          name: "Admin User",
          email: "admin@example.com",
          occupation: "System Administrator",
          location: "Chicago, USA",
          role: "admin",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        toast.error("You must be logged in as admin")
        return
      }

      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Update local state
      setUsers(users.filter((user) => user._id !== id))

      toast.success("User deleted successfully")
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Failed to delete user")
    }
  }

  const handleEditUser = (user: UserData) => {
    setSelectedUser(user)
    setIsUserFormOpen(true)
  }

  const handleAddUser = () => {
    setSelectedUser(null)
    setIsUserFormOpen(true)
  }

  const handleExport = (format: "csv" | "pdf") => {
    const token = localStorage.getItem("token")

    if (!token) {
      toast.error("You must be logged in as admin")
      return
    }

    window.open(`http://localhost:5000/api/export/users/${format}?token=${token}`, "_blank")
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.occupation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">User Management</h1>

        <div className="flex flex-wrap gap-3">
          <button onClick={handleAddUser} className="btn btn-primary flex items-center gap-2">
            <UserPlus size={18} />
            <span>Add User</span>
          </button>

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

          <button onClick={fetchUsers} className="btn btn-outline flex items-center gap-2" title="Refresh user list">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-6 text-center">
            <User size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No users found</h3>
            <p className="text-gray-500">
              {searchTerm ? `No users match "${searchTerm}"` : "There are no users in the system yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.profilePhoto ? (
                            <img
                              src={user.profilePhoto || "/placeholder.svg"}
                              alt={user.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-primary-light flex items-center justify-center text-white">
                              <User size={20} />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.occupation || "Not specified"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.location || "Not specified"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEditUser(user)} className="text-blue-600 hover:text-blue-900 mr-3">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDeleteUser(user._id)} className="text-red-600 hover:text-red-900">
                        <Trash size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Form Modal would go here */}
    </div>
  )
}


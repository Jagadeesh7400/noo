"use client"

import { useState } from "react"
import Sidebar from "../components/layout/sidebar"
import Header from "../components/layout/header"
import UserManagement from "../components/admin/user-management"
import NotificationPanel from "../components/layout/notification-panel"

export default function AdminUsersPage() {
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false)

  return (
    <div className="flex h-screen bg-accent-lighter">
      <Sidebar userRole="admin" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleNotifications={() => setIsNotificationPanelOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <UserManagement />
        </main>

        <NotificationPanel isOpen={isNotificationPanelOpen} onClose={() => setIsNotificationPanelOpen(false)} />
      </div>
    </div>
  )
}


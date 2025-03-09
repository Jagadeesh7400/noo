"use client"

import { useState } from "react"
import Sidebar from "../components/layout/sidebar"
import Header from "../components/layout/header"
import TaskList from "../components/tasks/task-list"
import NotificationPanel from "../components/layout/notification-panel"

export default function DashboardPage() {
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false)

  return (
    <div className="flex h-screen gradient-bg">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleNotifications={() => setIsNotificationPanelOpen(true)} />

        <main className="flex-1 overflow-y-auto p-6">
          <TaskList />
        </main>

        <NotificationPanel isOpen={isNotificationPanelOpen} onClose={() => setIsNotificationPanelOpen(false)} />
      </div>
    </div>
  )
}


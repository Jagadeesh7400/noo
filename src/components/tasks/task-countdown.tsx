"use client"

import { useState, useEffect } from "react"

interface TaskCountdownProps {
  deadline: string
}

export default function TaskCountdown({ deadline }: TaskCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  function calculateTimeLeft() {
    const diff = new Date(deadline).getTime() - new Date().getTime()

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [deadline])

  // Determine color based on time left
  const getColorClass = () => {
    const totalMinutes = timeLeft.days * 24 * 60 + timeLeft.hours * 60 + timeLeft.minutes

    if (totalMinutes <= 10) return "bg-red-500/20 text-red-400" // Less than 10 minutes
    if (totalMinutes <= 60) return "bg-yellow-500/20 text-yellow-400" // Less than 1 hour
    return "bg-blue-500/20 text-blue-400" // More than 1 hour
  }

  const formatTimeUnit = (value: number, unit: string) => {
    if (value === 0) return ""
    return `${value}${unit} `
  }

  return (
    <div className={`px-2 py-1 rounded-full text-xs ${getColorClass()}`}>
      {timeLeft.days > 0 && formatTimeUnit(timeLeft.days, "d")}
      {timeLeft.hours > 0 && formatTimeUnit(timeLeft.hours, "h")}
      {formatTimeUnit(timeLeft.minutes, "m")}
      {formatTimeUnit(timeLeft.seconds, "s")}
      left
    </div>
  )
}


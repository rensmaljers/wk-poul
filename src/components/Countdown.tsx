'use client'

import { useState, useEffect } from 'react'

export default function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft())
  const [mounted, setMounted] = useState(false)

  function getTimeLeft() {
    const diff = new Date(targetDate).getTime() - Date.now()
    if (diff <= 0) return null
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    }
  }

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!mounted || !timeLeft) return null

  return (
    <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-5 mb-6 text-white">
      <p className="text-sm font-medium text-orange-100 mb-3">Aftellen naar de eerste wedstrijd</p>
      <div className="flex gap-3 sm:gap-5">
        {[
          { value: timeLeft.days, label: 'dagen' },
          { value: timeLeft.hours, label: 'uur' },
          { value: timeLeft.minutes, label: 'min' },
          { value: timeLeft.seconds, label: 'sec' },
        ].map(({ value, label }) => (
          <div key={label} className="text-center">
            <div className="text-2xl sm:text-4xl font-bold tabular-nums">
              {String(value).padStart(2, '0')}
            </div>
            <div className="text-[10px] sm:text-xs text-orange-200 uppercase tracking-wider mt-0.5">
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

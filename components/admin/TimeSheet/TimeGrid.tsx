'use client'

import { useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { DepartmentSchedule } from '@prisma/client'
import { motion, AnimatePresence } from 'framer-motion'

interface TimeGridProps {
  shifts: Array<{
    dayOfWeek: number
    startTime: Date
    endTime: Date
    isRecurring: boolean
  }>
  onChange: (shifts: Array<{
    dayOfWeek: number
    startTime: Date
    endTime: Date
    isRecurring: boolean
  }>) => void
  disabled?: boolean
  existingSchedule?: DepartmentSchedule | null
}

export function TimeGrid({ shifts, onChange, existingSchedule,disabled = false }: TimeGridProps) {
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionStart, setSelectionStart] = useState<{ day: number; hour: number } | null>(null)
  const [selectionEnd, setSelectionEnd] = useState<{ day: number; hour: number } | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const hours = Array.from({ length: 24 }, (_, i) => i)

  const handleMouseDown = (day: number, hour: number) => {
    if (disabled) return
    setIsSelecting(true)
    setSelectionStart({ day, hour })
    setSelectionEnd({ day, hour })
  }

  const handleMouseMove = (day: number, hour: number) => {
    if (!isSelecting || disabled) return
    setSelectionEnd({ day, hour })
  }

  const handleMouseUp = () => {
    if (!isSelecting || !selectionStart || !selectionEnd || disabled) return
    
    const newShift = {
      dayOfWeek: selectionStart.day,
      startTime: new Date(2024, 0, 1, selectionStart.hour),
      endTime: new Date(2024, 0, 1, selectionEnd.hour + 1),
      isRecurring: false
    }

    onChange([...shifts, newShift])
    setIsSelecting(false)
    setSelectionStart(null)
    setSelectionEnd(null)
  }

  const isSelected = (day: number, hour: number) => {
    if (isSelecting && selectionStart && selectionEnd) {
      const minDay = Math.min(selectionStart.day, selectionEnd.day)
      const maxDay = Math.max(selectionStart.day, selectionEnd.day)
      const minHour = Math.min(selectionStart.hour, selectionEnd.hour)
      const maxHour = Math.max(selectionStart.hour, selectionEnd.hour)

      return day >= minDay && day <= maxDay && hour >= minHour && hour <= maxHour
    }

    return shifts.some(shift => 
      shift.dayOfWeek === day && 
      hour >= shift.startTime.getHours() && 
      hour < shift.endTime.getHours()
    )
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsSelecting(false)
    }

    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [])

  return (
    <div className="select-none space-y-4">
       {existingSchedule && (
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-medium">Current Schedule</h3>
          <p className="text-sm text-muted-foreground">
            Week of {format(new Date(existingSchedule.weekStart), 'MMM d')} - 
            {format(new Date(existingSchedule.weekEnd), 'MMM d, yyyy')}
          </p>
        </div>
      )}
      <div className="grid grid-cols-[auto,repeat(7,1fr)] border rounded-lg overflow-hidden" ref={gridRef}>
        {/* Time labels column */}
        <div className="bg-muted">
          <div className="h-12 border-b" /> {/* Corner spacer */}
          {hours.map(hour => (
            <div key={hour} className="h-12 flex items-center justify-end px-2 text-sm border-b">
              {format(new Date().setHours(hour), 'ha')}
            </div>
          ))}
        </div>

        {/* Days columns */}
        {days.map((day, dayIndex) => (
          <div key={day} className="min-w-[100px]">
            <div className="h-12 border-b border-l p-2 font-medium text-center">
              {day}
            </div>
            {hours.map(hour => (
              <div
                key={hour}
                className={`h-12 border-b border-l transition-colors ${
                  isSelected(dayIndex, hour)
                    ? 'bg-primary/20'
                    : 'hover:bg-muted/50'
                } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                onMouseDown={() => handleMouseDown(dayIndex, hour)}
                onMouseMove={() => handleMouseMove(dayIndex, hour)}
                onMouseUp={handleMouseUp}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function GlowingDot() {
  return (
    <div className="relative w-2 h-2 mr-2">
      <div className="absolute w-full h-full bg-green-500 rounded-full animate-ping opacity-75"></div>
      <div className="relative w-full h-full bg-green-500 rounded-full"></div>
    </div>
  )
}

export function AnimatedValue({ value }: { value: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  )
}
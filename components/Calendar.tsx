'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useTimeEntry } from '@/_context/TimeEntryContext'

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type CalendarDay = {
  date: number
  isCurrentMonth: boolean
  isToday: boolean
  status?: 'company-open' | 'employee-leave' | 'holiday'
}

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const { recentEntries } = useTimeEntry()
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null)
  console.log(selectedDay)

  const getDaysInMonth = (year: number, month: number) => {

    return new Date(year, month + 1, 0).getDate()
  }

  const getCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = getDaysInMonth(year, month)
    const daysInPrevMonth = getDaysInMonth(year, month - 1)

    const calendarDays: CalendarDay[] = []

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      calendarDays.push({
        date: daysInPrevMonth - i,
        isCurrentMonth: false,
        isToday: false,
      })
    }

    // Current month days
    const today = new Date()
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push({
        date: i,
        isCurrentMonth: true,
        isToday: 
          i === today.getDate() && 
          month === today.getMonth() && 
          year === today.getFullYear(),
        status: i % 7 === 0 ? 'company-open' : 
                i % 7 === 1 ? 'employee-leave' : 
                i % 7 === 2 ? 'holiday' : undefined,
      })
    }

    // Next month days
    const remainingDays = 42 - calendarDays.length
    for (let i = 1; i <= remainingDays; i++) {
      calendarDays.push({
        date: i,
        isCurrentMonth: false,
        isToday: false,
      })
    }

    return calendarDays
  }

  const changeMonth = (increment: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1))
  }

  const handleDayClick = (day: CalendarDay) => {
    setSelectedDay(day)
  }

  const getHoursWorked = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0]
    const entries = recentEntries.filter(entry => entry.clockIn.toISOString().split('T')[0] === date)
    return entries.reduce((total, entry) => total + Number(entry.hours), 0)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => changeMonth(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center">
          {daysOfWeek.map(day => (
            <div key={day} className="text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
          {getCalendarDays().map((day, index) => (
            <Dialog key={index}>
              <DialogTrigger asChild>
                <div 
                  className={`p-1 text-sm cursor-pointer ${
                    day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  } ${
                    day.isToday ? 'bg-primary text-white rounded-full' : ''
                  } ${
                    day.status === 'company-open' ? 'bg-green-100' :
                    day.status === 'employee-leave' ? 'bg-blue-100' :
                    day.status === 'holiday' ? 'bg-red-100' : ''
                  }`}
                  onClick={() => handleDayClick(day)}
                >
                  {day.date}
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{new Date(currentDate.getFullYear(), currentDate.getMonth(), day.date).toDateString()}</DialogTitle>
                  <DialogDescription>
                    {day.isCurrentMonth && new Date(currentDate.getFullYear(), currentDate.getMonth(), day.date) > new Date() ? (
                      <Button className="mt-2" style={{backgroundColor: 'rgb(254, 159, 43)'}}>Request Time Off</Button>
                    ) : (
                      <p>Hours worked: {getHoursWorked(day.date).toFixed(2)}</p>
                    )}
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          ))}
        </div>
        <div className="mt-2 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-100 mr-1"></div>
            <span>Company Open</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-100 mr-1"></div>
            <span>Employee Leave</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-100 mr-1"></div>
            <span>Holiday</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


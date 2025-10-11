'use client'

import { Department, TimeEntry, TimeEntryStatus } from '@prisma/client'
import React, { createContext, useContext, useState, useEffect } from 'react'
import Decimal from 'decimal.js'

type TimeEntryContextType = {
  currentEntry: TimeEntry | null
  recentEntries: TimeEntry[]
  clockIn: (newEntry: TimeEntry) => void
  clockOut: (timeEntryId: string) => void
  addEntry: (entry: TimeEntry) => void
  departments: Department[]
  departmentMap: { [key: string]: Department }
  loading: boolean
  setLoading: (loading: boolean) => void
  permittedDepartments: Department[]
  permittedDepartmentsMap: { [key: string]: Department }
  submitAllForApproval: () => void
}

const TimeEntryContext = createContext<TimeEntryContextType | undefined>(undefined)

export function TimeEntryProvider({ children,
  currentEntry: currentEntryProp,
  recentEntries: recentEntriesProp,
  departments: departmentsProp,
  permittedDepartments: permittedDepartmentsProp
}: {
    children: React.ReactNode,
    permittedDepartments: Department[],
    currentEntry: TimeEntry | null,
    recentEntries: TimeEntry[],
    departments: Department[]
  }) {
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(currentEntryProp)
  const [recentEntries, setRecentEntries] = useState<TimeEntry[]>(recentEntriesProp)
  const [departments, setDepartments] = useState<Department[]>(departmentsProp)
  const [departmentMap, setDepartmentMap] = useState<{ [key: string]: Department }>({})
  const [loading, setLoading] = useState(false)
  const [permittedDepartments, setPermittedDepartments] = useState<Department[]>(permittedDepartmentsProp)
  const [permittedDepartmentsMap, setPermittedDepartmentsMap] = useState<{ [key: string]: Department }>({});

  useEffect(() => {
    setLoading(true)
    setDepartmentMap(departmentsProp.reduce((acc, dept) => {
      return { ...acc, [dept.id]: dept }
    }, {}))
    setLoading(false)
  }, [departmentsProp])

  useEffect(() => {
    setLoading(true)
    setPermittedDepartmentsMap(permittedDepartmentsProp.reduce((acc, dept) => {
      return { ...acc, [dept.id]: dept }
    }, {}))
    setLoading(false)
  }, [permittedDepartmentsProp])

  const clockIn = async (newEntry: TimeEntry) => {
    setCurrentEntry(newEntry)
    addEntry(newEntry)
  }

  const clockOut = async (timeEntryId: string) => {

    setLoading(true)
    if (currentEntry) {
      const clockOutTime = new Date()
      const clockInTime = new Date(currentEntry.clockIn)
      const hours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60)
      const completedEntry = {
        ...currentEntry,
        clockOut: clockOutTime,
        hours: new Decimal(hours.toFixed(2)),
      }

      setRecentEntries(prev => prev.map(entry => 
        entry.id === timeEntryId ? completedEntry : entry
      ))
      setCurrentEntry(null)
    }
    setLoading(false)
  }


  const addEntry = (entry: TimeEntry) => {
    setRecentEntries([entry, ...recentEntries])
  }

  const submitAllForApproval = async () => {
    setRecentEntries(recentEntries.map(entry => {
      if (entry.status === TimeEntryStatus.NOTSUBMITTED) {
        return { ...entry, status: TimeEntryStatus.PENDING }
      }
      return entry
    }
    ))
  }
  return (
    <TimeEntryContext.Provider value={{ currentEntry, recentEntries, clockIn, clockOut,submitAllForApproval, permittedDepartmentsMap, addEntry, permittedDepartments, loading, setLoading, departments, departmentMap }}>
      {children}
    </TimeEntryContext.Provider>
  )
}

export function useTimeEntry() {
  const context = useContext(TimeEntryContext)
  if (context === undefined) {
    throw new Error('useTimeEntry must be used within a TimeEntryProvider')
  }
  return context
}
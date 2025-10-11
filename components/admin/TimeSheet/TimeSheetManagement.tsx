'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns'
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import { Department, EmployeeDepartment, TimeEntry, TimeEntryStatus } from '@prisma/client'
import {
  getWeeklyReport,
  approveTimeEntry,
  discardTimeEntry,
  approvalAllByDepartment
} from '@/actions/time-entry'
import { useTimeEntry } from '@/_context/TimeEntryContext'
import { TimeEntryTable } from './TimeEntryTable'

interface TimeSheetManagementProps {
  userId: string
  employeeDepartments: EmployeeDepartment[]
}

export default function TimeSheetManagement({ userId, employeeDepartments : _e }: TimeSheetManagementProps) {
  const { departmentMap, permittedDepartments, permittedDepartmentsMap } = useTimeEntry();
  const [employeeDepartments,] = useState<EmployeeDepartment[]>(_e.filter(e => permittedDepartmentsMap[e.departmentId]));

  const [selectedDepartment, setSelectedDepartment] = useState<string>(
    employeeDepartments[0]?.departmentId  ?? ''
  )
  const [entriesByDepartment, setEntriesByDepartment] = useState<Record<string, TimeEntry[]>>({})
  const [loading, setLoading] = useState(true)
  const [currentWeek, setCurrentWeek] = useState(new Date())
  
  const { toast } = useToast()


  const canApproveTimeEntries = (departmentId: string) => {
   
    return permittedDepartments.some(department => department.id === departmentId)

  }



  useEffect(() => {
    const fetchWeeklyReportForDepartment = async (departmentId: string) => {
      setLoading(true)
      const response = await getWeeklyReport(userId, departmentId)
      if (response.data) {
        setEntriesByDepartment(prev => ({
          ...prev,
          [departmentId]: response.data
        }))
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.error
        })
      }
      setLoading(false)
    }

    employeeDepartments.forEach(({ departmentId }) => {
      fetchWeeklyReportForDepartment(departmentId)
    })
  }, [currentWeek, employeeDepartments,userId])

  const handleApproveEntry = async (timeEntryId: string) => {
    if (!canApproveTimeEntries(selectedDepartment)) {
      toast({
        variant: 'destructive',
        title: 'Permission Denied',
        description: 'You do not have permission to approve entries in this department'
      })
      return
    }

    setLoading(true)
    const response = await approveTimeEntry(userId, timeEntryId)

    if (response.data) {
      setEntriesByDepartment(prev => ({
        ...prev,
        [selectedDepartment]: prev[selectedDepartment].map(entry =>
          entry.id === timeEntryId
            ? { ...entry, status: TimeEntryStatus.APPROVED }
            : entry
        )
      }))

      toast({
        title: 'Success',
        description: response.success
      })
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: response.error
      })
    }
    setLoading(false)
  }

  const handleDiscardEntry = async (timeEntryId: string) => {
    if (!canApproveTimeEntries(selectedDepartment)) {
      toast({
        variant: 'destructive',
        title: 'Permission Denied',
        description: 'You do not have permission to reject entries in this department'
      })
      return
    }

    setLoading(true)
    const response = await discardTimeEntry(userId, timeEntryId)

    if (response.data) {
      setEntriesByDepartment(prev => ({
        ...prev,
        [selectedDepartment]: prev[selectedDepartment].map(entry =>
          entry.id === timeEntryId
            ? { ...entry, status: TimeEntryStatus.REJECTED }
            : entry
        )
      }))

      toast({
        title: 'Success',
        description: response.success
      })
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: response.error
      })
    }
    setLoading(false)
  }

  const handleApproveAll = async (departmentId: string) => {
    if (!canApproveTimeEntries(departmentId)) {
      toast({
        variant: 'destructive',
        title: 'Permission Denied',
        description: 'You do not have permission to approve entries in this department'
      })
      return
    }

    setLoading(true)
    const response = await approvalAllByDepartment(userId, departmentId)

    if (response.data) {
      setEntriesByDepartment(prev => ({
        ...prev,
        [departmentId]: prev[departmentId].map(entry => ({
          ...entry,
          status: TimeEntryStatus.APPROVED
        }))
      }))

      toast({
        title: 'Success',
        description: response.success
      })
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: response.error
      })
    }
    setLoading(false)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Timesheet Management</CardTitle>
            <CardDescription>
              Week of {format(startOfWeek(currentWeek), 'MMM d')} - {format(endOfWeek(currentWeek), 'MMM d, yyyy')}
            </CardDescription>
          </div>
          <WeekNavigation
            currentWeek={currentWeek}
            setCurrentWeek={setCurrentWeek}
          />
        </div>
      </CardHeader>
      <CardContent> 
        <Tabs defaultValue={selectedDepartment} onValueChange={setSelectedDepartment}>
          <TabsList className="mb-4">
            {employeeDepartments.map(({ departmentId, role, hourlyRate }) => (
              <TabsTrigger key={departmentId} value={departmentId}>
                <div className="flex flex-col items-start">
                  <span>{departmentMap[departmentId]?.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {role} - ${Number(hourlyRate)}/hr
                  </span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {employeeDepartments.map(({ departmentId }) => (
            <TabsContent key={departmentId} value={departmentId}>
              <DepartmentTimesheet
                entries={entriesByDepartment[departmentId] || []}
                loading={loading}
                canApprove={canApproveTimeEntries(departmentId)}
                department={departmentMap[departmentId]}
                onApprove={handleApproveEntry}
                onDiscard={handleDiscardEntry}
                onApproveAll={handleApproveAll}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Separate components for better organization
function WeekNavigation({ currentWeek, setCurrentWeek }: {
  currentWeek: Date
  setCurrentWeek: (date: Date) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button variant="outline" onClick={() => setCurrentWeek(new Date())}>Today</Button>
      <Button variant="outline" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

function DepartmentTimesheet({
  entries,
  loading,
  canApprove,
  department,
  onApprove,
  onDiscard,
  onApproveAll
}: {
  entries: TimeEntry[]
  loading: boolean
  canApprove: boolean
  department: Department
  onApprove: (id: string) => Promise<void>
  onDiscard: (id: string) => Promise<void>
  onApproveAll: (departmentId: string) => Promise<void>
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between flex-wrap gap-2 items-center">
        <div className="flex gap-2 ">
          <Badge variant="outline">
            Total Entries: {entries.length}
          </Badge>
          <Badge variant="outline" className="bg-green-50">
            Approved: {entries.filter(e => e.status === TimeEntryStatus.APPROVED).length}
          </Badge>
          <Badge variant="outline" className="bg-red-50">
            Rejected: {entries.filter(e => e.status === TimeEntryStatus.REJECTED).length}
          </Badge>
        </div>
        {canApprove && (
          <Button
            onClick={() => onApproveAll(department.id)}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Approve All
          </Button>
        )}
      </div>

      <TimeEntryTable
        entries={entries}
        loading={loading}
        canApprove={canApprove}
        onApprove={onApprove}
        onDiscard={onDiscard}
      />
    </div>
  )
}
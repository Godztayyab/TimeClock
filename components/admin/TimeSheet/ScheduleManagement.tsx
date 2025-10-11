'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { createSchedule, getScheduleByUserIdAndDepartmentId } from '@/actions/schedule'
import { EmployeeDepartment, WorkShift } from '@prisma/client'
import { addDays, format } from 'date-fns'

interface DepartmentSchedule {
    id: string
    weekStart: Date
    weekEnd: Date
    createdAt: Date
    updatedAt: Date
    departmentId: string
    userId: string
    createdById: string
    schedules: WorkShift[]
}
import { TimeGrid } from './TimeGrid'
import { DateRange } from 'react-day-picker'
import { useTimeEntry } from '@/_context/TimeEntryContext'
import { Badge } from '@/components/ui/badge'

interface ScheduleManagementProps {
    userId: string
    employeeDepartments: EmployeeDepartment[]
}

export default function ScheduleManagement({ userId, employeeDepartments: _e }: ScheduleManagementProps) {
    const { permittedDepartmentsMap } = useTimeEntry();
    const [employeeDepartments,] = useState<EmployeeDepartment[]>(_e.filter(dept => permittedDepartmentsMap[dept.departmentId]))
    const [selectedDepartment, setSelectedDepartment] = useState(employeeDepartments[0]?.departmentId)
    const [selectedWeek, setSelectedWeek] = useState<DateRange>(() => ({
        from: undefined,
        to: undefined
    }))
    const [shifts, setShifts] = useState<WorkShift[]>([])
    const { toast } = useToast()
    const [existingSchedule, setExistingSchedule] = useState<DepartmentSchedule | null>(null)
    const [loading, setLoading] = useState(false)

    const { departmentMap } = useTimeEntry()


    useEffect(() => {
        const loadSchedule = async () => {
            setLoading(true)
            const response = await getScheduleByUserIdAndDepartmentId(userId, selectedDepartment)
            if (response.data) {
                setExistingSchedule(response.data)
                setShifts(response.data.schedules || [])
                setSelectedWeek({
                    from: new Date(response.data.weekStart),
                    to: new Date(response.data.weekEnd)
                })
            }
            setLoading(false)
        }
        loadSchedule()
    }, [selectedDepartment, userId])

    const handleWeekSelect = (range: DateRange | undefined) => {
        if (!range) return
        setSelectedWeek(range)
        setShifts(existingSchedule?.schedules || [])
    }

    const handleCreateSchedule = async () => {
        if (!selectedWeek.from || !selectedWeek.to) {
            toast({
                title: 'Error',
                description: 'Please select a week first',
                variant: 'destructive'
            })
            return
        }

        const response = await createSchedule(userId, selectedDepartment, {
            weekStart: selectedWeek.from,
            weekEnd: selectedWeek.to,
            shifts: shifts.map(({ scheduleId: _scheduleId, ...shift }) => {
                console.log(_scheduleId)
                return shift
            })
        })

        if (response.conflicts) {
            toast({
                title: 'Schedule Conflicts Detected',
                description: 'There are overlapping schedules in other departments',
            })
        }

        if (response.error) {
            toast({
                title: 'Error',
                description: response.error,
                variant: 'destructive'
            })
        } else {
            toast({
                title: 'Success',
                description: response.success
            })
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Schedule Management</CardTitle>
                        <CardDescription>
                            {selectedWeek.from && selectedWeek.to ? (
                                `Week of ${format(selectedWeek.from, 'MMM d')} - ${format(selectedWeek.to, 'MMM d, yyyy')}`
                            ) : (
                                'Select a week to manage schedule'
                            )}
                        </CardDescription>
                    </div>
                    {existingSchedule && (
                        <Badge variant="outline">
                            Current Schedule Active
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <TabsList>
                        {employeeDepartments.map(dept => (
                            <TabsTrigger key={dept.departmentId} value={dept.departmentId}>
                                {departmentMap[dept.departmentId]?.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <div className="grid grid-cols-12 gap-4 mt-4">
                        <div className="col-span-4">
                            <Calendar
                                mode="range"
                                selected={selectedWeek}
                                onSelect={handleWeekSelect}
                                numberOfMonths={1}
                                disabled={(date) => date < new Date()}
                                defaultMonth={new Date()}
                                showOutsideDays={true}
                                fromDate={new Date()}
                                toDate={addDays(new Date(), 365)}
                                className="rounded-md border shadow"
                                classNames={{
                                    month: "space-y-4",
                                    caption: "flex justify-center pt-1 relative items-center",
                                    caption_label: "text-sm font-medium",
                                    nav: "space-x-1 flex items-center",
                                    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                                    nav_button_previous: "absolute left-1",
                                    nav_button_next: "absolute right-1",
                                    table: "w-full border-collapse space-y-1",
                                    head_row: "flex",
                                    head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                                    row: "flex w-full mt-2",
                                    cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-orange-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                                    day_selected: "bg-orange-600 text-white hover:bg-orange-600 hover:text-white focus:bg-orange-600 focus:text-white",
                                    day_today: "bg-orange-100 text-orange-600",
                                    day_outside: "text-muted-foreground opacity-50",
                                    day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed",
                                    day_range_middle: "aria-selected:bg-orange-50 aria-selected:text-orange-900",
                                    day_hidden: "invisible"
                                }}
                            />
                        </div>
                        <div className="col-span-8">
                            <TimeGrid
                                shifts={shifts}
                                onChange={(newShifts) => {
                                    setShifts(newShifts.map(shift => ({
                                        ...shift,
                                        id: crypto.randomUUID(),
                                        scheduleId: existingSchedule?.id || crypto.randomUUID(),
                                    })))
                                }}
                                disabled={loading}
                                existingSchedule={existingSchedule}
                            />
                            <div className="mt-4 flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShifts(existingSchedule?.schedules || [])
                                    }}
                                >
                                    Reset
                                </Button>
                                <Button
                                    onClick={handleCreateSchedule}
                                    disabled={!selectedWeek.from || !selectedWeek.to || loading}
                                >
                                    {existingSchedule ? 'Update Schedule' : 'Create Schedule'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </Tabs>
            </CardContent>
        </Card >
    )
}
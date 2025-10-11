'use client'

import { DepartmentSchedule, WorkShift } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { format, addDays, startOfWeek } from "date-fns"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { AlertTriangle } from "lucide-react"
import { Badge } from "../ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import {  useEffect, useMemo, useState } from "react"
import { Department } from "@prisma/client"
import { getScheduleByUserIdAndDepartmentId } from "@/actions/schedule"



interface ScheduleViewProps {
    departments: Department[]
    userId: string
}

export function ScheduleView({ departments, userId }: ScheduleViewProps) {
    const [schedules, setSchedules] = useState<ScheduleWithDepartment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchSchedules() {
            try {
                setLoading(true)
                const schedulePromises = departments.map(async (dept) => {
                    const response = await getScheduleByUserIdAndDepartmentId(userId, dept.id)
                    if (response.data) {
                        return {
                            ...response.data,
                            department: { id: dept.id, name: dept.name }
                        }
                    }
                    return null
                })

                const results = await Promise.all(schedulePromises)
                setSchedules(results.filter((s): s is ScheduleWithDepartment => s !== null))
            } catch (err) {
                setError("Failed to load schedules")
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        if (departments.length > 0 && userId) {
            fetchSchedules()
        }
    }, [departments, userId])

    const schedulesByDepartment = useMemo(() => {
        return schedules.reduce((acc, schedule) => {
            const dept = schedule.department.id;
            if (!acc[dept]) acc[dept] = [];
            acc[dept].push(schedule);
            return acc;
        }, {} as Record<string, ScheduleWithDepartment[]>);
    }, [schedules]);
    
    if (error) {
        return (
            <Card>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        )
    }

 

    const { hasConflict, conflicts } = checkScheduleConflicts(schedules);
    return (
        <Card className="w-full">
            <CardHeader className="space-y-3 p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl">My Schedule</CardTitle>
                {hasConflict && (
                    <Alert variant="destructive" className="mt-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Schedule Conflicts</AlertTitle>
                        <AlertDescription className="max-h-48 overflow-y-auto">
                            {conflicts.map((conflict, idx) => (
                                <div key={idx} className="text-sm mt-1">
                                    Conflict between {conflict.shift1.departmentName} and {conflict.shift2.departmentName} on{' '}
                                    {format(new Date(conflict.shift1.startTime), 'EEE')} at{' '}
                                    {format(new Date(conflict.shift1.startTime), 'h:mm a')}
                                </div>
                            ))}
                        </AlertDescription>
                    </Alert>
                )}
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
                {!loading && schedules.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground">
                        No schedules found
                    </div>
                ) : (
                    <Tabs activationMode="automatic" className="w-full">
                        <TabsList className="whitespace-nowrap mb-4 pb-1 hide-scrollbar">
                            {Object.entries(schedulesByDepartment).map(([deptId, deptSchedules]) => (
                                <TabsTrigger
                                    key={deptId}
                                    value={deptId}
                                    defaultChecked={deptId === Object.keys(schedulesByDepartment)[0]}
                                    className="flex-shrink-0 text-sm sm:text-base"
                                >
                                    {deptSchedules[0]?.department?.name || 'Unknown Department'}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {Object.entries(schedulesByDepartment).map(([deptId, deptSchedules]) => (
                            <TabsContent key={deptId} value={deptId} className="mt-4">
                                {deptSchedules.map((schedule) => (
                                    <WeeklySchedule key={schedule.id} schedule={schedule} />
                                ))}
                            </TabsContent>
                        ))}
                    </Tabs>
                )}
            </CardContent>
        </Card>
    )
}

function WeeklySchedule({ schedule }: { schedule: ScheduleWithDepartment }) {
    const days = [...Array(7)].map((_, i) =>
        addDays(startOfWeek(schedule.weekStart), i)
    )

    return (
        <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm sm:text-base font-medium">
                    Week {format(schedule.weekStart, 'w')} - {" "}
                    <span className="text-muted-foreground">
                        {format(schedule.weekEnd, 'MMM d, yyyy')}
                    </span>
                </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {days.map((day, idx) => (
                    <DaySchedule
                        key={day.toISOString()}
                        date={day}
                        shifts={schedule.schedules.filter(s => s.dayOfWeek === idx)}
                    />
                ))}
            </div>
        </div>
    )
}

function DaySchedule({ date, shifts }: { date: Date, shifts: WorkShift[] }) {
    const today = new Date()
    const isToday = format(date, 'EEEE') === format(today, 'EEEE')
    const [currentTime, setCurrentTime] = useState(new Date())
    const sortedShifts = useMemo(() => shifts.sort((a, b) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    ), [shifts])


    // Update current time every minute
    useEffect(() => {
        if (!isToday) return

        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)

        return () => clearInterval(timer)
    }, [isToday])

    // Calculate time indicator position
    const getTimeIndicatorPosition = () => {
        const minutes = currentTime.getHours() * 60 + currentTime.getMinutes()
        return (minutes / 1440) * 100 // 1440 = minutes in a day
    }

    return (
        <div className={cn(
            "p-2 sm:p-3 border rounded-lg min-h-[120px] flex flex-col relative",
            isToday && "bg-orange-50 border-orange-200"
        )}>
            {/* Existing header */}
            <div className="text-xs sm:text-sm font-medium mb-2 flex items-center justify-between">
                <div className={cn("", isToday && "text-orange-600")}>
                    {format(date, 'EEEE')}
                </div>
                {shifts.length > 0 && (
                    <Badge variant="default" className="text-[10px] sm:text-xs">
                        {shifts.length}
                    </Badge>
                )}
            </div>

            {/* Time indicator for today */}
            {isToday && (
                <div
                    className="absolute left-0 right-0 pointer-events-none"
                    style={{ top: `${getTimeIndicatorPosition()}%` }}
                >
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <div className="h-px flex-1 bg-red-500" />
                        <span className="text-[10px] text-red-500 px-1">
                            {format(currentTime, 'h:mm a')}
                        </span>
                    </div>
                </div>
            )}

            {/* Existing shifts list */}
            <div className="flex-1 space-y-1.5 overflow-y-auto max-h-32 sm:max-h-40">
                {sortedShifts.length === 0 ? (
                    <div className="text-[10px] sm:text-xs text-muted-foreground text-center py-2">
                        No shifts
                    </div>
                ) : (
                    sortedShifts.map((shift) => (
                        <TooltipProvider key={shift.id}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="bg-orange-100 text-orange-800 rounded px-2 py-1.5 text-xs">
                                        <div className="font-medium">
                                            {format(new Date(shift.startTime), 'h:mm a')}
                                        </div>
                                        <div className="text-orange-600">
                                            {format(new Date(shift.endTime), 'h:mm a')}
                                        </div>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <div className="text-xs space-y-1">
                                        <div className="font-medium">Shift Duration: <span className="text-orange-600">
                                            {(() => {
                                                const start = new Date(shift.startTime);
                                                const end = new Date(shift.endTime);
                                                const diff = end.getTime() - start.getTime();
                                                const hours = Math.floor(diff / (1000 * 60 * 60));
                                                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                                return [
                                                    hours > 0 ? `${hours}h` : '',
                                                    minutes > 0 ? `${minutes}m` : ''
                                                ].filter(Boolean).join(' ') || '0m';
                                            })()}
                                        </span>
                                        </div>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))
                )}
            </div>
        </div>
    )
}

export interface ScheduleWithDepartment extends DepartmentSchedule {
    schedules: WorkShift[];
    department: { id: string; name: string; }
}

export function checkScheduleConflicts(schedules: ScheduleWithDepartment[]) {
    const conflicts: Array<{
        shift1: WorkShift & { departmentName: string };
        shift2: WorkShift & { departmentName: string };
    }> = [];

    // Compare shifts between different departments
    schedules.forEach((schedule1, index) => {
        schedules.slice(index + 1).forEach(schedule2 => {
            // Skip if same department
            if (schedule1.department.id === schedule2.department.id) return;

            schedule1.schedules.forEach(shift1 => {
                schedule2.schedules.forEach(shift2 => {
                    // Only check shifts on same day
                    if (shift1.dayOfWeek === shift2.dayOfWeek) {
                        const start1 = new Date(shift1.startTime);
                        const end1 = new Date(shift1.endTime);
                        const start2 = new Date(shift2.startTime);
                        const end2 = new Date(shift2.endTime);

                        // Check for time overlap
                        const hasOverlap = (
                            (start1 <= end2 && end1 > start2) || // shift1 overlaps with start of shift2
                            (start2 <= end1 && end2 > start1)    // shift2 overlaps with start of shift1
                        );

                        if (hasOverlap) {
                            conflicts.push({
                                shift1: {
                                    ...shift1,
                                    departmentName: schedule1.department.name
                                },
                                shift2: {
                                    ...shift2,
                                    departmentName: schedule2.department.name
                                }
                            });
                        }
                    }
                });
            });
        });
    });

    return {
        hasConflict: conflicts.length > 0,
        conflicts
    };
}
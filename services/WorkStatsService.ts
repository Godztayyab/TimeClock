import { db } from '@/lib/db'
import { TimeEntry, Department, EmployeeDepartment } from '@prisma/client'
import { startOfWeek, endOfWeek, differenceInMinutes } from 'date-fns'


export interface WorkStats {
  weeklyHours: number
  overtimeHours: number
  expectedPay: number
  departmentStats: DepartmentStats[]
  currentEntry?: TimeEntry | null
  lastClockIn?: Date | null
  scheduleAdherence: number
}

interface DepartmentStats {
  departmentId: string
  departmentName: string
  hours: number
  pay: number
  rate: number
  regularHours: number
  overtimeHours: number
}

export class WorkStatsService {
  async getWeeklyStats(userId: string, date: Date = new Date()): Promise<WorkStats> {
    const weekStart = startOfWeek(date)
    const weekEnd = endOfWeek(date)

    const [timeEntries, departments, currentEntry] = await Promise.all([
      db.timeEntry.findMany({
        where: {
          userId,
          clockIn: {
            gte: weekStart,
            lte: weekEnd
          }
        },
        orderBy: { clockIn: 'desc' }
      }),
      db.employeeDepartment.findMany({
        where: { userId },
        include: { department: true }
      }),
      db.timeEntry.findFirst({
        where: {
          userId,
          clockOut: null
        }
      })
    ])

    const departmentStats = await this.calculateDepartmentStats(timeEntries, departments)
    const weeklyHours = Number(departmentStats.reduce((total, dept) => total + dept.hours, 0).toFixed(2))
    const overtimeHours = Number(Math.max(weeklyHours - 40, 0).toFixed(2))
    const expectedPay = 
    Number(departmentStats.reduce((total, dept) => 
      total + (dept.regularHours * dept.rate) + (dept.overtimeHours * dept.rate * 1.5), 0).toFixed(2))
    const lastClockIn = timeEntries[0]?.clockIn

    return {
      weeklyHours,
      overtimeHours,
      expectedPay,
      departmentStats,
      currentEntry,
      lastClockIn,
      scheduleAdherence: 100 // Placeholder
    }
  }

  private async calculateDepartmentStats(
    entries: TimeEntry[],
    departments: (EmployeeDepartment & { department: Department })[]
  ): Promise<DepartmentStats[]> {
    return departments.map(dept => {
      const deptEntries = entries.filter(entry => entry.departmentId === dept.departmentId)
      const hours = Number(this.calculateTotalHours(deptEntries).toFixed(2))
      const regularHours = Number(Math.min(hours, 40).toFixed(2))
      const overtimeHours = Number(Math.max(hours - 40, 0).toFixed(2))
      const rate = Number(dept.hourlyRate)
      const pay = Number((regularHours * rate + overtimeHours * rate * 1.5).toFixed(2))

      return {
        departmentId: dept.departmentId,
        departmentName: dept.department.name,
        hours,
        pay,
        rate,
        regularHours,
        overtimeHours
      }
    })
  }

  private calculateTotalHours(entries: TimeEntry[]): number {
    return entries.reduce((total, entry) => {
      if (!entry.clockIn) return total
      const end = entry.clockOut || new Date()
      const minutes = differenceInMinutes(end, entry.clockIn)
      return total + (minutes / 60)
    }, 0)
  }

  private async calculateScheduleAdherence(
    userId: string,
    timeEntries: TimeEntry[],
    weekStart: Date
  ): Promise<number> {
    const schedule = await db.departmentSchedule.findMany({
      where: {
        userId,
        weekStart: {
          gte: weekStart
        }
      },
      include: {
        schedules: true
      }
    })

    if (!schedule.length) return 100

    // Implementation after schedule is added
    return 95 
  }
}

export const workStatsService = new WorkStatsService()
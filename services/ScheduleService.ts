import { db } from '@/lib/db'
import { DepartmentSchedule, WorkShift } from '@prisma/client'

export class ScheduleService {
  async getSchedule(departmentId: string, userId: string): Promise<DepartmentSchedule & {
    schedules: WorkShift[];
    department: { id: string; name: string; }
  } | null> {
    return await db.departmentSchedule.findFirst({
      where: {
        departmentId,
        userId,
      },
      include: {
        schedules: true,
        department: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async createSchedule(data: {
    departmentId: string
    userId: string
    createdById: string
    weekStart: Date
    weekEnd: Date
    shifts: Array<{
      dayOfWeek: number
      startTime: Date
      endTime: Date
      isRecurring: boolean
    }>
  }) {
    return await db.$transaction(async (tx) => {
      // Check for existing schedule
      const existingSchedule = await tx.departmentSchedule.findFirst({
        where: {
          departmentId: data.departmentId,
          userId: data.userId,
        }
      })

      // Delete if exists
      if (existingSchedule) {
        await tx.workShift.deleteMany({
          where: {
            scheduleId: existingSchedule.id
          }
        })
        await tx.departmentSchedule.delete({
          where: {
            id: existingSchedule.id
          }
        })
      }

      // Create new schedule
      const newSchedule = await tx.departmentSchedule.create({
        data: {
          departmentId: data.departmentId,
          userId: data.userId,
          createdById: data.createdById,
          weekStart: data.weekStart,
          weekEnd: data.weekEnd,
          schedules: {
            create: data.shifts
          }
        },
        include: {
          schedules: true,
          department: true
        }
      })

      return {
        schedule: newSchedule,
        message: existingSchedule 
          ? 'Schedule updated successfully' 
          : 'Schedule created successfully',
        replaced: !!existingSchedule
      }
    })
  }

  async checkScheduleConflicts(userId: string, weekStart: Date, weekEnd: Date) {
    return await db.departmentSchedule.findMany({
      where: {
        userId,
        OR: [
          {
            weekStart: {
              lte: weekEnd,
            },
            weekEnd: {
              gte: weekStart,
            }
          }
        ]
      },
      include: {
        schedules: true,
        department: true
      }
    })
  }

  async getWeeklySchedule(departmentId: string) {
    return await db.departmentSchedule.findMany({
      where: {
        departmentId,
        weekStart: {
          gte: new Date()
        }
      },
      include: {
        schedules: true,
        employee: true
      },
      orderBy: {
        weekStart: 'asc'
      }
    })
  }

  async getScheduleByUserIdAndDepartmentId(userId: string, departmentId: string) {
    return await db.departmentSchedule.findFirst({
      where: {
        userId,
        departmentId
      },
      include: {
        schedules: true
      }
    })
  }
}

export const scheduleService = new ScheduleService()
import { db } from '@/lib/db'
import { TimeOffRequest, TimeEntryStatus, TimeOffRequestType } from '@prisma/client'
import { notificationService } from './NotificationService'
import { departmentService } from './DepartmentService'

export class TimeOffRequestService {
  async createTimeOffRequest(
    userId: string,
    departmentIds: string[],
    startDate: Date,
    endDate: Date,
    requestType: TimeOffRequestType,
    message?: string
  ): Promise<TimeOffRequest[]> {
    return await db.$transaction(async (tx) => {
      const requests = []
      for (const departmentId of departmentIds) {
        const request = await tx.timeOffRequest.create({
          data: {
            userId,
            startDate,
            endDate,
            requestType,
            message,
            status: TimeEntryStatus.PENDING
          }
        })
        requests.push(request)
      }
      return requests
    })
  }

  async getTimeOffRequestsByDepartmentId(departmentId: string) {
    const employees = await departmentService.getDeparmentEmployees(departmentId)
    if (!employees) return []

    return await db.timeOffRequest.findMany({
      where: {
        userId: {
          in: employees.map(employee => employee.employee.id)
        }
      },
      include: {
        employee: true,
        approvedBy: true
      },
      orderBy: [
        {
          status: 'asc'
        },
        {
          startDate: 'desc'
        }
      ]
    })

  }

  async approveTimeOffRequest(requestId: string, approverId: string): Promise<TimeOffRequest> {
    const timeoff = await db.timeOffRequest.update({
      where: { id: requestId },
      data: {
        status: TimeEntryStatus.APPROVED,
        approvedById: approverId,
        approvedAt: new Date()
      }
    })

    await notificationService.createTimeOffRequestNotification(timeoff.userId, requestId, "APPROVED")
    return timeoff
  }

  async rejectTimeOffRequest(requestId: string, approverId: string): Promise<TimeOffRequest> {
    const timeoff = await db.timeOffRequest.update({
      where: { id: requestId },
      data: {
        status: TimeEntryStatus.REJECTED,
        approvedById: approverId,
        approvedAt: new Date()
      }
    })

    await notificationService.createTimeOffRequestNotification(timeoff.userId, requestId, "REJECTED")
    return timeoff
  }

  async fetchTimeOffRequestsByUserId(userId: string) {
    return await db.timeOffRequest.findMany({
      where: { userId },
      include: {
        employee: true,
        approvedBy: true
      }
    })
  }

  async cancelTimeOffRequest(requestId: string) {
    return await db.timeOffRequest.delete({ where: { id: requestId } })
  }
}

export const timeOffRequestService = new TimeOffRequestService()
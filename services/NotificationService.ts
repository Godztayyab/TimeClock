import { db } from '@/lib/db'
import { Notification, NotificationType, NotificationPriority, RelatedEntityType } from '@prisma/client'

interface CreateNotificationParams {
  userId: string
  title: string
  message: string
  type: NotificationType
  priority?: NotificationPriority
  actionUrl?: string
  relatedEntityId?: string
    relatedEntityType?: RelatedEntityType
}

export class NotificationService {
  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db.notification.findMany({
      where: {
        userId,
      },
      orderBy: [
        { read: 'asc' },
        { createdAt: 'desc' }
      ]
    })
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    await db.notification.updateMany({
      where: {
        id: notificationId,
        userId
      },
      data: {
        read: true,
        updatedAt: new Date()
      }
    })
  }

  async markAllAsRead(userId: string): Promise<void> {
    await db.notification.updateMany({
      where: {
        userId,
        read: false
      },
      data: {
        read: true,
        updatedAt: new Date()
      }
    })
  }

  async createNotification(params: CreateNotificationParams): Promise<Notification> {
    return await db.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type,
        priority: params.priority || NotificationPriority.MEDIUM,
        actionUrl: params.actionUrl,
      }
    })
  }

  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    await db.notification.deleteMany({
      where: {
        id: notificationId,
        userId
      }
    })
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await db.notification.count({
      where: {
        userId,
        read: false
      }
    })
  }

  async createTimesheetNotification(
    userId: string,
    timesheetId: string,
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
  ): Promise<Notification> {
    return await this.createNotification({
      userId,
      title: `Timesheet ${status.toLowerCase()}`,
      message: `Your timesheet has been ${status.toLowerCase()}`,
      type: `TIMESHEET_${status}` as NotificationType,
      priority: status === 'REJECTED' ? NotificationPriority.HIGH : NotificationPriority.MEDIUM,
      relatedEntityId: timesheetId,
      relatedEntityType: 'TIMESHEET'
    })
  }

  async createTimesheetApprovedAllNotification(
    userId: string,
    departmentId: string
  ): Promise<Notification> {
    return await this.createNotification({
      userId,
      title: 'All Timesheets Approved',
      message: 'All timesheets have been approved',
      type: 'TIMESHEET_DEPARTMENT_APPROVED_ALL',
      priority: NotificationPriority.MEDIUM,
      relatedEntityId: departmentId,
      relatedEntityType: 'DEPARTMENT'
    })
  }

  async createClockedOutNotification(
    userId: string,
    timeEntryId: string,
    message?: string
  ): Promise<Notification> {
    return await this.createNotification({
      userId,
      title: 'Clocked Out',
      message: message ?? 'You have successfully clocked out',
      type: NotificationType.CLOCKED_OUT, 
      priority: NotificationPriority.MEDIUM,
      relatedEntityId: timeEntryId,
      relatedEntityType: RelatedEntityType.TIME_ENTRY
    })
  }

  async createTimeOffRequestNotification(
    userId: string,
    requestId: string,
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
  ): Promise<Notification> {
    const notificationTypes = {
      PENDING: NotificationType.TIME_OFF_REQUEST_PENDING,
      APPROVED: NotificationType.TIME_OFF_REQUEST_APPROVED,
      REJECTED: NotificationType.TIME_OFF_REQUEST_REJECTED,
    };
    return await this.createNotification({
      userId,
      title: `Time Off Request ${status.toLowerCase()}`,
      message: `Your time off request has been ${status.toLowerCase()}`,
      type: notificationTypes[status],
      priority: status === 'REJECTED' ? NotificationPriority.HIGH : NotificationPriority.MEDIUM,
      relatedEntityId: requestId,
      relatedEntityType: 'TIMEOFF'
    })
  }

}

export const notificationService = new NotificationService()
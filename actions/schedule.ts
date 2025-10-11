"use server";

import { scheduleService } from '@/services/ScheduleService'
import { timeOffRequestService } from '@/services/TimeOffRequestService';

export async function createSchedule(
  userId: string,
  departmentId: string,
  data: {
    weekStart: Date
    weekEnd: Date
    shifts: Array<{
      dayOfWeek: number
      startTime: Date
      endTime: Date
      isRecurring: boolean
    }>
  }
) {
  try {
    const conflicts = await scheduleService.checkScheduleConflicts(
      userId,
      data.weekStart,
      data.weekEnd
    )

    const schedule = await scheduleService.createSchedule({
      departmentId,
      userId,
      createdById: userId,
      ...data
    })

    return {
      success: 'Schedule created successfully',
      data: schedule,
      conflicts: conflicts.length > 0 ? conflicts : null
    }
  } catch (error) {
    console.error(error)
    return { error: 'Failed to create schedule' }
  }
}

export async function fetchTimeOffRequestsByUserId(departmentId: string) {
  try {
    const schedule = await timeOffRequestService.fetchTimeOffRequestsByUserId(departmentId)
    return { data: schedule }
  } catch (error) {
    return { error: 'Failed to fetch schedule' }
  }
}



export async function getScheduleByUserIdAndDepartmentId(userId: string, departmentId: string) {
  try {
    const schedule = await scheduleService.getScheduleByUserIdAndDepartmentId(userId, departmentId)
    return { data: schedule }
  } catch (error) {
    return { error: 'Failed to fetch schedule' }
  }
}
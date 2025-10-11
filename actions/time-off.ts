"use server";

import { timeOffRequestService } from '@/services/TimeOffRequestService'
import { TimeOffRequestType } from '@prisma/client'

export async function requestTimeOff(
  userId: string,
  departmentIds: string[],
  startDate: Date,
  endDate: Date,
  requestType: TimeOffRequestType,
  message?: string
) {
  try {
    const requests = await timeOffRequestService.createTimeOffRequest(
      userId,
      departmentIds,
      startDate,
      endDate,
      requestType,
      message
    )
    return { success: "Time off request submitted successfully", data: requests }
  } catch (error) {
    console.error('Failed to submit time off request:', error)
    return { error: "Failed to submit time off request" }
  }
}

export async function approveTimeOff(requestId: string, approverId: string) {
  try {
    const request = await timeOffRequestService.approveTimeOffRequest(requestId, approverId)
    return { success: "Time off request approved", data: request }
  } catch (error) {
    console.error('Failed to approve time off request:', error)
    return { error: "Failed to approve time off request" }
  }
}

export async function rejectTimeOff(requestId: string, approverId: string) {
  try {
    const request = await timeOffRequestService.rejectTimeOffRequest(requestId, approverId)
    return { success: "Time off request rejected", data: request }
  } catch (error) {
    console.error('Failed to reject time off request:', error)
    return { error: "Failed to reject time off request" }
  }
}


export async function fetchTimeOffRequestsByUserId(userId: string) {
  try {
    const requests = await timeOffRequestService.fetchTimeOffRequestsByUserId(userId)
    return { success: "Time off requests fetched successfully", data: requests }
  } catch (error) {
    return { error: "Failed to fetch time off requests" }
  }
}

export async function getTimeOffRequestsByDeparmentId(departmentId: string) {
  try {
    const requests = await timeOffRequestService.getTimeOffRequestsByDepartmentId(departmentId)
    return { success: "Time off requests fetched successfully", data: requests }
  } catch (error) {
    return { error: "Failed to fetch time off requests" }
  }
}

export async function cancelTimeOffRequest(requestId: string) {
  try {
    const request = await timeOffRequestService.cancelTimeOffRequest(requestId)
    return { success: "Time off request cancelled", data: request }
  } catch (error) {
    return { error: "Failed to cancel time off request" }
  }
}
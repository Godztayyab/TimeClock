"use server";

import { notificationService } from "@/services/NotificationService";
import { timeEntryService } from "@/services/TimeEntryService";
import { TimeEntryStatus } from "@prisma/client";
import { differenceInMilliseconds, format } from "date-fns";

const formatTimeWorked = (milliseconds: number): string => {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours === 0) {
    return `${minutes} minutes`;
  }
  return `${hours} hours ${minutes} minutes`;
};

const calculateTimeWorked = (clockIn: Date, clockOut: Date): number => {
  return differenceInMilliseconds(clockOut, clockIn);
};

export const getUserTimeEntries = async (userId: string) => {
  const data = await timeEntryService.getUserTimeEntries(userId);
  if (data) {
    return { success: "Time entries fetched successfully", data };
  } else {
    return { error: "Failed to fetch time entries" };
  }
};

export const clockIn = async (userId: string, departmentId: string) => {
  const data = await timeEntryService.clockIn(userId, departmentId);
  if (data) {
    return { success: "Clocked in successfully", data };
  } else {
    return { error: "Failed to clock in" };
  }
};

export const clockOut = async (userId: string, timeEntryId: string) => {
  try {
    const data = await timeEntryService.clockOut(userId, timeEntryId)
    
    if (!data) {
      return { error: "No active time entry found" };
    }

    const timeWorked = data.clockIn && data.clockOut 
      ? calculateTimeWorked(data.clockIn, data.clockOut)
      : 0;

    const formattedTime = formatTimeWorked(timeWorked);
    
    const notificationMessage = 
      `Clock out successful! You worked for ${formattedTime}. ` +
      `Your time entry from ${data.clockIn ? format(data.clockIn, 'h:mm a') : 'unknown'} to ${data.clockOut ? format(data.clockOut, 'h:mm a') : 'unknown'} has been recorded.`;

    await notificationService.createClockedOutNotification(
      userId, 
      timeEntryId, 
      notificationMessage
    );

    return { 
      success: `Clocked out successfully after ${formattedTime}`, 
      data 
    };

  } catch (error) {
    console.error("Clock out failed:", error);
    return { error: "Failed to clock out. Please try again." };
  }
};

export const approveTimeEntry = async (userId: string, timeEntryId: string) => {
  const data = await timeEntryService.approveTimeEntry(userId, timeEntryId);
  await notificationService.createTimesheetNotification(userId, timeEntryId, TimeEntryStatus.APPROVED);
  if (data) {
    return { success: "Time entry approved successfully", data };
  } else {
    return { error: "Failed to approve time entry" };
  }
};

export const discardTimeEntry = async (userId: string, timeEntryId: string) => {
  const data = await timeEntryService.discardTimeEntry(userId, timeEntryId);

  await notificationService.createTimesheetNotification(userId, timeEntryId, TimeEntryStatus.REJECTED);
  if (data) {
    return { success: "Time entry discarded successfully", data };
  } else {
    return { error: "Failed to discard time entry" };
  }
};

export const approveAllWeeklyTimeEntries = async (userId: string, departmentId: string) => {
  const data = await timeEntryService.approveAllWeeklyTimeEntries(userId, departmentId);
  if (data) {
    return { success: "All weekly time entries approved successfully", data };
  } else {
    return { error: "Failed to approve all weekly time entries" };
  }
};

export const approvalAllByDepartment = async (userId: string, departmentId: string) => {
  const data = await timeEntryService.approveAllByDepartment(userId, departmentId);

  await notificationService.createTimesheetApprovedAllNotification(userId, departmentId);

  if (data) {
    return { success: "All time entries approved successfully", data };
  } else {
    return { error: "Failed to approve all time entries" };
  }
}

export const getWeeklyReport = async (userId: string, departmentId: string) => {
  const data = await timeEntryService.getWeeklyReport(userId, departmentId);
  if (data) {
    return { success: "Weekly report fetched successfully", data };
  } else {
    return { error: "Failed to fetch weekly report" };
  }
};

export const isUserClockedIn = async (userId: string) => {
  const data = await timeEntryService.isUserClockedIn(userId);
  if (data) {
    return { success: "User is clocked in", data };
  } else {
    return { error: "User is not clocked in" };
  }
};

export const getActiveTimeEntry = async (userId: string) => {
  const data = await timeEntryService.getActiveTimeEntry(userId);
  if (data) {
    return { success: "Active time entry fetched successfully", data };
  } else {
    return { error: "Failed to fetch active time entry" };
  }
}

export const submitForApproval = async (userId: string, timeEntryId: string) => {
  const data = await timeEntryService.submitForApproval(userId, timeEntryId);
  if (data) {
    return { success: "Time entry submitted for approval successfully", data };
  } else {
    return { error: "Failed to submit time entry for approval" };
  }
}

export const submitAllForApproval = async (userId: string) => {
  const data = await timeEntryService.submitAllForApproval(userId);
  if (data) {
    return { success: "All time entries submitted for approval successfully", data };
  } else {
    return { error: "Failed to submit all time entries for approval" };
  }
}
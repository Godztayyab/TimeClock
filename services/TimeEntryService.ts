import { db } from "@/lib/db";
import { TimeEntry, TimeEntryStatus, UserRole, EmployeeDepartmentRole } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { departmentService } from "./DepartmentService";

class TimeEntryService {
  async getUserTimeEntries(userId: string): Promise<TimeEntry[] | null> {
    try {
      const timeEntries = await db.timeEntry.findMany({
        where: { userId },
        include: { department: true },
        orderBy: [
          { clockOut: { sort: 'desc', nulls: 'first' } },
          { clockIn: 'desc' }
        ],
        take: 100
      });
      return timeEntries;
    } catch (error) {
      console.error("Error fetching user time entries:", error);
      return null;
    }
  }

  async isUserClockedIn(userId: string): Promise<boolean> {
    try {
      const clockedInEntry = await db.timeEntry.findFirst({
        where: {
          userId,
          clockOut: null,
        },
      });
      return !!clockedInEntry;
    } catch (error) {
      console.error("Error checking if user is clocked in:", error);
      return false;
    }
  }

  async clockIn(userId: string, departmentId: string): Promise<TimeEntry | null> {
    try {
      const department = await db.employeeDepartment.findFirst({
        where: { userId, departmentId },
      });

      if (!department) {
        console.error("User does not belong to the department.");
        return null;
      }

      const timeEntry = await db.timeEntry.create({
        data: {
          userId,
          departmentId,
          clockIn: new Date(),
          status: TimeEntryStatus.NOTSUBMITTED,
          hours: new Decimal(0),
        },
      });

      return timeEntry;
    } catch (error) {
      console.error("Error clocking in:", error);
      return null;
    }
  }

  async clockOut(userId: string, timeEntryId: string): Promise<TimeEntry | null> {
    try {
      const timeEntry = await db.timeEntry.findUnique({ where: { id: timeEntryId }, include: { department: true } });

      if (!timeEntry || timeEntry.userId !== userId) {
        console.error("Time entry not found or user does not own the time entry.");
        return null;
      }

      const clockOutTime = new Date();
      const hoursWorked = new Decimal((clockOutTime.getTime() - new Date(timeEntry.clockIn).getTime()) / 3600000);

      const updatedTimeEntry = await db.timeEntry.update({
        where: { id: timeEntryId },
        data: {
          clockOut: clockOutTime,
          hours: hoursWorked,
        },
      });

      return updatedTimeEntry;
    } catch (error) {
      console.error("Error clocking out:", error);
      return null;
    }
  }

  async approveTimeEntry(userId: string, timeEntryId: string): Promise<TimeEntry | null> {
    try {
      const permittedDepartments = await departmentService.getUserPermittedDepartments(userId);

      const timeEntry = await db.timeEntry.findUnique({
        where: { id: timeEntryId },
        include: { department: true },
      });

      if (!timeEntry || !permittedDepartments || !permittedDepartments.some(dept => dept.id === timeEntry.departmentId)) {
        console.error("Permission denied or time entry not found.");
        return null;
      }

      const updatedTimeEntry = await db.timeEntry.update({
        where: { id: timeEntryId },
        data: {
          status: TimeEntryStatus.APPROVED,
          approvedById: userId,
          approvedAt: new Date(),
        },
      });

      return updatedTimeEntry;
    } catch (error) {
      console.error("Error approving time entry:", error);
      return null;
    }
  }

  async discardTimeEntry(userId: string, timeEntryId: string): Promise<TimeEntry | null> {
    try {
      const permittedDepartments = await departmentService.getUserPermittedDepartments(userId);

      const timeEntry = await db.timeEntry.findUnique({
        where: { id: timeEntryId },
        include: { department: true },
      });

      if (!timeEntry || !permittedDepartments || !permittedDepartments.some(dept => dept.id === timeEntry.departmentId)) {
        console.error("Permission denied or time entry not found.");
        return null;
      }

      const updatedTimeEntry = await db.timeEntry.update({
        where: { id: timeEntryId },
        data: {
          status: TimeEntryStatus.REJECTED,
        },
      });

      return updatedTimeEntry;
    } catch (error) {
      console.error("Error discarding time entry:", error);
      return null;
    }
  }

  async approveAllWeeklyTimeEntries(userId: string, departmentId: string): Promise<TimeEntry[] | null> {
    try {
      const permittedDepartments = await departmentService.getUserPermittedDepartments(userId);

      if (!permittedDepartments || !permittedDepartments.some(dept => dept.id === departmentId)) {
        console.error("Permission denied.");
        return null;
      }

      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);

      await db.timeEntry.updateMany({
        where: {
          departmentId,
          status: TimeEntryStatus.PENDING,
          clockIn: {
            gte: startOfWeek,
            lte: endOfWeek,
          },
        },
        data: {
          status: TimeEntryStatus.APPROVED,
          approvedById: userId,
          approvedAt: new Date(),
        },
      });

      const updatedTimeEntries = await db.timeEntry.findMany({
        where: {
          departmentId,
          status: TimeEntryStatus.APPROVED,
          clockIn: {
            gte: startOfWeek,
            lte: endOfWeek,
          },
        },
      });

      return updatedTimeEntries;
    } catch (error) {
      console.error("Error approving all weekly time entries:", error);
      return null;
    }
  }

  async getWeeklyReport(userId: string, departmentId: string): Promise<any | null> {
    try {
      // const permittedDepartments = await departmentService.getUserPermittedDepartments(userId);

      // if (!permittedDepartments || !permittedDepartments.some(dept => dept.id === departmentId)) {
      //   console.error("Permission denied.");
      //   return null;
      // }

      const report = await db.timeEntry.findMany({
        where: {
          departmentId,
          userId,
        },
        include: {
          employee: true,
        },
      });

      return report;
    } catch (error) {
      console.error("Error fetching weekly report:", error);
      return null;
    }
  }

  async getActiveTimeEntry(userId: string): Promise<TimeEntry | null> {
    try {
      const timeEntry = await db.timeEntry.findFirst({
        where: {
          userId,
          clockOut: null,
        },
      });

      // const formttedTimeEntry = {
      //   ...timeEntry,
      //  hours: timeEntry?.hours

      return timeEntry;
    } catch (error) {
      console.error("Error fetching active time entry:", error);
      return null;
    }
  }

  async submitForApproval(userId: string, timeEntryId: string): Promise<TimeEntry | null> {
    try {
      const timeEntry = await db.timeEntry.findUnique({ where: { id: timeEntryId } });

      if (!timeEntry || timeEntry.userId !== userId) {
        console.error("Time entry not found or user does not own the time entry.");
        return null;
      }

      const updatedTimeEntry = await db.timeEntry.update({
        where: { id: timeEntryId },
        data: {
          status: TimeEntryStatus.PENDING,
        },
      });

      return updatedTimeEntry;
    } catch (error) {
      console.error("Error submitting time entry for approval:", error);
      return null;
    }
  }

  async submitAllForApproval(userId: string): Promise<TimeEntry[] | null> {
    try {
      const timeEntries = await db.timeEntry.findMany({
        where: {
          userId,
          status: TimeEntryStatus.NOTSUBMITTED,
        },
      });

      if (!timeEntries) {
        console.error("No time entries found.");
        return null;
      }

      await db.timeEntry.updateMany({
        where: {
          userId,
          status: TimeEntryStatus.NOTSUBMITTED,
        },
        data: {
          status: TimeEntryStatus.PENDING,
        },
      });

      return timeEntries;
    } catch (error) {
      console.error("Error submitting all time entries for approval:", error);
      return null;
    }
  }

  async approveAllByDepartment(userId: string, departmentId: string): Promise<TimeEntry[] | null> {
    try {
      const permittedDepartments = await departmentService.getUserPermittedDepartments(userId);

      if (!permittedDepartments || !permittedDepartments.some(dept => dept.id === departmentId)) {
        console.error("Permission denied.");
        return null;
      }

      const timeEntries = await db.timeEntry.findMany({
        where: {
          departmentId,
          OR: [{ status: TimeEntryStatus.PENDING },
          { status: TimeEntryStatus.NOTSUBMITTED }
          ]
        },
      });

      if (!timeEntries) {
        console.error("No time entries found.");
        return null;
      }

      await db.timeEntry.updateMany({
        where: {
          departmentId,
          OR: [{ status: TimeEntryStatus.PENDING },
          { status: TimeEntryStatus.NOTSUBMITTED }
          ]
        },
        data: {
          status: TimeEntryStatus.APPROVED,
          approvedById: userId,
          approvedAt: new Date(),
        },
      });

      return timeEntries;
    } catch (error) {
      console.error("Error approving all time entries by department:", error);
      return null;
    }
  }

}

export const timeEntryService = new TimeEntryService();
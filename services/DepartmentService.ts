import { DepartmentViewInterface } from "@/components/admin/Department/DeparmentManagement";
import { EmployeeDepartmentWithUser } from "@/components/admin/Department/DepartmentEmployeeListDialog";
import { currentRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Department, EmployeeDepartment, EmployeeDepartmentRole, UserRole } from "@prisma/client";
import Decimal from "decimal.js";


class DepartmentService {
  async createDepartment(userId: string, name: string, info?: string): Promise<DepartmentViewInterface | null> {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "ADMIN") {
      console.error("Permission denied: Only ADMIN can create a department.");
      return null;
    }

    try {
      const department = await db.department.create({
        data: { name, info },
      }) as DepartmentViewInterface;

      department.employeeCount = 0;
      department.totalCost = 0

      return department;
    } catch (error) {
      console.error("Error creating department:", error);
      return null;
    }
  }

  async getDepartmentById(id: string): Promise<Department | null> {
    try {
      const department = await db.department.findUnique({ where: { id } });
      return department;
    } catch (error) {
      console.error("Error getting department by id:", error);
      return null;
    }
  }

  async getDeparmentEmployees(id: string): Promise<EmployeeDepartmentWithUser[] | null> {
    try {
      const employees = await db.employeeDepartment.findMany({
        where: { departmentId: id },
        include: { employee: true },
      });

      return employees;
    } catch (error) {
      console.error("Error getting department employees:", error);
      return null;
    }
  }


  async updateDepartment(userId: string, id: string, name: string, info?: string): Promise<Department | null> {
    const user = await db.user.findUnique({ where: { id: userId } });
    const userDeparmentRole = await db.employeeDepartment.findFirst({
      where: {
        userId,
        departmentId: id,
      },
    });

    if (!user || (user.role !== UserRole.ADMIN && userDeparmentRole?.role !== EmployeeDepartmentRole.MANAGER)) {
      console.error("Permission denied: Only ADMIN or MANAGER can update a department.");
      return null;
    }

    try {
      const department = await db.department.update({
        where: { id },
        data: { name, info },
      });
      return department;
    } catch (error) {
      console.error("Error updating department:", error);
      return null;
    }
  }

  async deleteDepartment(userId: string, id: string): Promise<Department | null> {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "ADMIN") {
      console.error("Permission denied: Only ADMIN can delete a department.");
      return null;
    }

    try {
      const department = await db.department.delete({ where: { id } });
      return department;
    } catch (error) {
      console.error("Error deleting department:", error);
      return null;
    }
  }

  async addEmployeeToDepartment(userId: string, departmentId: string, employeeId: string, role: EmployeeDepartmentRole, rate: number, position?: string): Promise<DepartmentViewInterface | null> {
    const user = await db.user.findUnique({ where: { id: userId } });
    const userDeparmentRole = await db.employeeDepartment.findFirst({
      where: {
        userId,
        departmentId,
      },
    });
    if (!user || (user.role !== UserRole.ADMIN && userDeparmentRole?.role !== EmployeeDepartmentRole.MANAGER)) {
      console.error("Permission denied: Only ADMIN or MANAGER can add an employee to a department.");
      return null;
    }

    const department = await this.getDepartmentById(departmentId) as DepartmentViewInterface;

    if (!department) {
      console.error("Department not found.");
      return null;
    }



    try {
      const employeeExists = await db.employeeDepartment.findFirst({
        where: {
          userId: employeeId,
          departmentId,
        },
      });

      if (employeeExists) {
        // update
        await db.employeeDepartment.update({
          where: {
            userId_departmentId: {
              departmentId,
              userId: employeeId,
            },
          },
          data: {
            role,
            hourlyRate: new Decimal(rate),
            position,
          },
        });
      } else {

        await db.employeeDepartment.create({
          data: {
            departmentId,
            userId: employeeId,
            role,
            hourlyRate: new Decimal(rate),
            position,
          },
        });
      }

      department.employeeCount = await this.getTotalEmployeeCount(departmentId);
      const costs = await this.getEmployeeCost(departmentId);
      department.totalCost = costs.totalCost;
      department.totalHours = costs.totalHours;
      department.approvedHours = costs.approvedHours;


      return department;
    } catch (error) {
      console.error("Error adding employee to department:", error);
      return null;
    }
    return null;
  }


  async removeEmployeeFromDepartment(userId: string, departmentId: string, employeeId: string): Promise<DepartmentViewInterface | null> {
    try {
      return await db.$transaction(async (tx) => {
        // 1. Check user exists
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user) {
          console.error("User not found");
          return null;
        }

        // 2. Get user's department role
        const userDepartmentRole = await tx.employeeDepartment.findFirst({
          where: {
            userId,
            departmentId,
          },
        });

        // 3. Check permissions
        const hasPermission =
          user.role === UserRole.ADMIN ||
          userDepartmentRole?.role === EmployeeDepartmentRole.MANAGER ||
          userDepartmentRole?.role === EmployeeDepartmentRole.ADMIN;

        if (!hasPermission) {
          console.error("Permission denied: Only ADMIN or MANAGER can remove an employee");
          return null;
        }

        // 4. Check if employee exists in department
        const employeeInDepartment = await tx.employeeDepartment.findUnique({
          where: {
            userId_departmentId: {
              departmentId,
              userId: employeeId,
            },
          },
        });

        if (!employeeInDepartment) {
          console.error("Employee not found in department");
          return null;
        }

        // 5. Delete employee from department
        await tx.employeeDepartment.delete({
          where: {
            userId_departmentId: {
              departmentId,
              userId: employeeId,
            },
          },
        });

        // 6. Get updated department info
        const department = await tx.department.findUnique({
          where: { id: departmentId },
        }) as DepartmentViewInterface;

        if (!department) {
          console.error("Department not found");
          return null;
        }

        // 7. Update department stats
        department.employeeCount = await this.getTotalEmployeeCount(departmentId);
        const costs = await this.getEmployeeCost(departmentId);
        department.totalCost = costs.totalCost;
        department.totalHours = costs.totalHours;
        department.approvedHours = costs.approvedHours;

        return department;
      });
    } catch (error) {
      console.error("Error removing employee from department:", error);
      return null;
    }
  }

  async getTotalEmployeeCount(departmentId: string): Promise<number> {
    try {
      const count = await db.employeeDepartment.count({
        where: { departmentId },
      });
      return count;
    } catch (error) {
      console.error("Error getting total employee count:", error);
      return 0;
    }
  }

  async getEmployeeCost(departmentId: string): Promise<{
    totalHours: number,
    approvedHours: number,
    totalCost: number,
  }> {
    try {
      const department = await db.department.findFirst({
        where: { id: departmentId },
        select: {
          id: true,
          name: true,
          info: true,
          employees: {
            select: {
              hourlyRate: true,
            }
          },
          timeEntries: {
            select: {
              hours: true,
              status: true,
            }
          }
        }
      });


      let approvedHours = 0, totalHours = 0;
      if (department?.timeEntries) {
        for (const entry of department.timeEntries) {
          const hours = Number(entry.hours);
          totalHours += hours;
          if (entry.status === 'APPROVED') {
            approvedHours += hours;
          }
        }
      }
      const totalCost = department?.timeEntries.reduce((acc, entry) => {
        if (entry.status !== 'APPROVED') return acc;

        const hours = Number(entry.hours);
        const rate = Number(department.employees[0]?.hourlyRate || 0);

        // Calculate regular and overtime hours
        const regularHours = Math.min(hours, 40);
        const overtimeHours = Math.max(0, hours - 40);

        // Calculate cost with overtime at 1.5x
        const regularPay = regularHours * rate;
        const overtimePay = overtimeHours * (rate * 1.5);

        return acc + regularPay + overtimePay;
      }, 0) ?? 0;


      return {
        totalHours: Number(totalHours.toFixed(2)),
        approvedHours: Number(approvedHours.toFixed(2)),
        totalCost: Number(totalCost.toFixed(2)),
      };
    } catch (error) {
      console.error("Error getting employee cost:", error);
      return {
        totalHours: 0,
        approvedHours: 0,
        totalCost: 0,
      }
    }
  }

  async getAllDepartments(): Promise<DepartmentViewInterface[] | null> {
    try {
      const departments = await db.department.findMany({
        select: {
          id: true,
          name: true,
          info: true,
          createdAt: true,
          updatedAt: true,
          employees: {
            select: {
              hourlyRate: true,
            }
          },
          timeEntries: {
            select: {
              hours: true,
              status: true,
            }
          }
        }
      });

      return departments.map(dept => ({
        ...dept,
        employeeCount: dept.employees.length,
        totalCost: dept.employees.reduce((acc, emp) => acc + Number(emp.hourlyRate), 0),
        totalHours: dept.timeEntries.reduce((acc, entry) => acc + Number(entry.hours), 0),
        approvedHours: dept.timeEntries.reduce((acc, entry) => entry.status === 'APPROVED' ? acc + Number(entry.hours) : acc, 0),
      }));
    } catch (error) {
      console.error("Error getting all departments:", error);
      return null;
    }
  }

  async getEmployessByDepartmentIds(userId: string): Promise<DepartmentViewInterface[] | null> {
    const role = await currentRole();

    if (role === UserRole.ADMIN) {
      return this.getAllDepartments();
    }

    try {
      const departments = await db.employeeDepartment.findMany({
        where: {
          userId,
        },
      });

      const depertmentsInfo = await db.department.findMany({
        where: {
          id: { in: departments.map((dep) => dep.departmentId) },
        },
      }) as DepartmentViewInterface[];

      for (const department of depertmentsInfo) {
        department.employeeCount = await this.getTotalEmployeeCount(department.id);
        const costs = await this.getEmployeeCost(department.id);
        department.totalCost = costs.totalHours;
        department.approvedHours = costs.approvedHours;
      }

      return depertmentsInfo
    } catch (error) {
      console.error("Error getting permitted departments:", error);
      return null;
    }
  }

  async getUserPermittedDepartmentsInfo(userId: string): Promise<Department[] | null> {
    const role = await currentRole();

    if (role === UserRole.ADMIN) {
      return db.department.findMany();
    }

    try {
      const departments = await db.employeeDepartment.findMany({
        where: {
          userId,
          OR: [
            { role: EmployeeDepartmentRole.MANAGER },
            { role: EmployeeDepartmentRole.ADMIN },
          ],
        },
      });

      const depertmentsInfo = await db.department.findMany({
        where: {
          id: { in: departments.map((dep) => dep.departmentId) },
        },
      });

      return depertmentsInfo
    } catch (error) {
      console.error("Error getting permitted departments:", error);
      return null;
    }
  }

  async getUserPermittedDepartments(userId: string): Promise<DepartmentViewInterface[] | null> {
    const role = await currentRole();

    if (role === UserRole.ADMIN) {
      return this.getAllDepartments();
    }

    try {
      const departments = await db.employeeDepartment.findMany({
        where: {
          OR: [
            { userId, role: EmployeeDepartmentRole.MANAGER },
            { userId, role: EmployeeDepartmentRole.ADMIN },
          ],
        },
        include: { department: true },
      });



      const depertmentsInfo = await db.department.findMany({
        where: {
          id: { in: departments.map((dep) => dep.departmentId) },
        },
      }) as DepartmentViewInterface[];

      for (const department of depertmentsInfo) {
        department.employeeCount = await this.getTotalEmployeeCount(department.id);
        const costs = await this.getEmployeeCost(department.id);
        department.totalHours = costs.totalHours;
        department.approvedHours = costs.approvedHours;
        department.totalCost = costs.totalCost;
      }

      return depertmentsInfo
    } catch (error) {
      console.error("Error getting permitted departments:", error);
      return null;
    }
  }

  async updateEmployeeRole(userId: string, departmentId: string, employeeId: string, role: EmployeeDepartmentRole): Promise<EmployeeDepartment | null> {
    const user = await db.user.findUnique({ where: { id: userId } });
    const userDeparmentRole = await db.employeeDepartment.findFirst({
      where: {
        userId,
        departmentId,
      },
    });
    if (!user || (user.role !== UserRole.ADMIN && userDeparmentRole?.role !== EmployeeDepartmentRole.MANAGER)) {
      console.error("Permission denied: Only ADMIN or MANAGER can update employee role.");
      return null;
    }

    try {
      const employee = await db.employeeDepartment.update({
        where: {
          userId_departmentId: {
            departmentId,
            userId: employeeId,
          },
        },
        data: {
          role,
        },
      });
      return employee;
    } catch (error) {
      console.error("Error updating employee role:", error);
      return null;
    }
  }

  async getAllDepartmentsInfo(): Promise<Department[] | null> {
    try {
      const departments = await db.department.findMany();
      return departments;
    } catch (error) {
      console.error("Error getting all departments:", error);
      return null;
    }
  }

  async removeEmployeeFromDepartmentByRoleId(roleId: string): Promise<EmployeeDepartment | null> {
    try {
      const employee = await db.employeeDepartment.delete({
        where: { id: roleId },
      });

      return employee;
    } catch (error) {
      console.error("Error removing employee from department by role id:", error);
      return null;
    }
  }

  async getEmployeePermittedDepartmentsInfo(userId: string): Promise<Department[] | null> {
    const role = await currentRole();

    try {
      const departments = await db.employeeDepartment.findMany({
        where: {
          userId,
        },
      });

      const depertmentsInfo = await db.department.findMany({
        where: {
          id: { in: departments.map((dep) => dep.departmentId) },
        },
      });

      return depertmentsInfo
    } catch (error) {
      console.error("Error getting permitted departments:", error);
      return null;
    }
  }

  async updateEmployeeInfo(roleId: string, data: { role: EmployeeDepartmentRole; hourlyRate: number; position: string }): Promise<EmployeeDepartment | null> {
    try {
      const employee = await db.employeeDepartment.update({
        where: { id: roleId },
        data,
      });
      return employee;
    } catch (error) {
      console.error("Error updating employee info:", error);
      return null;
    }
  }
}

export const departmentService = new DepartmentService();
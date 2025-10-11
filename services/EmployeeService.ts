import { EmployeeViewInterface } from "@/components/admin/Employee/EmployeeManagement";
import { db } from "@/lib/db";
import { EmployeeDepartmentRole, UserRole, User } from "@prisma/client";

class EmployeeService {
    async getEmployeesByDepartment(userId: string, departmentId: string): Promise<User[] | null> {
        const user = await db.user.findUnique({ where: { id: userId } });
        const userDepartmentRole = await db.employeeDepartment.findFirst({
            where: {
                userId,
                departmentId,
            },
        });

        if (!user || (user.role !== UserRole.ADMIN && userDepartmentRole?.role !== EmployeeDepartmentRole.MANAGER)) {
            console.error("Permission denied: Only ADMIN or MANAGER can view employees of a department.");
            return null;
        }

        try {
            const employees = await db.user.findMany({
                where: {
                    departments: {
                        some: {
                            departmentId,
                        },
                    },
                },
            });
            return employees;
        } catch (error) {
            console.error("Error fetching employees by department:", error);
            return null;
        }
    }

    async getAllEmployees(userId: string): Promise<User[] | null> {
        const user = await db.user.findUnique({ where: { id: userId } });

        if (!user || user.role !== UserRole.ADMIN) {
            console.error("Permission denied: Only ADMIN can view all employees.");
            return null;
        }

        try {
            const employees = await db.user.findMany();
            return employees;
        } catch (error) {
            console.error("Error fetching all employees:", error);
            return null;
        }
    }

    async getEmployeesByDepartmentIds(userId: string, departmentIds: string[]): Promise<EmployeeViewInterface[] | null> {

        try {

            const employees_res = await db.user.findMany({
                where: {
                    departments: {
                        some: {
                            departmentId: {
                                in: departmentIds,
                            },
                        },
                    },
                },
                include: {
                    departments: true,
                },
            });


            return employees_res;
        } catch (error) {
            console.error("Error fetching employee by department:", error);
            return null;
        }
    }

}

export const employeeService = new EmployeeService();
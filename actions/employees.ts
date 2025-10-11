"use server";

import { departmentService } from "@/services/DepartmentService";
import { employeeService } from "@/services/EmployeeService";
import { EmployeeDepartmentRole } from "@prisma/client";

export const addEmployeeToDepartment = async (userId: string, departmentId: string, employeeId: string, role: EmployeeDepartmentRole, rate: number) => {
  const employee = await departmentService.addEmployeeToDepartment(userId, departmentId, employeeId, role, rate);
  if (employee) {
    return { success: "Employee added to department successfully!" };
  } else {
    return { error: "Failed to add employee to department." };
  }
};

export const removeEmployeeFromDepartment = async (userId: string, departmentId: string, employeeId: string) => {
  const employee = await departmentService.removeEmployeeFromDepartment(userId, departmentId, employeeId);
  if (employee) {
    return { success: "Employee removed from department successfully!" };
  } else {
    return { error: "Failed to remove employee from department." };
  }
};

export const updateEmployeeRole = async (userId: string, departmentId: string, employeeId: string, role: EmployeeDepartmentRole) => {
  const employee = await departmentService.updateEmployeeRole(userId, departmentId, employeeId, role);
  if (employee) {
    return { success: "Employee role updated successfully!" };
  } else {
    return { error: "Failed to update employee role." };
  }
};

export const getEmployessByDepartmentIds = async (userId: string, departmentIds: string[]) => {

    const employees = await employeeService.getEmployeesByDepartmentIds(userId, departmentIds);
    if (employees) {
        return { success: "Employees retrieved successfully!", employees };
    } else {
        return { error: "Failed to get employees." };
    }
};

export const updateEmployeeInfo = async (
  roleId: string,
  data: {
    role: EmployeeDepartmentRole;
    hourlyRate: number;
    position: string;
  }
) => {
  try {
    const updated = await departmentService.updateEmployeeInfo(roleId, data);

    if (updated) {
      return { success: "Employee information updated successfully!" };
    }
    return { error: "Failed to update employee information." };
  } catch (error) {
    console.error("Failed to update employee info:", error);
    return { error: "Something went wrong." };
  }
};
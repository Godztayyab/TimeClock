"use server";

import { departmentService } from "@/services/DepartmentService";
import { EmployeeDepartmentRole } from "@prisma/client";

export const createDepartment = async (userId: string, name: string, info?: string) => {
  const department = await departmentService.createDepartment(userId, name, info);
  if (department) {
    return { success: "Department created successfully!", department };
  } else {
    return { error: "Failed to create department." };
  }
};

export const updateDepartment = async (userId: string, id: string, name: string, info ?: string) => {
  const department = await departmentService.updateDepartment(userId, id, name, info);
  if (department) {
    return { success: "Department updated successfully!", department };
  } else {
    return { error: "Failed to update department." };
  }
}

export const getDeparmentById = async (departmentId: string) => {
  const department = await departmentService.getDepartmentById(departmentId);

  if (department) {
    return {success: "Department successfully fetched", department}
  } else {
    return { error: "Failed to fetch department." };
    
  }
}

export const deleteDepartment = async (userId: string, id: string) => {
  const department = await departmentService.deleteDepartment(userId, id);
  if (department) {
    return { success: "Department deleted successfully!" };
  } else {
    return { error: "Failed to delete department." };
  }
};

export const addEmployeeToDepartment = async (userId: string, departmentId: string, employeeId: string, role: EmployeeDepartmentRole, rate: number, position?: string) => {
  const department = await departmentService.addEmployeeToDepartment(userId, departmentId, employeeId, role, rate, position);
  if (department) {
    return { success: "Employee added to department successfully!", department };
  } else {
    return { error: "Failed to add employee to department." };
  }
};

export const removeEmployeeFromDepartment = async (userId: string, departmentId: string, employeeId: string) => {
  const department = await departmentService.removeEmployeeFromDepartment(userId, departmentId, employeeId);
  if (department) {
    return { success: "Employee removed from department successfully!", department };
  } else {
    return { error: "Failed to remove employee from department." };
  }
};

export const removeEmployeeFromDepartmentByRoleId = async (roleId: string) => {
  const department = await departmentService.removeEmployeeFromDepartmentByRoleId(roleId);
  if (department) {
    return { success: "Employee removed from department successfully!", department };
  } else {
    return { error: "Failed to remove employee from department." };
  }
}

export const getAllDepartments = async (userId: string) => {
  if (!userId) {
    return { error: "User ID is required." };
  }
  const departments = await departmentService.getUserPermittedDepartments(userId);
  if (departments) {
    return { departments: departments, success: "Departments retrieved successfully!" };
  } else {
    return { error: "Failed to get departments." };
  }
}

export const getPermittedDepartmentsInfo = async (userId: string) => {
  if (!userId) {
    return { error: "User ID is required." };
  }
  const departments = await departmentService.getUserPermittedDepartmentsInfo(userId);
  if (departments) {
    return { departments: departments, success: "Departments retrieved successfully!" };
  } else {
    return { error: "Failed to get departments." };
  }
}

export const getAllDepartmentsInfo = async () => {
  const departments = await departmentService.getAllDepartmentsInfo();
  if (departments) {
    return { departments: departments, success: "Departments retrieved successfully!" };
  } else {
    return { error: "Failed to get departments." };
  }
}

export const getDepartmentEmployees = async (userId: string, departmentId: string) => {
  if (!userId) {
    return { error: "User ID is required." };
  }

  const permittedDepartments = await departmentService.getUserPermittedDepartments(userId);

  if (!permittedDepartments || !permittedDepartments.some(department => department.id === departmentId)) {
    return { error: "User does not have permission to view this department." };
  }

  const employees = await departmentService.getDeparmentEmployees(departmentId);
  if (employees) {
    return { employees: employees, success: "Employees retrieved successfully!" };
  } else {
    return { error: "Failed to get employees." };
  }
}

export const getEmployeePermittedDepartmentsInfo = async (userId: string, employeeId: string) => {
  if (!userId) {
    return { error: "User ID is required." };
  }

  const departments = await departmentService.getEmployeePermittedDepartmentsInfo(employeeId);
  if (departments) {
    return { departments: departments, success: "Departments retrieved successfully!" };
  } else {
    return { error: "Failed to get departments." };
  }
}

export const getUserPermittedDepartmentsInfoWithRates = async (userId: string) => {
  if (!userId) {
    return { error: "User ID is required." };
  }
  const departments = await departmentService.getUserPermittedDepartmentsInfoWithRates(userId);
  if (departments) {
    return { departments: departments, success: "Departments retrieved successfully!" };
  } else {
    return { error: "Failed to get departments." };
  }
}



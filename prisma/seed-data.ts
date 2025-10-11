import { UserRole, EmployeeDepartmentRole } from '@prisma/client'

export const DEPARTMENTS = [
  {
    name: 'Engineering',
    info: 'Software development team',
    hourlyRate: 45.00
  },
  {
    name: 'Marketing',
    info: 'Marketing and communications',
    hourlyRate: 35.00
  },
  {
    name: 'Human Resources',
    info: 'HR and recruitment',
    hourlyRate: 40.00
  }
]

export const USERS = [
  {
    email: 'admin@timeclock.com',
    name: 'Admin User',
    type: "Admin",
    password: 'admin123',
    role: UserRole.ADMIN,
    description: "Full access to all features"
  },
  {
    email: 'john@timeclock.com',
    name: 'John Doe',
    type: "Employee",
    password: 'employee123',
    role: UserRole.USER,
    description: "Basic time tracking access"

  },
  {
    type: "Manager",
    email: 'manager@timeclock.com',
    name: 'Manager User',
    password: 'manager123',
    role: UserRole.USER,
    description: "Department management access"
  }
]

export const ASSIGNMENTS = [
  {
    departmentIndex: 0,
    userIndex: 1,
    role: EmployeeDepartmentRole.EMPLOYEE,
    position: 'Software Engineer'
  }
]
'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Department, EmployeeDepartment, EmployeeDepartmentRole, User } from '@prisma/client'
import { getDepartmentEmployees, removeEmployeeFromDepartmentByRoleId } from '@/actions/department'
import { useToast } from '@/hooks/use-toast'
import { useCurrentUser } from '@/hooks/use-current-user'
import { MoreHorizontal, Search, Edit, Trash } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { UpdateEmployeeDialog } from './UpdateEmployeeDialog'
import { updateEmployeeInfo } from '@/actions/employees'
import Decimal from 'decimal.js'

export interface DepartmentEmployeeListDialogProps {
    department: Department
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export interface EmployeeDepartmentWithUser extends EmployeeDepartment {
    employee: User
}

export default function DepartmentEmployeeListDialog({ 
    department, 
    isOpen, 
    onOpenChange 
}: DepartmentEmployeeListDialogProps) {
    const [employees, setEmployees] = useState<EmployeeDepartmentWithUser[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState<EmployeeDepartmentRole | 'ALL'>('ALL')
    const { toast } = useToast()
    const user = useCurrentUser()
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDepartmentWithUser | null>(null)

    useEffect(() => {
        const loadEmployees = async () => {
            if (!user?.id) return
            setLoading(true)
            const response = await getDepartmentEmployees(user.id, department.id)
            if (response.employees) {
               
                setEmployees(response.employees)


            } else {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: response.error || 'Failed to load employees'
                })
            }
            setLoading(false)
        }

        if (isOpen) {
            loadEmployees()
        }
    }, [department.id, isOpen, user?.id])

    const handleRemoveEmployee = async (roleId: string) => {
        if (!user?.id) return
        const response = await removeEmployeeFromDepartmentByRoleId(roleId)
        if (response.success) {
            setEmployees(employees.filter(emp => emp.id !== roleId))
            toast({
                title: 'Success',
                description: response.success
            })
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: response.error
            })
        }
    }

    const handleUpdateEmployee = async (roleId: string, data: { role: EmployeeDepartmentRole; hourlyRate: number; position: string }) => {
        const response = await updateEmployeeInfo(roleId, data)
        if (response.success) {
            setEmployees(employees.map(emp => 
                emp.id === roleId 
                ? { ...emp, role: data.role, hourlyRate: new Decimal(data.hourlyRate), position: data.position }
                : emp
            ))
            toast({
                title: 'Success',
                description: response.success
            })
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: response.error
            })
        }
    }

    const filteredEmployees = employees.filter(employee => {
        const matchesSearch = (employee.employee.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
                            (employee.employee.email ?? '').toLowerCase().includes(search.toLowerCase())
        const matchesRole = roleFilter === 'ALL' || employee.role === roleFilter
        return matchesSearch && matchesRole
    })

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[900px]">
                <DialogHeader>
                    <DialogTitle>Employees in {department.name}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search employees..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        <Select
                            value={roleFilter}
                            onValueChange={(value) => setRoleFilter(value as EmployeeDepartmentRole | 'ALL')}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Roles</SelectItem>
                                {Object.values(EmployeeDepartmentRole).map(role => (
                                    <SelectItem key={role} value={role}>
                                        {role}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Position(Role)</TableHead>
                                    <TableHead>Rate</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <LoadingSpinner />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredEmployees.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            No employees found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredEmployees.map((employee) => (
                                        <TableRow key={employee.id}>
                                            <TableCell className="font-medium">{employee.employee.name}</TableCell>
                                            <TableCell>{employee.employee.email}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {employee.position}({employee.role})
                                                </Badge>
                                            </TableCell>
                                            <TableCell>${Number(employee.hourlyRate)}/hr</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => setSelectedEmployee(employee)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit Role/Rate
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleRemoveEmployee(employee.id)}
                                                            className="text-red-600"
                                                        >
                                                            <Trash className="mr-2 h-4 w-4" />
                                                            Remove
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
                {selectedEmployee && (
                    <UpdateEmployeeDialog
                        isOpen={!!selectedEmployee}
                        onOpenChange={(open) => !open && setSelectedEmployee(null)}
                        employee={selectedEmployee}
                        onUpdate={handleUpdateEmployee}
                    />
                )}
            </DialogContent>
        </Dialog>
    )
}
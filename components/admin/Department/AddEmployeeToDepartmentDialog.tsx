import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Department, User, EmployeeDepartmentRole } from '@prisma/client';
import { addEmployeeToDepartment, removeEmployeeFromDepartment } from '@/actions/department';
import { searchUsers } from '@/data/user';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUser } from '@/hooks/use-current-user';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmployeeListItem } from './EmployeeListItem';

import { useDebouncedCallback } from 'use-debounce';


export default function AddEmployeeToDepartmentDialog({ isOpen, department, onOpenChange }: AddEmployeeToDepartmentDialogProps) {
    const [employees, setEmployees] = useState<UserWithDepartments[]>([]);
    const [search, setSearch] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const { toast } = useToast();
    const user = useCurrentUser();



    const debouncedSearch = useDebouncedCallback(async (query: string) => {
        if (!query.trim()) {
            setEmployees([])
            return
        }
        setLoading(true)
        try {
            const users = await searchUsers(query)
            setEmployees(users || [])
        } catch{
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to search employees'
            })
        } finally {
            setLoading(false)
        }
    }, 500)

    useEffect(() => {
        debouncedSearch(search)

    }, [search, debouncedSearch])


    const handleAddEmployee = async ({ employeeId, role, rate, position }: HandleAddEmployeeParams): Promise<void> => {
        if (!employeeId || !role || !rate || !position) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please fill all fields',
            })
            return;
        }

        if (!user || !user.id) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'You must be logged in to add an employee',
            })
            return;
        }

        const response = await addEmployeeToDepartment(user.id, department.id, employeeId, role, rate, position);
        if ('success' in response) {
            toast({
                title: 'Success',
                description: response.success,
            })
            onOpenChange(false);
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: response.error,
            })
        }
    };

    const handleRemoveEmployeeFromDepartment = async ({ employeeId, departmentId }: { employeeId: string, departmentId: string }) => {
        if (!user || !user.id) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'You must be logged in to remove an employee',
            })
            return;
        }

        try {
            const updatedDepartment = await removeEmployeeFromDepartment(user.id, departmentId, employeeId)
            if (updatedDepartment.error) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: updatedDepartment.error
                })

                return
            }

            if (updatedDepartment.success) {

                setEmployees(employees.filter((employee) => 
                    employee.id !== employeeId || 
                    !employee.departments.some((employeeDepartment) => employeeDepartment.departmentId === departmentId)
                ))
                toast({
                    title: 'Success',
                    description: updatedDepartment.success
                })
            }
        } catch {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to remove employee'
            })
        }
    }
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Add Employee to {department.name}</DialogTitle>
                    <DialogDescription>
                        Search employees by name or email
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="relative">
                        <Input
                            placeholder="Search employees..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full"
                        />
                        {loading && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <LoadingSpinner />
                            </div>
                        )}
                    </div>

                    {search ? (
                        <ScrollArea className="h-[400px]">
                            {employees.length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    No employees found
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {employees.map((employee) => (
                                        <EmployeeListItem
                                            key={employee.id}
                                            employee={employee}
                                            department={department}
                                            onAdd={handleAddEmployee}
                                            onRemove={handleRemoveEmployeeFromDepartment}
                                        />
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    ) : (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            Enter a name or email to search
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}


export interface AddEmployeeToDepartmentDialogProps {
    isOpen: boolean;
    department: Department;
    onOpenChange: (isOpen: boolean) => void;
}

export interface HandleAddEmployeeParams {
    employeeId: string;
    role: EmployeeDepartmentRole;
    rate: number;
    position?: string;
}

export interface UserWithDepartments extends User {
    departments: {
        id: string;
        departmentId: string;
    }[];
}

import { EmployeeDepartmentRole, Department } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { HandleAddEmployeeParams, UserWithDepartments } from './AddEmployeeToDepartmentDialog'
import { useCurrentUser } from '@/hooks/use-current-user'
import { Badge } from '@/components/ui/badge'

interface EmployeeListItemProps {
    employee: UserWithDepartments
    department: Department
    onAdd: (params: HandleAddEmployeeParams) => Promise<void>
    onRemove: (params: { employeeId: string, departmentId: string }) => Promise<void>
}

export function EmployeeListItem({ employee, department, onAdd, onRemove }: EmployeeListItemProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [rate, setRate] = useState("15")
    const [role, setRole] = useState<EmployeeDepartmentRole>("EMPLOYEE")
    const [position, setPosition] = useState("")
    const user = useCurrentUser();

    const isInDepartment = employee.departments.some(
        d => d.departmentId === department.id
    )

    const handleQuickAdd = async () => {
        setLoading(true)
        await onAdd({
            employeeId: employee.id,
            role,
            rate: Number(rate),
            position
        })
        setLoading(false)
        setIsEditing(false)
    }

    return (
        <div className="p-3 border rounded-lg mb-2 hover:bg-gray-50">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarFallback>
                            {employee.name?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                        {employee.image && <AvatarImage src={employee.image} />}
                    </Avatar>
                    <div>
                        <div className="font-medium">{employee.name}
                            {employee.id === user?.id && <Badge className="ml-1" variant={"secondary"}>You</Badge>}
                        </div>
                        <div className="text-sm text-muted-foreground">{employee.email}</div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isInDepartment ? (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onRemove({
                                employeeId: employee.id,
                                departmentId: department.id
                            })}
                        >
                            Remove
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                {isEditing ? 'Cancel' : 'Add'}
                            </Button>
                            {isEditing && (
                                <Button
                                    size="sm"
                                    onClick={handleQuickAdd}
                                    disabled={loading}
                                >
                                    Save
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {isEditing && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Role</label>
                        <Select
                            value={role}
                            onValueChange={(value: EmployeeDepartmentRole) => setRole(value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                                <SelectItem value="MANAGER">Manager</SelectItem>
                                <SelectItem value="EMPLOYEE">Employee</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1 block">Hourly Rate ($)</label>
                        <Input
                            type="number"
                            placeholder="Hourly rate"
                            value={rate}
                            onChange={(e) => setRate(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1 block">Position</label>
                        <Input
                            placeholder="Position"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
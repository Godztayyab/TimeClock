import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserMinus, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Department, EmployeeDepartmentRole } from '@prisma/client';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { HandleAddEmployeeParams, UserWithDepartments } from './AddEmployeeToDepartmentDialog';

interface EmployeeCardProps {
    employee: UserWithDepartments;
    department: Department;
    onAdd: (params: HandleAddEmployeeParams) => void;
    onRemove: (params: { employeeId: string, departmentId: string }) => void;
}

// Separate Employee Card Component for better organization
const EmployeeCard = ({
    employee,
    department,
    onAdd,
    onRemove
}: EmployeeCardProps) => {
    const currentUser = useCurrentUser();

    return (
        <Card className="m-2">
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h4 className="font-semibold">{employee.name}</h4>
                        <p className="text-sm text-muted-foreground">{employee.email}</p>
                    </div>
                    <div className="flex gap-2">
                        {employee.departments.map((dept) => (
                            <Badge
                                key={dept.id}
                                variant={dept.departmentId === department.id ? "default" : "secondary"}
                            >
                                {dept.departmentId === department.id ? 'Employee' : 'Other Department'}
                            </Badge>
                        ))}
                        {employee.id === currentUser?.id && (
                            <Badge variant="destructive">You</Badge>
                        )}
                    </div>
                </div>

                <div className="mt-4 space-y-6">
                    {employee.departments.some(dept => dept.departmentId === department.id) ? (
                        <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
                            <div className="text-sm text-muted-foreground">
                                Already a member of this department
                            </div>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => onRemove({ employeeId: employee.id, departmentId: department.id })}
                            >
                                <UserMinus className="mr-2 h-4 w-4" />
                                Remove
                            </Button>
                        </div>
                    ) : (
                        <form
                            className="space-y-4"
                            onSubmit={(e) => {
                                e.preventDefault()
                                const formData = new FormData(e.currentTarget)
                                onAdd({
                                    employeeId: employee.id,
                                    role: formData.get('role') as EmployeeDepartmentRole,
                                    rate: parseFloat(formData.get('rate') as string),
                                    position: formData.get('position') as string
                                })
                            }}
                        >
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Role</label>
                                    <Select name="role" defaultValue={EmployeeDepartmentRole.EMPLOYEE}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(EmployeeDepartmentRole).map((role) => (
                                                <SelectItem key={role} value={role}>
                                                    {role.charAt(0) + role.slice(1).toLowerCase()}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Position</label>
                                    <Input
                                        name="position"
                                        placeholder="e.g., Senior Developer"
                                        required
                                    />
                                </div>

                                <div className="space-y-2 sm:col-span-2">
                                    <label className="text-sm font-medium">Hourly Rate ($)</label>
                                    <Input
                                        name="rate"
                                        type="number"
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button type="submit" className="w-full sm:w-auto">
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Add to Department
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}


export default EmployeeCard;
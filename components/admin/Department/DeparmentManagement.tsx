'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreVertical, Users, Clock, Settings, Plus, Trash, Edit, RefreshCcw, PlusCircle, TimerOff } from 'lucide-react'
import { Department, UserRole } from '@prisma/client'
import { deleteDepartment, getAllDepartments } from '@/actions/department'
import { useToast } from '@/hooks/use-toast'
import { useCurrentUser } from '@/hooks/use-current-user'
import AddEmployeeToDepartmentDialog from './AddEmployeeToDepartmentDialog'
import { AddDepartmentDialog } from './AddDepartmentDialog'
import DepartmentEmployeeListDialog from './DepartmentEmployeeListDialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { EditDepartmentDialog } from './EditDepartmentDialog'
import { DepartmentSettingsDialog } from './DepartmentSettingsDialog'
import { TimeOffRequestsDialog } from '@/components/time-off/TimeOffRequestsDialog'

interface DepartmentManagementProps {
    departments: DepartmentViewInterface[]
}

export function DepartmentManagement({ departments: d }: DepartmentManagementProps) {
    const [departments, setDepartments] = useState(d);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('')
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
    const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false)
    const [isAddEmployeeDialogOpen, setIsAddEmployeeDialogOpen] = useState(false)
    const [isAddDepartmentDialogOpen, setIsAddDepartmentDialogOpen] = useState(false)
    const [isEmployeeListDialogOpen, setIsEmployeeListDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
    const [isTimeOffDialogOpen, setIsTimeOffDialogOpen] = useState(false)

    const { toast } = useToast()
    const user = useCurrentUser()


    const filteredDepartments = departments.filter(department =>
        department.name.toLowerCase().includes(search.toLowerCase())
    )

    const reloadDepartments = async () => {
        if (!user || !user.id) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to add a department' })
            return
        }

        setLoading(true)
        const updatedDepartments = await getAllDepartments(user.id);
        setDepartments(updatedDepartments.departments ?? [])
        setLoading(false)
    }

    const handleRemoveDepartment = async (id: string) => {
        if (!user || user.id === undefined) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'You must be logged in to remove a department'
            })
            return
        }
        try {
            const message = await deleteDepartment(user.id, id)
            if (message.error) {
                toast({ variant: 'destructive', title: 'Error', description: message.error })
                return
            }

            setDepartments(departments.filter(dept => dept.id !== id.toString()))
            setIsRemoveDialogOpen(false)
            toast({ title: 'Success', description: message.success })
        } catch {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to remove department' })
        }
    }

    const handleUpdateDepartment = (updated: Department) => {
        setDepartments(departments.map(dept =>
            dept.id === updated.id ? { ...dept, ...updated } : dept
        ))
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">Department Management</CardTitle>
                        <CardDescription>Manage your organization&apos;s departments and employees</CardDescription>
                    </div>
                    {user?.role === UserRole.ADMIN && <Button onClick={() => setIsAddDepartmentDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Department
                    </Button>}
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-6 flex items-center justify-between">
                    <Input
                        placeholder="Search departments..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm"
                    />
                    <Button variant="outline" onClick={reloadDepartments}>
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>

                <div className="grid gap-6">
                    {loading ? (
                        <div className="text-center py-8">Loading departments...</div>
                    ) : filteredDepartments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No departments found</div>
                    ) : (
                        filteredDepartments.map((department) => (
                            <Card key={department.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-semibold">{department.name}</h3>
                                            <p className="text-sm text-muted-foreground">{department.info}</p>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem onClick={() => { setSelectedDepartment(department); setIsAddEmployeeDialogOpen(true) }}>
                                                    <PlusCircle className="w-4 h-4 mr-2" />
                                                    Add Employee
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => { setSelectedDepartment(department); setIsEmployeeListDialogOpen(true) }}>
                                                    <Users className="w-4 h-4 mr-2" />

                                                    View Employees
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => {
                                                    setSelectedDepartment(department)
                                                    setIsEditDialogOpen(true)
                                                }}>
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit Department
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600" onClick={() => { setSelectedDepartment(department); setIsRemoveDialogOpen(true); }}>
                                                    <Trash className="w-4 h-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                                        <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 shadow-sm hover:shadow-md transition-all">
                                            <p className="text-sm text-orange-700 font-medium mb-1">Employees</p>
                                            <p className="text-2xl font-bold text-orange-900">{department.employeeCount}</p>
                                        </div>
                                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-all">
                                            <p className="text-sm text-blue-700 font-medium mb-1">Budget</p>
                                            <p className="text-2xl font-bold text-blue-900">${department.totalCost.toLocaleString()}</p>
                                        </div>
                                        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 shadow-sm hover:shadow-md transition-all">
                                            <p className="text-sm text-purple-700 font-medium mb-1">Approved Hours</p>
                                            <p className="text-2xl font-bold text-purple-900">{department.approvedHours}</p>
                                        </div>
                                        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 shadow-sm hover:shadow-md transition-all">
                                            <p className="text-sm text-green-700 font-medium mb-1">Total Hours</p>
                                            <p className="text-2xl font-bold text-green-900">{department.totalHours}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-4 flex-wrap">
                                        <Button variant={'outline'} onClick={() => { setSelectedDepartment(department); setIsAddEmployeeDialogOpen(true) }}
                                            className='text-yellow-600' size="sm"
                                        >
                                            <PlusCircle className="w-4 h-4 mr-2" />
                                            Add Employee
                                        </Button>
                                        <Button variant="outline" size="sm" className="text-blue-600" onClick={() => { setSelectedDepartment(department); setIsEmployeeListDialogOpen(true) }}>
                                            <Users className="w-4 h-4 mr-2" />
                                            View Employees
                                        </Button>
                                        <Button variant="outline" size="sm" className="text-red-600" onClick={() => { setSelectedDepartment(department); setIsTimeOffDialogOpen(true) }}>
                                            <TimerOff className="w-4 h-4 mr-2" />
                                            View TimeOff Requests
                                        </Button>
                                        <TooltipProvider>
                                            <Tooltip delayDuration={0} disableHoverableContent>                                                <TooltipTrigger asChild>
                                                <Button variant="outline" size="sm" className="text-orange-600 disabled:cursor-not-allowed">
                                                    <Clock className="w-4 h-4 mr-2" />
                                                    Manage Timesheets
                                                </Button>
                                            </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>You can manage the timesheets from Employee Management tab</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-green-600"
                                            onClick={() => {
                                                setSelectedDepartment(department)
                                                setIsSettingsDialogOpen(true)
                                            }}
                                        >
                                            <Settings className="w-4 h-4 mr-2" />
                                            Settings
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </CardContent>
            {selectedDepartment && (
                <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Remove</DialogTitle>
                        </DialogHeader>
                        <p>Are you sure you want to remove the department &quot;{selectedDepartment.name}&quot;?</p>
                        <div className="flex justify-end gap-4 mt-4">
                            <Button variant="outline" onClick={() => setIsRemoveDialogOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={() => handleRemoveDepartment(selectedDepartment.id)}>Remove</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {selectedDepartment && (
                <AddEmployeeToDepartmentDialog department={selectedDepartment} isOpen={isAddEmployeeDialogOpen} onOpenChange={val => {
                    setIsAddEmployeeDialogOpen(val);
                    reloadDepartments();
                }
                } />
            )}
            {
                selectedDepartment && (
                    <DepartmentEmployeeListDialog department={selectedDepartment} isOpen={isEmployeeListDialogOpen} onOpenChange={val => setIsEmployeeListDialogOpen(val)} />
                )
            }
            <AddDepartmentDialog isOpen={isAddDepartmentDialogOpen} onClose={() => setIsAddDepartmentDialogOpen(false)} setDepartments={
                setDepartments} />
            {selectedDepartment && (
                <EditDepartmentDialog
                    department={selectedDepartment}
                    isOpen={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                    onUpdate={handleUpdateDepartment}
                />
            )}
            {selectedDepartment && (
                <DepartmentSettingsDialog
                    department={selectedDepartment}
                    isOpen={isSettingsDialogOpen}
                    onOpenChange={setIsSettingsDialogOpen}
                />
            )}

            {selectedDepartment && (
                <TimeOffRequestsDialog
                    department={selectedDepartment}
                    isOpen={isTimeOffDialogOpen}
                    onOpenChange={setIsTimeOffDialogOpen}
                />
            )}
        </Card>
    )
}

export default DepartmentManagement;


export interface DepartmentViewInterface extends Department {
    employeeCount: number,
    totalCost: number,
    approvedHours: number
    totalHours: number
}
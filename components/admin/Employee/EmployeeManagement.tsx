'use client'
import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmployeeDepartment, User, EmployeeDepartmentRole } from '@prisma/client'
import { getEmployessByDepartmentIds, removeEmployeeFromDepartment, updateEmployeeInfo } from '@/actions/employees'
import { useToast } from '@/hooks/use-toast'
import { useCurrentUser } from '@/hooks/use-current-user'
import { ReloadIcon } from '@radix-ui/react-icons'
import { ChevronDown } from 'lucide-react'
import { Badge } from '../../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../ui/collapsible'
import TimeSheetManagement from '../TimeSheet/TimeSheetManagement'
import ScheduleManagement from '../TimeSheet/ScheduleManagement'
import { useTimeEntry } from '@/_context/TimeEntryContext'
import { Pencil, Trash2 } from 'lucide-react'
import { EmployeeDepartmentWithUser } from '../Department/DepartmentEmployeeListDialog'
import { UpdateEmployeeDialog } from '../Department/UpdateEmployeeDialog'
import Decimal from 'decimal.js'



export interface EmployeeViewInterface extends User {
  departments: EmployeeDepartment[]
}

interface EmployeeManagementProps {
  employees: EmployeeViewInterface[]
}

export function EmployeeManagement({ employees: _e }: EmployeeManagementProps) {
  const [employees, setEmployees] = useState(_e)
  const [search, setSearch] = useState('')
  const { toast } = useToast()
  const user = useCurrentUser()
  const [loading, setLoading] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const { departments, permittedDepartments } = useTimeEntry();
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [selectedDeptEmployee, setSelectedDeptEmployee] = useState<EmployeeDepartmentWithUser | null>(null)

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const matchesSearch = search.trim() === '' ||
        employee.name?.toLowerCase().includes(search.toLowerCase()) ||
        employee.email?.toLowerCase().includes(search.toLowerCase())

      const matchesDepartment = selectedDepartment === 'all' ||
        employee.departments.some(dept => dept.departmentId === selectedDepartment)

      return matchesSearch && matchesDepartment
    })
  }, [employees, search, selectedDepartment])

  const reloadEmployee = async () => {
    if (!user || !user.id) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to add an employee',
      })

      return;
    }

    setLoading(true)
    const response = await getEmployessByDepartmentIds(user.id, permittedDepartments.map(dept => dept.id))
    if ('employees' in response) {
      setEmployees(response.employees ?? [])
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: response.error,
      })
    }
    setLoading(false)
  }

  const handleRemoveEmployee = async (employeeId: string, departmentId: string) => {
    if (!user || !user.id) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to remove an employee',
      })
      return
    }

    const response = await removeEmployeeFromDepartment(user.id, departmentId, employeeId.toString())
    if ('success' in response) {
      toast({
        title: 'Success',
        description: response.success,
      })
      setEmployees(employees.filter(emp => emp.id !== employeeId))
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: response.error,
      })
    }
  }

  const handleUpdateEmployee = async (roleId: string, data: { role: EmployeeDepartmentRole; hourlyRate: number; position: string }) => {
    const response = await updateEmployeeInfo(roleId, data)
    if (response.success) {
      setEmployees(prevEmployees => 
        prevEmployees.map(emp => {
          if (emp.id === selectedDeptEmployee?.employee.id) {
            return {
              ...emp,
              departments: emp.departments.map(dept => {
                if (dept.departmentId === selectedDeptEmployee.departmentId) {
                  return {
                    ...dept,
                    role: data.role,
                    hourlyRate: new Decimal(data.hourlyRate),
                    position: data.position
                  }
                }
                return dept
              })
            }
          }
          return emp
        })
      )

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Employee Management</CardTitle>
            <CardDescription>Manage employees across departments</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button onClick={reloadEmployee} variant="outline" disabled={loading}>
              {loading ? 'Reloading...' :

                (<><ReloadIcon />Refresh </>)}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-4 justify-between">
            <Input
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
            <div className='flex gap-2'>
              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Departments
                    <span className="ml-2 text-muted-foreground">
                      ({employees.length})
                    </span>
                  </SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>
                      <div className="flex justify-between items-center w-full">
                        <span>{dept.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({employees.filter(e =>
                            e.departments.some(d => d.departmentId === dept.id)
                          ).length})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedDepartment && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setSelectedDepartment('all');
                  }}
                >
                  Clear Filter
                </Button>
              )}
            </div>
          </div>

          {/* Employee List */}
          {loading ? (
            <div className="text-center py-8">Loading employees...</div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No employees found</div>
          ) : (
            filteredEmployees.map((employee) => (
              <Collapsible key={employee.id} className="border rounded-lg">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4 hover:bg-slate-50">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-medium">{employee.name}</h3>
                        <p className="text-sm text-muted-foreground">{employee.email}</p>
                      </div>
                      <div className="flex gap-2">
                        {employee.departments.map(dept => (
                          <Badge key={dept.departmentId} variant="secondary">
                            {departments.find(d => d.id === dept.departmentId)?.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="p-4 border-t">
                    <Tabs defaultValue="departments">
                      <TabsList className="mb-4">
                        <TabsTrigger value="departments">Departments & Roles</TabsTrigger>
                        <TabsTrigger value="schedule">Schedule</TabsTrigger>
                        <TabsTrigger value="timesheet">Timesheet</TabsTrigger>
                      </TabsList>

                      <TabsContent value="departments">
                        <div className="grid gap-4">
                          {employee.departments.map(dept => (
                            <div key={dept.departmentId}
                              className="overflow-hidden bg-white rounded-lg border border-gray-100 hover:shadow-md transition-all"
                            >
                              <div className="flex items-center justify-between p-4 border-b">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-lg font-medium">
                                      {departments.find(d => d.id === dept.departmentId)?.name}
                                    </h4>
                                    <Badge variant={
                                      dept.role === 'ADMIN' ? 'default' :
                                        dept.role === 'MANAGER' ? 'secondary' : 'outline'
                                    }>
                                      {dept.role}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {dept.position || 'No position set'}
                                  </p>
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedDeptEmployee({
                                        ...dept,
                                        employee: employee,
                                        id: dept.id
                                      })
                                      setIsUpdateDialogOpen(true)
                                    }}
                                  >
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edit Role
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:bg-red-50"
                                    onClick={() => handleRemoveEmployee(employee.id, dept.departmentId)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="p-4 grid grid-cols-3 gap-4">
                                <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                                  <p className="text-sm text-orange-600 font-medium">Role Access</p>
                                  <p className="mt-1 text-sm">
                                    {dept.role === 'ADMIN' ? 'Full department access' :
                                      dept.role === 'MANAGER' ? 'Can manage schedules & employees' :
                                        'Basic employee access'}
                                  </p>
                                </div>

                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                  <p className="text-sm text-blue-600 font-medium">Hourly Rate</p>
                                  <p className="mt-1 text-2xl font-semibold text-blue-700">
                                    ${Number(dept.hourlyRate).toFixed(2)}
                                  </p>
                                </div>

                                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                  <p className="text-sm text-green-600 font-medium">Position</p>
                                  <p className="mt-1 text-2xl font-semibold text-green-700">
                                    {dept.position || 'No position set'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {selectedDeptEmployee && (
                          <UpdateEmployeeDialog
                            isOpen={isUpdateDialogOpen}
                            onOpenChange={setIsUpdateDialogOpen}
                            employee={selectedDeptEmployee}
                            onUpdate={handleUpdateEmployee}
                          />
                        )}
                      </TabsContent>

                      <TabsContent value="schedule">
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="font-medium mb-4">Weekly Schedule</h4>
                          {/* Schedule component here */}
                          <ScheduleManagement userId={employee.id} employeeDepartments={employee.departments} />
                        </div>
                      </TabsContent>

                      <TabsContent value="timesheet">
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="font-medium mb-4">Recent Timesheets</h4>
                          <TimeSheetManagement userId={employee.id} employeeDepartments={employee.departments} />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
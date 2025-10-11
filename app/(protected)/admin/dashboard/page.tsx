import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmployeeViewInterface, EmployeeManagement } from '@/components/admin/Employee/EmployeeManagement'
import DepartmentManagement, { DepartmentViewInterface } from '@/components/admin/Department/DeparmentManagement'
import { currentUser } from '@/lib/auth'
import { getAllDepartments } from '@/actions/department'
import { getEmployessByDepartmentIds } from '@/actions/employees'
import { Suspense } from 'react'
import { DepartmentManagementSkeleton, EmployeeManagementSkeleton } from '@/components/skeleton/components/AdminSkeleton'

export default async function SupervisorDashboard({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const user = await currentUser();
  let departments: DepartmentViewInterface[] = [];
  let employees: EmployeeViewInterface[] = [];
  const activeTab = searchParams?.tab ?? 'departments';


  if (user && user.id) {
    const departments_resp = await getAllDepartments(user.id);
    if (departments_resp && departments_resp.departments) {
      departments = departments_resp.departments;
    }
  }
  if (departments && departments.length > 0) {
    const employees_resp = (await getEmployessByDepartmentIds(user?.id ?? '', departments.map(department => department.id)));
    if (employees_resp && employees_resp.employees) {
      employees = employees_resp.employees;
    }
  }


  return (
    <div className="space-y-6 my-6 container mx-auto">
      <Card className="bg-gradient-to-r from-orange-400 to-pink-500">
        <CardHeader>
          <CardTitle className="text-white text-2xl">Welcome, {user?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white">You have supervisor access. Manage your team efficiently.</p>
        </CardContent>
      </Card>

      <Tabs defaultValue={activeTab as string ?? "departments"} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="departments">Department Management</TabsTrigger>
          <TabsTrigger value="employees">Employee Management</TabsTrigger>
        </TabsList>

        <TabsContent value="departments">
          <Suspense fallback={<DepartmentManagementSkeleton />}>
            <DepartmentManagement departments={departments ?? []} />
          </Suspense>
        </TabsContent>
        <TabsContent value="employees">
          <Suspense fallback={<EmployeeManagementSkeleton />}>
            <EmployeeManagement employees={employees} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}


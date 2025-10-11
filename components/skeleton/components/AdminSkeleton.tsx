import { Card, CardContent, CardHeader } from "../../ui/card"

export function DepartmentManagementSkeleton() {
  return (
    <Card className="w-full animate-pulse">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="h-4 w-72 bg-gray-200 rounded" />
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex items-center justify-between">
          <div className="h-10 w-64 bg-gray-200 rounded" />
          <div className="h-10 w-32 bg-gray-200 rounded" />
        </div>

        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="h-6 w-48 bg-gray-200 rounded" />
                    <div className="h-4 w-96 bg-gray-200 rounded" />
                  </div>
                  <div className="h-8 w-8 bg-gray-200 rounded" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="p-4 bg-gray-100 rounded-lg">
                      <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
                      <div className="h-8 w-16 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-4">
                  {[1, 2, 3, 4].map((k) => (
                    <div key={k} className="h-9 w-32 bg-gray-200 rounded" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function EmployeeManagementSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="h-4 w-72 bg-gray-200 rounded" />
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="h-10 w-96 bg-gray-200 rounded" />
            <div className="h-10 w-44 bg-gray-200 rounded" />
          </div>

          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-gray-200 rounded" />
                  <div className="h-4 w-48 bg-gray-200 rounded" />
                </div>
                <div className="flex gap-2">
                  {[1, 2].map((j) => (
                    <div key={j} className="h-6 w-20 bg-gray-200 rounded" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
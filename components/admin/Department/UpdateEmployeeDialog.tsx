'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmployeeDepartmentRole } from '@prisma/client'
import { useState } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { EmployeeDepartmentWithUser } from './DepartmentEmployeeListDialog'

interface UpdateEmployeeDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  employee: EmployeeDepartmentWithUser
  onUpdate: (roleId: string, data: { role: EmployeeDepartmentRole; hourlyRate: number; position: string }) => Promise<void>
}

export function UpdateEmployeeDialog({ isOpen, onOpenChange, employee, onUpdate }: UpdateEmployeeDialogProps) {
  const [role, setRole] = useState<EmployeeDepartmentRole>(employee.role)
  const [hourlyRate, setHourlyRate] = useState(employee.hourlyRate.toString())
  const [position, setPosition] = useState(employee.position)
  const [loading, setLoading] = useState(false)


  const handleSubmit = async () => {
    setLoading(true)
    await onUpdate(employee.id, {
      role,
      hourlyRate: Number(hourlyRate),
      position: position || ''
    })
    setLoading(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Update Employee Information</DialogTitle>
        </DialogHeader>

        {/* Employee Info Header */}
        <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg">
          <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
            {employee.employee.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="font-medium">{employee.employee.name}</h3>
            <p className="text-sm text-muted-foreground">{employee.employee.email}</p>
          </div>
        </div>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Role
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Select value={role} onValueChange={(value: EmployeeDepartmentRole) => setRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(EmployeeDepartmentRole).map(r => (
                  <SelectItem key={r} value={r}>
                    <div className="flex flex-col">
                      <span>{r}</span>
                      <span className="text-xs text-muted-foreground">
                        {r === 'ADMIN' ? 'Can manage department settings' : 
                         r === 'MANAGER' ? 'Can manage schedules and time entries' : 
                         'Regular employee access'}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Hourly Rate (USD)
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="Enter hourly rate"
              min="0"
              step="0.01"
            />
            <p className="text-xs text-muted-foreground">
              Employee&apos;s hourly compensation rate
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Position
            </label>
            <Input
              value={position ?? ""}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="e.g. Shift Supervisor, Sales Associate"
            />
            <p className="text-xs text-muted-foreground">
              Job title or position in the department
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !role || !hourlyRate}
          >
            {loading ? <LoadingSpinner /> : 'Update Information'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
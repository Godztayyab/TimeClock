'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Department } from "@prisma/client"
import { useState } from "react"
import { updateDepartment } from "@/actions/department"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Label } from "@/components/ui/label"
import { useCurrentUser } from "@/hooks/use-current-user"

interface EditDepartmentDialogProps {
  department: Department
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (department: Department) => void
}

export function EditDepartmentDialog({ 
  department, 
  isOpen, 
  onOpenChange,
  onUpdate 
}: EditDepartmentDialogProps) {
  const [name, setName] = useState(department.name)
  const [info, setInfo] = useState(department.info || '')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const user = useCurrentUser()

  const handleSubmit = async () => {
    if (!user?.id) return
    
    setLoading(true)
    try {
      const result = await updateDepartment(user.id, department.id, name, info)
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error
        })
        return
      }
      if (result.department)
      onUpdate(result.department)
      toast({
        title: "Success",
        description: result.success
      })
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Department</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Department Name
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sales, Marketing"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              This name will be displayed across the application
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="info">Description</Label>
            <Textarea
              id="info"
              value={info}
              onChange={(e) => setInfo(e.target.value)}
              placeholder="Department description or additional information"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Provide additional context about this department
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !name.trim()}
          >
            {loading ? <LoadingSpinner /> : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
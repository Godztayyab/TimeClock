'use client'

import { Department } from '@prisma/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TimeOffRequestForm } from '../time-off/TimeOffRequestForm'

interface TimeOffRequestModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDepartments: Department[]
  userId: string
  defaultDate: Date
  onSuccess: () => void
}

export function TimeOffRequestModal({
  isOpen,
  onClose,
  selectedDepartments,
  userId,
  defaultDate,
  onSuccess
}: TimeOffRequestModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Request Time Off</DialogTitle>
         
        </DialogHeader>
        <TimeOffRequestForm
          departments={selectedDepartments}
          userId={userId}
          defaultDate={defaultDate}
          onSuccess={() => {
            onSuccess()
            onClose()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
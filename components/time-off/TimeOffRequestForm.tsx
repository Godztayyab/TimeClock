'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Department, TimeOffRequestType } from '@prisma/client'
import { requestTimeOff } from '@/actions/time-off'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface TimeOffRequestFormProps {
  departments: Department[]
  userId: string
  defaultDate?: Date
  onSuccess?: () => void
}

export function TimeOffRequestForm({ departments, userId, defaultDate, onSuccess }: TimeOffRequestFormProps) {
  const [loading, setLoading] = useState(false)
  const [selectedDepts, setSelectedDepts] = useState<Department[]>(departments)
  const [date, setDate] = useState<{ from: Date; to: Date | undefined }>({
    from: defaultDate || new Date(),
    to: defaultDate
  })
  const [type, setType] = useState<TimeOffRequestType>(TimeOffRequestType.PERSONAL)
  const [message, setMessage] = useState('')
  const { toast } = useToast()



  const removeDepartment = (deptId: string) => {
    setSelectedDepts(selectedDepts.filter(d => d.id !== deptId))

    if (selectedDepts.length === 1) {
      onSuccess?.()
    }
  }

  const handleSubmit = async () => {
    if (!date.from || !date.to || !type || selectedDepts.length === 0) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const response = await requestTimeOff(
        userId,
        selectedDepts.map(d => d.id),
        date.from,
        date.to,
        type,
        message
      )

      if (response.error) {
        toast({
          title: 'Error',
          description: response.error,
          variant: 'destructive'
        })
        return
      }

      toast({
        title: 'Success',
        description: response.success
      })
      onSuccess?.()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        {selectedDepts.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedDepts.map(dept => (
              <Badge
                key={dept.id}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {dept.name}
                <button
                  onClick={() => removeDepartment(dept.id)}
                  className="hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Date Range</label>
        <Calendar
          mode="range"
          selected={date}
          onSelect={(value) => value && setDate(value as { from: Date; to: Date })}
          disabled={(date) => date < new Date()}
          numberOfMonths={2}
          className="rounded-md border"
        />
      </div>

      <Select value={type} onValueChange={(value) => setType(value as TimeOffRequestType)}>
        <SelectTrigger>
          <SelectValue placeholder="Type of leave" />
        </SelectTrigger>
        <SelectContent>
          {
            Object.values(TimeOffRequestType).map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))
          }
        </SelectContent>
      </Select>

      <Textarea
        placeholder="Additional notes (optional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <Button
        onClick={handleSubmit}
        disabled={loading || !date.from || !date.to || !type || selectedDepts.length === 0}
        className="w-full"
      >
        {loading ? 'Submitting...' : 'Submit Request'}
      </Button>
    </div>
  )
}


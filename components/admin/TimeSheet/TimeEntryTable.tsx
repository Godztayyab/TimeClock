import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X } from 'lucide-react'
import { format, differenceInHours, differenceInMinutes } from 'date-fns'
import { TimeEntry, TimeEntryStatus } from '@prisma/client'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface TimeEntryTableProps {
  entries: TimeEntry[]
  loading: boolean
  canApprove: boolean
  onApprove: (id: string) => Promise<void>
  onDiscard: (id: string) => Promise<void>
}

export function TimeEntryTable({ entries, loading, canApprove, onApprove, onDiscard }: TimeEntryTableProps) {
  const getStatusBadgeVariant = (status: TimeEntryStatus) => {
    switch (status) {
      case TimeEntryStatus.APPROVED:
        return 'default'
      case TimeEntryStatus.REJECTED:
        return 'destructive'
      case TimeEntryStatus.PENDING:
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const formatDuration = (clockIn: Date, clockOut: Date | null) => {
    if (!clockOut) return 'In Progress'
    const hours = differenceInHours(clockOut, clockIn)
    const minutes = differenceInMinutes(clockOut, clockIn) % 60
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Clock In</TableHead>
            <TableHead>Clock Out</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            {canApprove && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                <LoadingSpinner />
              </TableCell>
            </TableRow>
          ) : entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                No time entries found
              </TableCell>
            </TableRow>
          ) : (
            entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">
                  {format(new Date(entry.clockIn), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  {format(new Date(entry.clockIn), 'hh:mm a')}
                </TableCell>
                <TableCell>
                  {entry.clockOut 
                    ? format(new Date(entry.clockOut), 'hh:mm a')
                    : 'Active'
                  }
                </TableCell>
                <TableCell>
                  {formatDuration(new Date(entry.clockIn), entry.clockOut ? new Date(entry.clockOut) : null)}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(entry.status)}>
                    {entry.status}
                  </Badge>
                </TableCell>
                {canApprove && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {entry.status === TimeEntryStatus.PENDING && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => onApprove(entry.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => onDiscard(entry.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
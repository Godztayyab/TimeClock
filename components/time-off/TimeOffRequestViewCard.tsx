import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TimeOffRequest, User } from "@prisma/client";
import { Button } from "../ui/button";
import { Check, Trash2, Calendar, Clock, User as UserIcon } from "lucide-react";
import { format } from "date-fns";

interface TimeOffRequestWithApprover extends TimeOffRequest {
  approvedBy?: User | null;
}

interface TimeOffRequestViewCardProps {
  timeOffRequest: TimeOffRequestWithApprover;
  onDeleted?: () => void;
  onRejected?: () => void;
  onApproved?: () => void;
}

export function TimeOffRequestViewCard({ timeOffRequest, onDeleted, onRejected, onApproved }: TimeOffRequestViewCardProps) {
  return (
    <div className={cn("p-4 rounded-lg border", TimeOffStatusColors[timeOffRequest.status])}>
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <h4 className="font-medium">Time Off Request</h4>
          <Badge variant="outline">{timeOffRequest.requestType}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{timeOffRequest.status}</Badge>
          {onDeleted && (
            <Button onClick={onDeleted} variant="ghost" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            <span>
              {format(new Date(timeOffRequest.startDate), 'MMM d, yyyy')} - {format(new Date(timeOffRequest.endDate), 'MMM d, yyyy')}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span>Requested on {format(new Date(timeOffRequest.createdAt), 'MMM d, yyyy h:mm a')}</span>
          </div>

          {timeOffRequest.message && (
            <div className="text-sm">
              <p className="font-medium mb-1">Message:</p>
              <p className="italic">&quot;{timeOffRequest.message}&quot;</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {timeOffRequest.approvedBy && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <UserIcon className="h-4 w-4" />
                <span>{timeOffRequest.status === 'APPROVED' ? 'Approved' : 'Rejected'} by {timeOffRequest.approvedBy.name}</span>
              </div>
              {timeOffRequest.approvedAt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>on {format(new Date(timeOffRequest.approvedAt), 'MMM d, yyyy h:mm a')}</span>
                </div>
              )}
            </div>
          )}

          {timeOffRequest.status === 'PENDING' && (
            <div className="flex gap-2">
              {onApproved && (
                <Button variant="default" onClick={onApproved} size="sm">
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              )}
              {onRejected && (
                <Button variant="destructive" onClick={onRejected} size="sm">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Add status color mapping
export const TimeOffStatusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    APPROVED: 'bg-green-100 text-green-800 border-green-200',
    REJECTED: 'bg-red-100 text-red-800 border-red-200',
    NOTSUBMITTED: 'bg-gray-100 text-gray-800 border-gray-200',
    CANCELLED: 'bg-gray-100 text-gray-800 border-gray-200'
} as const

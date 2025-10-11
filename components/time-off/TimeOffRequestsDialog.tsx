'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Department, TimeOffRequest } from "@prisma/client"
import { useEffect, useState } from "react"
import { TimeOffRequestViewCard } from "@/components/time-off/TimeOffRequestViewCard"
import { approveTimeOff, getTimeOffRequestsByDeparmentId, rejectTimeOff } from "@/actions/time-off"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSession } from "next-auth/react"
import { ScrollArea } from "@radix-ui/react-scroll-area"

interface TimeOffRequestsDialogProps {
    department: Department
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

const statusFilters = [
    { value: 'ALL', label: 'All Requests' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
]

export function TimeOffRequestsDialog({
    department,
    isOpen,
    onOpenChange
}: TimeOffRequestsDialogProps) {
    const [requests, setRequests] = useState<TimeOffRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('ALL')
    const { toast } = useToast()
    const { data: session } = useSession()

    const fetchRequests = async () => {
        try {
            const response = await getTimeOffRequestsByDeparmentId(department.id)
            if (response.error) {
                toast({
                    title: 'Error',
                    description: response.error,
                    variant: 'destructive'
                })
                return
            }
            setRequests(response.data ?? [])
        } catch (error) {
            console.error(error)
            toast({
                title: 'Error',
                description: 'Failed to fetch time off requests',
                variant: 'destructive'
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            fetchRequests()
        }
    }, [isOpen, department.id])

    const handleApprove = async (requestId: string) => {
        if (!session?.user?.id) return
        try {
            const response = await approveTimeOff(requestId, session.user.id)
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
            fetchRequests()
        } catch (error) {
            console.error(error)
            toast({
                title: 'Error',
                description: 'Failed to approve request',
                variant: 'destructive'
            })
        }
    }

    const handleReject = async (requestId: string) => {
        if (!session?.user?.id) return
        try {
            const response = await rejectTimeOff(requestId, session.user.id)
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
            fetchRequests()
        } catch (error) {
            console.error(error)
            toast({
                title: 'Error',
                description: 'Failed to reject request',
                variant: 'destructive'
            })
        }
    }

    const filteredRequests = requests.filter(request =>
        statusFilter === 'ALL' || request.status === statusFilter
    )

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Time Off Requests - {department.name}</DialogTitle>
                    <div className="flex gap-4 mt-2">
                        <div className="flex items-center gap-2">
                            <div className="badge bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                                Pending: {requests.filter(r => r.status === 'PENDING').length}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="badge bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                Approved: {requests.filter(r => r.status === 'APPROVED').length}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="badge bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                                Rejected: {requests.filter(r => r.status === 'REJECTED').length}
                            </div>
                    </div>
                    </div>

                </DialogHeader>

                <div className="space-y-4">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statusFilters.map(filter => (
                                <SelectItem key={filter.value} value={filter.value}>
                                    {filter.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {loading ? (
                        <div className="flex justify-center p-8">
                            <LoadingSpinner />
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No time off requests found
                        </div>
                    ) : (
                        <ScrollArea className="max-h-[60vh] overflow-y-auto rounded-md">
                            <div className="space-y-4 p-4">
                                {filteredRequests.map((request, index) => (
                                    <div
                                        key={request.id}
                                        className={`transition-opacity duration-300 ease-in-out ${
                                            index === 0 ? 'opacity-100' : 'opacity-90 hover:opacity-100'
                                        }`}
                                    >
                                        <TimeOffRequestViewCard
                                            timeOffRequest={request}
                                            onApproved={() => handleApprove(request.id)}
                                            onRejected={() => handleReject(request.id)}
                                        />
                                    </div>
                                ))}
                            </div>

                            {filteredRequests.length > 5 && (
                                <div className="sticky bottom-0 w-full text-center py-3 bg-gradient-to-t from-background/95 to-transparent backdrop-blur-sm">
                                    <span className="text-sm text-muted-foreground animate-pulse">
                                        ↓ Scroll to view more requests
                                    </span>
                                </div>
                            )}
                        </ScrollArea>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
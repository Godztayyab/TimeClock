'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TimeOffRequest, User } from '@prisma/client'
import { approveTimeOff, rejectTimeOff, getTimeOffRequestsByDeparmentId } from '@/actions/time-off'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useSession } from 'next-auth/react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { TimeOffStatusColors } from '@/components/time-off/TimeOffRequestViewCard'
import { ScrollArea } from '@/components/ui/scroll-area'


export interface TimeOffRequestwithEmployee extends TimeOffRequest {
    employee: User
}

export function TimeOffApprovalView({ departmentId }: { departmentId: string }) {
    const [requests, setRequests] = useState<TimeOffRequestwithEmployee[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const { toast } = useToast()
    const { data: session } = useSession()
    const fetchRequests = async () => {
        try {
            const response = await getTimeOffRequestsByDeparmentId(departmentId)
            if (response.error) {
                toast({
                    title: 'Error',
                    description: response.error,
                    variant: 'destructive'
                })
                return
            }
            if (!response.data) return
            setRequests(response.data)
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
        fetchRequests()
    }, [departmentId])


    const handleApprove = async (requestId: string) => {
        if (!session?.user?.id) return
        setActionLoading(requestId)
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
                description: 'Time off request approved'
            })
            await fetchRequests()
        } finally {
            setActionLoading(null)
        }
    }

    const handleReject = async (requestId: string) => {
        if (!session?.user?.id) return
        setActionLoading(requestId)
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
                description: 'Time off request rejected'
            })
            await fetchRequests()
        } finally {
            setActionLoading(null)
        }
    }

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-48" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    {[1, 2, 3].map(j => (
                                        <Skeleton key={j} className="h-12 w-24" />
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <ScrollArea className="space-y-4 h-5/6">
            {requests.length === 0 ? (
                <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                        No time off requests found
                    </CardContent>
                </Card>
            ) : (
                requests.map(request => (
                    <Card key={request.id}>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Time Off Request - {request.employee.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Type</p>
                                        <p className="font-medium">{request.requestType}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Dates</p>
                                        <p className="font-medium">
                                            {format(request.startDate, 'MMM d')} - {format(request.endDate, 'MMM d')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Status</p>
                                        <Badge className={TimeOffStatusColors[request.status]}>
                                            {request.status}
                                        </Badge>
                                    </div>
                                </div>

                                {request.message && (
                                    <div>
                                        <p className="text-sm text-gray-500">Message</p>
                                        <p>{request.message}</p>
                                    </div>
                                )}

                                {request.status === 'PENDING' && (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="default"
                                            onClick={() => handleApprove(request.id)}
                                            disabled={!!actionLoading}
                                        >
                                            {actionLoading === request.id ? (
                                                <LoadingSpinner />
                                            ) : null}
                                            Approve
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => handleReject(request.id)}
                                            disabled={!!actionLoading}
                                        >
                                            {actionLoading === request.id ? (
                                                <LoadingSpinner />
                                            ) : null}
                                            Reject
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </ScrollArea>
    )
}
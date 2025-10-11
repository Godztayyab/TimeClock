import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const TimeClockSkeleton = () => {
    return (
        <Card>
            <CardHeader className="border-b">
                <CardTitle>Employee Time Clock</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="grid gap-6">
                    {/* Department Selection Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-36" />
                        </div>
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>

                    {/* Clock Status Section */}
                    <div className="space-y-4">
                        <div className="text-center p-6 rounded-lg bg-gray-50">
                            <Skeleton className="h-7 w-36 mx-auto mb-2" />
                            <div className="space-y-3">
                                <Skeleton className="h-8 w-32 mx-auto" />
                                <Skeleton className="h-6 w-48 mx-auto" />
                                <Skeleton className="h-10 w-40 mx-auto" />
                                <Skeleton className="h-4 w-36 mx-auto" />
                            </div>
                        </div>

                        {/* Action Button Skeleton */}
                        <Skeleton className="h-14 w-full" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default TimeClockSkeleton
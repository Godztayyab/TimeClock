import React from 'react'


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from "@/components/ui/skeleton"

const StatisticsCardSkeleton = () => {
    return (
        <Card className="hover:shadow-lg transition-shadow bg-orange-50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                    <Skeleton className="h-4 w-24" />
                </CardTitle>
                <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
                <div className="flex flex-col">
                    <Skeleton className="h-8 w-16 mb-2" />
                    <div className="flex items-center pt-1">
                        <Skeleton className="h-2 w-full rounded-full" />
                        <Skeleton className="h-4 w-8 ml-2" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default StatisticsCardSkeleton
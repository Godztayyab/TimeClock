import React from 'react'
import StatisticsCardSkeleton from '../atomic/StatisticsCardSkeleton'

const StatisticsCardsSkelethon = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"><StatisticsCardSkeleton />
            <StatisticsCardSkeleton />
            <StatisticsCardSkeleton />
            <StatisticsCardSkeleton />
            </div>
    )
}

export default StatisticsCardsSkelethon
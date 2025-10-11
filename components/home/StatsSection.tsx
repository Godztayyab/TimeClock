'use client';

import { Button } from "../ui/button"
import Link from "next/link"
import { LoadingSpinner } from "../ui/loading-spinner"
import { format } from "date-fns"
import { Department } from "@prisma/client"
import { getWeeklyStats } from "@/actions/work-stats"
import { useEffect, useState } from 'react';
import { WorkStats } from "@/services/WorkStatsService"


interface StatsSectionProps {
    username: string
    employeePermittedDepartments: Department[]
    userId: string
}

export async function StatsSection({
    username,
    employeePermittedDepartments,
    userId
}: StatsSectionProps) {



    const [stats, setStats] = useState<WorkStats | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            const weeklyStats = await getWeeklyStats(userId);
            if (weeklyStats.data) {
                setStats(weeklyStats.data);
            }
        };

        fetchStats();
    }, [userId]);

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back, {username}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Here&apos;s your workspace overview
                    </p>
                </div>
                <Button className="bg-orange-600 hover:bg-orange-700" asChild>
                    <Link href="/dashboard">
                        Go to Dashboard
                    </Link>
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-orange-600 text-sm font-medium">Total Weekly Hours</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {stats ? (
                            `${stats.weeklyHours.toFixed(2)}h`
                        ) : (
                            <LoadingSpinner />
                        )}
                    </p>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">Overtime hours</p>
                        {stats?.overtimeHours && stats.overtimeHours > 0 && (
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                                +{stats.overtimeHours.toFixed(2)}h
                            </span>
                        )}
                    </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-green-600 text-sm font-medium">Current Status</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {stats?.currentEntry ? (
                            <span className="text-green-600">On Duty</span>
                        ) : (
                            <span className="text-gray-500">Off Duty</span>
                        )}
                    </p>
                    <p className="text-sm text-gray-600">
                        {stats?.lastClockIn ? (
                            `Last: ${format(new Date(stats.lastClockIn), 'hh:mm a')}`
                        ) : (
                            'No recent activity'
                        )}
                    </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-blue-600 text-sm font-medium">Expected Pay</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {stats ? (
                            `$${stats.expectedPay.toFixed(2)}`
                        ) : (
                            <LoadingSpinner />
                        )}
                    </p>
                    <p className="text-sm text-gray-600">
                        From {employeePermittedDepartments?.length || 0} departments
                    </p>
                </div>
            </div>
        </div>
    )
}
"use client";

import { Suspense } from "react"
import TimeClockSkeleton from "../skeleton/components/TimeClockSkeleton"
import { TimeClock } from "../TimeClock"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import Link from "next/link"
import { BarChart, Calendar } from "lucide-react"
import { Department } from "@prisma/client"
import { Button } from "../ui/button";

interface QuickActionsProps {
    employeePermittedDepartments: Department[]
}

export async function QuickActions({ employeePermittedDepartments }: QuickActionsProps) {


    return (
        <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 md:row-span-2">
                <Suspense fallback={<TimeClockSkeleton />}>
                    <TimeClock departments={employeePermittedDepartments ?? []} />
                </Suspense>
            </div>

            <Card className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-white flex flex-col justify-between">
                <Link href="/dashboard?tab=schedule" className="h-full flex flex-col">
                    <CardHeader className="flex-1">
                        <CardTitle className="flex items-center gap-2 group-hover:text-orange-600 transition-colors">
                            <Calendar className="h-5 w-5 text-orange-600" />
                            Schedule
                        </CardTitle>
                        <CardDescription className="mt-4">
                            View and manage your work schedule. Plan your shifts and keep track of your working hours efficiently.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto pb-6">
                        <Button className="w-full bg-orange-600 hover:bg-orange-700">
                            View Schedule
                        </Button>
                    </CardContent>
                </Link>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-white flex flex-col justify-between">
                <Link href="/dashboard?tab=timesheet" className="h-full flex flex-col">
                    <CardHeader className="flex-1">
                        <CardTitle className="flex items-center gap-2 group-hover:text-orange-600 transition-colors">
                            <BarChart className="h-5 w-5 text-orange-600" />
                            Time Sheets
                        </CardTitle>
                        <CardDescription className="mt-4">
                            Review and submit time sheets. Track your working hours and manage your time records with ease.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto pb-6">
                        <Button className="w-full bg-orange-600 hover:bg-orange-700">
                            View Timesheets
                        </Button>
                    </CardContent>
                </Link>
            </Card>
        </div>
    )
}
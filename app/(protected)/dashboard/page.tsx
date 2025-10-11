"use server";

import { TimeClock } from '@/components/TimeClock'
import { TimeEntryList } from '@/components/TimeEntryList'
import { StatisticsCards } from '@/components/StatisticsCards'
import { getEmployeePermittedDepartmentsInfo } from '@/actions/department'
import { currentUser } from '@/lib/auth'
import { Department } from '@prisma/client'
import { Suspense } from 'react';
import StatisticsCardsSkelethon from '@/components/skeleton/components/StatisticsCardsSkelethon';
import TimeClockSkeleton from '@/components/skeleton/components/TimeClockSkeleton';
import TimeEntryListSkeleton from '@/components/skeleton/components/TimeEntryListSkelethon';
import { ScheduleSkeleton } from '@/components/skeleton/components/ScheduleSkeleton';
import { CombinedScheduleView } from "@/components/schedule/CombinedScheduleView"
import { ScheduleView } from '@/components/schedule/ScheduleView';

export default async function Dashboard() {
  const user = await currentUser();
  let departments: Department[] = [];

  if (user && user.id) {
    try {
      const data = await getEmployeePermittedDepartmentsInfo(user.id, user.id);
      if (data && data.departments)
        departments = data.departments;
    } catch (error) {
      console.error('Failed to fetch permitted departments:', error);
    }
  }

  return (
    <div className="space-y-6 my-6 container mx-auto">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Suspense fallback={<TimeClockSkeleton />}>
            <TimeClock departments={departments} />
          </Suspense>
        </div>
        {/* <Calendar /> */}
        <Suspense fallback={<ScheduleSkeleton />}>
          <CombinedScheduleView
            departments={departments}
            userId={user?.id ?? ''}
          />
        </Suspense>
      </div>
      <Suspense fallback={<StatisticsCardsSkelethon />}>
        <StatisticsCards />
      </Suspense>
      <Suspense fallback={<ScheduleSkeleton />}>
        <ScheduleView
          departments={departments}
          userId={user?.id ?? ''}
        />
      </Suspense>

      <Suspense fallback={<TimeEntryListSkeleton />}>
        <TimeEntryList />
      </Suspense>


    </div>
  )
}
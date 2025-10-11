"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTimeEntry } from '@/_context/TimeEntryContext';
import {  endOfWeek, format } from 'date-fns';
import { ArrowUpIcon, ClockIcon, DollarSignIcon, CalendarIcon } from 'lucide-react';
import { getWeeklyStats } from '@/actions/work-stats';
import { WorkStats } from '@/services/WorkStatsService';
import { useCurrentUser } from '@/hooks/use-current-user';
import { toast } from '@/hooks/use-toast';
import StatisticsCardsSkelethon from './skeleton/components/StatisticsCardsSkelethon';

export function StatisticsCards() {
  const { currentEntry } = useTimeEntry();
  const [stats, setStats] = useState<WorkStats | null>(null);
  const [loading, setLoading] = useState(true);
  const user = useCurrentUser();

  useEffect(() => {
    const fetchStats = async (userId: string) => {
      const response = await getWeeklyStats(userId);
      if (response.data) {
        setStats(response.data);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.error || 'Failed to load stats'
        })
      }
    };
    if (user && user.id) {
      setLoading(false);
      fetchStats(user.id);
      setLoading(false);
    }
  }, [currentEntry]);

  if (loading) {
    return <StatisticsCardsSkelethon />;
  }

  const totalHours = stats?.weeklyHours ?? 0;
  const overtimeHours = stats?.overtimeHours ?? 0;
  const expectedPay = stats?.expectedPay ?? 0;
  const now = new Date();
  const weekEnd = endOfWeek(now);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="hover:shadow-lg transition-shadow bg-orange-50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-orange-600">Hours This Week</CardTitle>
          <ClockIcon className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="text-2xl font-bold text-gray-900">{totalHours}h</div>
            <div className="flex items-center pt-1">
              <div className="h-2 flex rounded-full overflow-hidden bg-orange-100 w-full">
                <div
                  className="bg-orange-500 transition-all duration-500"
                  style={{ width: `${Math.min((totalHours / 40) * 100, 100)}%` }}
                />
              </div>
              <span className="text-xs text-orange-600 ml-2">{((totalHours / 40) * 100).toFixed(0)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow bg-blue-50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-blue-600">Overtime</CardTitle>
          <ArrowUpIcon className={`h-4 w-4 ${overtimeHours > 0 ? 'text-blue-600' : 'text-gray-400'}`} />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="text-2xl font-bold text-gray-900">{overtimeHours.toFixed(1)}h</div>
           
            <p
            className='text-xs text-blue-600'
            >Overtime pay 1.5x</p>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Expected Pay</CardTitle>
          <DollarSignIcon className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="text-2xl font-bold text-gray-900">${expectedPay.toFixed(2)}</div>
            <div className="space-y-1">

              <div className="text-xs text-gray-500">
                Next pay: {format(weekEnd, 'MMM dd, yyyy')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow bg-green-50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-green-600">Current Status</CardTitle>
          <CalendarIcon className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="text-2xl font-bold">
              {currentEntry ? (
                <span className="text-green-600">On Duty</span>
              ) : (
                <span className="text-gray-500">Off Duty</span>
              )}
            </div>
            <p className="text-xs text-green-600">
              {currentEntry
                ? `Started: ${format(new Date(currentEntry.clockIn), 'hh:mm a')}`
                : 'Not clocked in'
              }
            </p>
            {currentEntry && (
              <p className="text-xs text-green-600 mt-1">
                Department: {stats?.departmentStats.find(d => d.departmentId === currentEntry.departmentId)?.departmentName}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
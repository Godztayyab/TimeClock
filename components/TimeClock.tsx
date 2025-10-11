"use client";
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTimeEntry } from '@/_context/TimeEntryContext';
import { Department } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { clockIn as _clockIn, clockOut as _clockOut } from '@/actions/time-entry';
import { differenceInSeconds, format } from 'date-fns';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Building2, Clock, Timer } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils';
import { AnimatedValue, GlowingDot } from './admin/TimeSheet/TimeGrid';
import { Badge } from './ui/badge';

interface TimeClockProps {
  departments: Department[];
}

export function TimeClock({ departments }: TimeClockProps) {
  const { currentEntry, clockIn, clockOut, loading, setLoading } = useTimeEntry();
  const { data: user } = useSession();
  const { toast } = useToast();
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(departments.length > 0 ? departments[0] : null);
  const [time, setTime] = useState<string>('00:00:00');
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentEntry) {
      timer = setInterval(() => {
        setTime(formatDuration(new Date(currentEntry.clockIn)));
      }, 1000);
    } else {
      setTime('00:00:00');
    }
    return () => clearInterval(timer);
  }, [currentEntry]);

  const handleClockInOut = async () => {
    setLoading(true);
    try {
      if (currentEntry) {
        if (!user || !user.user || !user.user.id) {
          console.error('User must be logged in to clock out');
          return;
        }

        const response = await _clockOut(user.user.id, currentEntry.id);

        if (response.error) {
          toast({
            title: 'Error',
            description: response.error,
          });
          return;
        } else if (response.data && response.success) {
          toast({
            title: 'Success',
            description: response.success,
          });

          clockOut(currentEntry.id);
        }
      } else {
        if (!selectedDepartment) return;

        if (!user || !user.user || !user.user.id) {
          console.error('User must be logged in to clock in');
          return;
        }

        const response = await _clockIn(user.user.id, selectedDepartment.id);

        if (response.error) {
          toast({
            title: 'Error',
            description: response.error,
          });
          return;
        } else if (response.data && response.success) {
          toast({
            title: 'Success',
            description: response.success,
          });

          clockIn(response.data);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (startTime: Date) => {
    const now = new Date();
    const diffInSeconds = differenceInSeconds(now, startTime);
    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);
    const seconds = diffInSeconds % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')} hours, ${minutes.toString().padStart(2, '0')} minutes, ${seconds.toString().padStart(2, '0')} seconds`;
    } else if (minutes > 0) {
      return `${minutes.toString().padStart(2, '0')} minutes, ${seconds.toString().padStart(2, '0')} seconds`;
    } else {
      return `${seconds.toString().padStart(2, '0')} seconds`;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-orange-100">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-600" />
          Time Clock
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          {!currentEntry ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-orange-600" />
                    Select Department
                  </h3>
                  <Badge variant="secondary">
                    {departments.length} Available
                  </Badge>
                </div>

                {departments.length > 0 ? (
                  <div className="space-y-4">
                    <Select
                      value={selectedDepartment?.id}
                      onValueChange={(id) => setSelectedDepartment(departments.find(dept => dept.id === id) || null)}
                      disabled={loading}
                    >
                      <SelectTrigger className="w-full h-12 text-lg bg-white border-2 hover:border-orange-200 transition-colors">
                        <SelectValue placeholder="Choose your department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem
                            key={dept.id}
                            value={dept.id}
                            className="py-3 text-base hover:bg-orange-50"
                          >
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              {dept.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {selectedDepartment && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200"
                      >
                        <p className="font-medium text-orange-800">
                          {selectedDepartment.name}
                        </p>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed">
                    <p className="text-gray-600">No departments assigned</p>
                    <p className="text-sm text-gray-500 mt-2">Contact administrator</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="text-center space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
                  <GlowingDot />
                  <span>Active Session</span>
                </div>
                
                <div className="p-8 rounded-lg bg-gradient-to-b from-orange-50 to-orange-100 border border-orange-200">
                  <h3 className="text-xl font-medium text-orange-900 mb-4">
                    {departments.find(dept => dept.id === currentEntry.departmentId)?.name}
                  </h3>
                  
                  <div className="font-mono text-4xl font-bold tracking-wider text-orange-800">
                    <AnimatedValue value={time} />
                  </div>
                  
                  <div className="mt-4 flex items-center justify-center gap-2 text-orange-600">
                    <Timer className="h-4 w-4" />
                    Started: {format(new Date(currentEntry.clockIn), 'hh:mm a')}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <Button
            onClick={handleClockInOut}
            className={cn(
              "w-full py-6 text-xl font-medium transition-all duration-300",
              currentEntry 
                ? "bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl"
                : "bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl",
              loading && "opacity-80"
            )}
            disabled={loading || (!currentEntry && !selectedDepartment)}
          >
            <motion.div 
              className="flex items-center justify-center gap-3"
              whileTap={{ scale: 0.95 }}
            >
              {loading ? <LoadingSpinner /> : (
                <>
                  {currentEntry ? "End Shift" : "Start Shift"}
                </>
              )}
            </motion.div>
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  )
}
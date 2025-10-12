"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, startOfWeek, subDays, startOfDay, endOfDay } from "date-fns";
import { useTimeEntry } from "@/_context/TimeEntryContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "./ui/loading-spinner";

interface WeeklyChartData {
  week: string;
  regular: number;
  overtime: number;
  total: number;
}

export function PaymentEntryList() {
  const { recentEntries, departmentMap, userPermittedDepartments, loading } =
    useTimeEntry();
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const [date, setDate] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: subDays(new Date(), 30), // Default: 30 days back
    to: new Date(), // Default: current date
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Group entries by week
  const weeklyData = useMemo(() => {
    const weeks: { [key: string]: typeof recentEntries } = {};

    const sortedEntries = [...recentEntries].sort(
      (a, b) => new Date(a.clockIn).getTime() - new Date(b.clockIn).getTime()
    );

    sortedEntries.forEach((entry) => {
      const weekStart = startOfWeek(new Date(entry.clockIn));
      const weekKey = format(weekStart, "yyyy-MM-dd");

      if (!weeks[weekKey]) {
        weeks[weekKey] = [];
      }
      weeks[weekKey].push(entry);
    });

    return weeks;
  }, [recentEntries]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return Object.entries(weeklyData)
      .map(([week, entries]): WeeklyChartData => {
        const totalHours = entries.reduce((acc, entry) => {
          if (!entry.clockOut) return acc;
          return acc + Number(entry.hours);
        }, 0);

        const total = Number(totalHours.toFixed(2));
        const regular = Number(Math.min(total, 40).toFixed(2));
        const overtime = Number(Math.max(0, total - 40).toFixed(2));

        return {
          week: format(new Date(week), "MMM d"),
          regular,
          overtime,
          total,
        };
      })
      .sort((a, b) => {
        return new Date(a.week).getTime() - new Date(b.week).getTime();
      });
  }, [weeklyData]);

  // Filter entries by search term and date range
  const filteredEntries = useMemo(() => {
    return recentEntries
      .filter((entry) => entry.status === "APPROVED")
      .filter((entry) => {
        const entryDate = new Date(entry.clockIn);
        const isWithinDateRange =
          (!date.from || entryDate >= startOfDay(date.from)) &&
          (!date.to || entryDate <= endOfDay(date.to));
        return (
          isWithinDateRange &&
          (entry.createdAt.toISOString().includes(search) ||
            entry.status.toLowerCase().includes(search.toLowerCase()) ||
            departmentMap[entry.departmentId]?.name
              .toLowerCase()
              .includes(search.toLowerCase()))
        );
      });
  }, [recentEntries, search, departmentMap, date]);

  // Shortcut button handlers
  const setToday = () => {
    setDate({ from: new Date(), to: new Date() });
    setIsDialogOpen(false);
    toast({
      title: "Date Range Applied",
      description: `Showing entries for today, ${format(
        new Date(),
        "MMM dd, yyyy"
      )}`,
    });
  };

  const setLastWeek = () => {
    const today = new Date();
    const lastWeekStart = subDays(startOfWeek(today, { weekStartsOn: 1 }), 7);
    const lastWeekEnd = subDays(startOfWeek(today, { weekStartsOn: 1 }), 1);
    setDate({ from: lastWeekStart, to: lastWeekEnd });
    setIsDialogOpen(false);
    toast({
      title: "Date Range Applied",
      description: `Showing entries from ${format(
        lastWeekStart,
        "MMM dd, yyyy"
      )} to ${format(lastWeekEnd, "MMM dd, yyyy")}`,
    });
  };

  const set30DaysBack = () => {
    const today = new Date();
    const thirtyDaysBack = subDays(today, 30);
    setDate({ from: thirtyDaysBack, to: today });
    setIsDialogOpen(false);
    toast({
      title: "Date Range Applied",
      description: `Showing entries from ${format(
        thirtyDaysBack,
        "MMM dd, yyyy"
      )} to ${format(today, "MMM dd, yyyy")}`,
    });
  };

  const set90DaysBack = () => {
    const today = new Date();
    const ninetyDaysBack = subDays(today, 90);
    setDate({ from: ninetyDaysBack, to: today });
    setIsDialogOpen(false);
    toast({
      title: "Date Range Applied",
      description: `Showing entries from ${format(
        ninetyDaysBack,
        "MMM dd, yyyy"
      )} to ${format(today, "MMM dd, yyyy")}`,
    });
  };

  // Clear filter handler
  const clearFilters = () => {
    setSearch("");
    setDate({ from: subDays(new Date(), 30), to: new Date() });
    setIsDialogOpen(false);
    toast({
      title: "Filters Cleared",
      description: "All filters have been reset to default (last 30 days).",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Payroll & History</CardTitle>
          <div className="space-x-2">
            <Button onClick={() => setIsDialogOpen(true)} variant="outline">
              Select Date Range
            </Button>
            <Button
              onClick={() => {
                const printContent =
                  document.getElementById("time-entries")?.innerHTML;
                if (printContent) {
                  const printWindow = window.open("", "_blank");
                  if (printWindow) {
                    const baseUrl = window.location.origin;
                    printWindow.document.write(`
                      <html>
                        <head>
                          <title>Payroll & History</title>
                          <link rel="stylesheet" href="${baseUrl}/styles.css" />
                          <style>
                            body { padding: 20px; }
                            @media print {
                              body { margin: 0; padding: 15px; }
                              table { width: 100%; border-collapse: collapse; }
                              td, th { padding: 8px; border: 1px solid #ddd; }
                            }
                          </style>
                        </head>
                        <body>
                          ${printContent}
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                    printWindow.print();
                  }
                }
              }}
              variant="outline"
            >
              Print
            </Button>

            <Button
              onClick={clearFilters}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Clear Filter
            </Button>
          </div>
        </div>
        <div className="mb-4">
          <Input
            placeholder="Search entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      {!loading ? (
        filteredEntries.length > 0 ? (
          <CardContent>
            <Tabs defaultValue="table" className="w-full">
              <TabsContent value="table" className="w-full" id="time-entries">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Clock In</TableHead>
                      <TableHead>Clock Out</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Hourly Rate</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          {format(new Date(entry.clockIn), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          {departmentMap[entry.departmentId]?.name}
                        </TableCell>
                        <TableCell>
                          {format(new Date(entry.clockIn), "hh:mm a")}
                        </TableCell>
                        <TableCell>
                          {entry.clockOut
                            ? format(new Date(entry.clockOut), "hh:mm a")
                            : "-"}
                        </TableCell>
                        <TableCell>{Number(entry.hours).toFixed(2)}h</TableCell>
                        <TableCell>
                          {userPermittedDepartments ? (
                            userPermittedDepartments[entry.departmentId]
                              ?.hourlyRate ? (
                              `$${Number(
                                userPermittedDepartments[entry.departmentId]
                                  .hourlyRate
                              ).toFixed(2)}`
                            ) : (
                              "N/A"
                            )
                          ) : (
                            <LoadingSpinner />
                          )}
                        </TableCell>
                        <TableCell>
                          {userPermittedDepartments ? (
                            userPermittedDepartments[entry.departmentId]
                              ?.hourlyRate ? (
                              isNaN(
                                Number(
                                  userPermittedDepartments[entry.departmentId]
                                    .hourlyRate
                                )
                              ) || isNaN(Number(entry.hours)) ? (
                                "Invalid"
                              ) : (
                                `$${(
                                  Number(
                                    userPermittedDepartments[entry.departmentId]
                                      .hourlyRate
                                  ) * Number(entry.hours)
                                ).toFixed(2)}`
                              )
                            ) : (
                              "N/A"
                            )
                          ) : (
                            <LoadingSpinner />
                          )}
                        </TableCell>
                        <TableCell>
                          {entry.clockOut ? (
                            <Badge
                              variant={
                                entry.status === "PENDING"
                                  ? "default"
                                  : entry.status === "APPROVED"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {entry.status}
                            </Badge>
                          ) : (
                            "In Progress"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="graph" className="w-full">
                <div className="h-[700px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="week" />
                      <YAxis domain={[0, "auto"]} />
                      <Tooltip
                        formatter={(value: number) => [
                          `${value.toFixed(2)}h`,
                          "",
                        ]}
                        labelFormatter={(label) => `Week of ${label}`}
                      />
                      <Legend />
                      <Bar
                        dataKey="regular"
                        stackId="hours"
                        fill="#10B981"
                        name="Regular Hours (≤40h)"
                      />
                      <Bar
                        dataKey="overtime"
                        stackId="hours"
                        fill="#F97316"
                        name="Overtime Hours (>40h)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No payroll history found
          </div>
        )
      ) : (
        <LoadingSpinner />
      )}

      {/* Dialog for Date Range Picker */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Select Date Range</DialogTitle>
          </DialogHeader>
          <div>
            <Calendar
              mode="range"
              selected={date}
              onSelect={(value) => {
                if (value && "from" in value && "to" in value) {
                  setDate({ from: value.from, to: value.to });
                }
              }}
              disabled={(date) => date > new Date()}
              numberOfMonths={2}
              className="rounded-md border"
            />
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <Button variant="outline" onClick={setToday}>
              Today
            </Button>
            <Button variant="outline" onClick={setLastWeek}>
              Last Week
            </Button>
            <Button variant="outline" onClick={set30DaysBack}>
              30 Days Back
            </Button>
            <Button variant="outline" onClick={set90DaysBack}>
              90 Days Back
            </Button>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setIsDialogOpen(false);
                toast({
                  title: "Date Range Applied",
                  description: `Filtering entries from ${format(
                    date.from ?? new Date(),
                    "MMM dd, yyyy"
                  )} to ${date.to ? format(date.to, "MMM dd, yyyy") : "today"}`,
                });
              }}
            >
              Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

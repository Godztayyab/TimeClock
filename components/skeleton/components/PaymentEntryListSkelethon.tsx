import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

const PaymentEntryListSkeleton = () => {
    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Time Entries</CardTitle>
                    <div className="space-x-2">
                        <Button disabled className="bg-orange-500">Submit for Approval</Button>
                        <Button variant="outline" disabled>Print</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="table" className="w-full">
                    <TabsList className="grid w-[200px] grid-cols-2 mb-4">
                        <TabsTrigger value="table">Table View</TabsTrigger>
                        <TabsTrigger value="graph">Graph View</TabsTrigger>
                    </TabsList>

                    <div className="mb-4">
                        <Skeleton className="h-10 max-w-sm" />
                    </div>

                    <TabsContent value="table" className="w-full">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Clock In</TableHead>
                                    <TableHead>Clock Out</TableHead>
                                    <TableHead>Hours</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array(5).fill(0).map((_, index) => (
                                    <TableRow key={index}>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>

                    <TabsContent value="graph" className="w-full">
                        <div className="h-[700px] mt-4">
                            <Skeleton className="w-full h-full" />
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}

export default PaymentEntryListSkeleton
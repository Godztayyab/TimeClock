'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useEffect, useState } from "react"
import { Department } from "@prisma/client"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign, Clock } from "lucide-react"

interface DepartmentSettingsDialogProps {
    department: Department
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function DepartmentSettingsDialog({
    department,
    isOpen,
    onOpenChange
}: DepartmentSettingsDialogProps) {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        //     async function fetchDepartmentDetails() {
        //       try {
        //         setLoading(true)
        //         const response = await getDepartmentStats(department.id)
        //         if (response.error) {
        //           setError(response.error)
        //           return
        //         }
        //         setDepartmentDetails(response.department)
        //       } catch (err) {
        //         console.log(err)
        //         setError('Failed to load department details')
        //       } finally {
        //         setLoading(false)
        //       }
        //     }

        //     if (isOpen) {
        //       fetchDepartmentDetails()
        //     }

        setLoading(false);
        setError(null);
    }, [department.id, isOpen])

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Department Settings</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center p-8">
                        <LoadingSpinner />
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500 p-4">{error}</div>
                ) : (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div>
                                    <span className="font-medium">Name:</span> {department.name}
                                </div>
                                <div>
                                    <span className="font-medium">Description:</span> {department.info || 'No description'}
                                </div>
                                <div>
                                    <span className="font-medium">Created:</span> {new Date(department.createdAt).toLocaleDateString()}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-2 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        Employee Stats
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">-</div>
                                    <p className="text-xs text-muted-foreground">Total Employees</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <DollarSign className="h-4 w-4" />
                                        Cost Stats
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">$-</div>
                                    <p className="text-xs text-muted-foreground">Monthly Budget</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Schedule Overview
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div>
                                    <span className="font-medium">Active Shifts:</span> -
                                </div>
                                <div>
                                    <span className="font-medium">Weekly Hours:</span> -
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
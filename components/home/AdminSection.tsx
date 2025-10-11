
import { Settings, UserCog, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import Link from "next/link"

export async function AdminSection() {
    return (
        <div className="space-y-4 bg-white rounded-2xl p-6 shadow-sm border">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Settings className="h-6 w-6 text-orange-600" />
                Administrative Tools
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Department Management
                        </CardTitle>
                        <CardDescription>
                            Manage departments and employees
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" asChild>
                            <Link href="/admin/dashboard?tab=departments">
                                Manage Departments
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserCog className="h-5 w-5" />
                            Employee Management
                        </CardTitle>
                        <CardDescription>
                            Manage user accounts and permissions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" asChild>
                            <Link href="/admin/dashboard?tab=employees">
                                Manage Employees
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
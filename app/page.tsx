import { currentUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { UserRole } from '@prisma/client'
import Link from 'next/link'
import { Suspense } from 'react'
import { getEmployeePermittedDepartmentsInfo, getPermittedDepartmentsInfo } from '@/actions/department'
import { AdminSectionSkeleton, QuickActionsGridSkeleton, StatsCardSkeleton } from '@/components/skeleton/components/HomePageSkeleton'
import { StatsSection } from '@/components/home/StatsSection'
import { QuickActions } from '@/components/home/QuickActions'
import { AdminSection } from '@/components/home/AdminSection'
import { Badge } from '@/components/ui/badge'
import { FeaturesGrid } from '@/components/home/FeaturesGrid'
import { TestCredentials } from '@/components/home/TestCredentials'
import { GitHubLogoIcon } from '@radix-ui/react-icons'
import { en } from '@/en'

export default async function HomePage() {
    const user = await currentUser();

    if (!user) {
        return (
            <div className="min-h-screen">
                <main>
                    {/* Hero Section */}
                    <section className="bg-gradient-to-b from-orange-50 to-white py-24">
                        <div className="container mx-auto px-4">
                            <div
                                className="max-w-4xl mx-auto text-center space-y-6"
                            >
                                <div
                                    className="inline-block p-2 bg-orange-100 rounded-full"
                                >
                                    <span className="text-orange-700 text-sm font-medium">
                                        ⚡️ Simple Time Management Solution
                                    </span>
                                </div>

                                <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
                                    Welcome to <span className="text-orange-600">{en.app.name}</span>
                                </h1>

                                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                    Manage your team&apos;s time tracking, attendance, and work schedules all in one place.
                                </p>

                                <div className="flex justify-center gap-4 pt-6">
                                    <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                                        <Link href="/auth/login">Get Started</Link>
                                    </Button>
                                    <Button variant="outline" size="lg">
                                        <Link href="/auth/login">Learn More</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Features Section */}
                    <section className="py-24 bg-gray-50">
                        <div className="container mx-auto px-4">
                            <div className="max-w-4xl mx-auto text-center mb-16">
                                <h2 className="text-3xl font-bold mb-4">
                                    Everything you need to manage your workforce
                                </h2>
                                <p className="text-gray-600">
                                    Comprehensive tools for time tracking, scheduling, and workforce management.
                                </p>
                            </div>
                            <FeaturesGrid />
                        </div>
                    </section>

                    <TestCredentials />

                    {/* Footer */}
                    <footer className="py-16 bg-gradient-to-b from-white to-orange-50">
                        <div className="container mx-auto px-4">
                            <div className="flex flex-col items-center justify-center space-y-6">
                                <div className="flex items-center space-x-4">
                                    <a
                                        href="https://thetahirabbas.netlify.app"
                                        className="text-gray-600 hover:text-orange-600 transition-colors duration-200"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Portfolio
                                    </a>
                                    <span className="text-gray-300">•</span>
                                    <a
                                        href="https://github.com/tahirabbas11/TimeClock"
                                        className="text-gray-600 hover:text-orange-600 transition-colors duration-200 flex items-center gap-2"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <GitHubLogoIcon className="h-5 w-5" />
                                        Source Code
                                    </a>
                                </div>
                                <p className="text-sm text-gray-500">
                                    Designed & Built by{' '}
                                    <a
                                        href="https://thetahirabbas.netlify.app/"
                                        className="text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {en.author.name}
                                    </a>
                                </p>
                            </div>
                        </div>
                    </footer>
                </main>
            </div>
        )
    }
    if (!user.id) throw new Error("User ID is required");

    const [employeePermittedDepartments, permittedDepartments] = await Promise.all([
        getEmployeePermittedDepartmentsInfo(user.id, user.id),
        getPermittedDepartmentsInfo(user.id),
    ]);

    const isAdmin = user.role === UserRole.ADMIN || (permittedDepartments.departments ?? []).length != 0;

    return (
        <div className="min-h-screen bg-gray-50/50">
            <main className="container mx-auto px-4 py-8">
                {/* Role Indicator */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {isAdmin && (
                            <Badge
                                variant="default"
                                className="bg-orange-100 text-orange-800 hover:bg-orange-200"
                            >
                                Admin Access
                            </Badge>
                        )}
                    </div>
                    {isAdmin && (
                        <Link href="/admin/dashboard" passHref>
                            <Button
                                variant="outline"
                                className="text-orange-600 border-orange-200 hover:bg-orange-50"
                            >
                                Admin Console
                            </Button>
                        </Link>
                    )}
                </div>

                <div className="space-y-8">
                    {isAdmin && (
                        <Suspense fallback={<AdminSectionSkeleton />}>
                            <AdminSection />
                        </Suspense>
                    )}

                    <Suspense fallback={<StatsCardSkeleton />}>
                        <StatsSection
                            employeePermittedDepartments={employeePermittedDepartments.departments ?? []}
                            username={user.name ?? ''}
                            userId={user.id}
                        />
                    </Suspense>

                    <Suspense fallback={<QuickActionsGridSkeleton />}>
                        <QuickActions
                            employeePermittedDepartments={employeePermittedDepartments.departments ?? []}
                        />
                    </Suspense>
                </div>
            </main>
        </div>
    )
}
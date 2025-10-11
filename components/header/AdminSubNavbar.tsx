import Link from "next/link"
import { LockClosedIcon } from "@radix-ui/react-icons"

const LINKS = [
    {
        label: 'Manager Dashboard',
        href: '/admin/dashboard'
    },
    {
        label: 'Create Department',
        href: '/admin/create-department'
    },
    {
        label: 'Approve Timesheets',
        href: '/admin/approve-timesheets'
    },
    {
        label: 'Manage Departments',
        href: '/admin/manage-departments'
    },

]
const AdminSubNavbar = () => {
    return (
        <div className="w-full bg-red-100">
            <div className="container mx-auto px-4 py-2 flex items-center space-x-6 text-red-500">
                <h1 className="text-lg font-semibold justify-center inline-flex items-center">
                    ADMIN CONTROLS {' '}
                    <LockClosedIcon className="h-4 w-4" />
                </h1>
                {
                    LINKS.map((link) => (
                        <div key={link.href} className="flex items-center space-x-2">

                            <Link href={link.href} passHref className="text-blue-500 hover:text-blue-700 font-semibold">
                                {link.label}
                            </Link>

                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default AdminSubNavbar
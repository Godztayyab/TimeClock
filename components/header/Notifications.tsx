'use client'

import { useEffect, useState } from 'react'
import { getNotifications, markAsRead, markAllAsRead } from '@/actions/notifications'
import { useToast } from '@/hooks/use-toast'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Bell, Check, Clock, UserCheck, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Notification, NotificationType } from '@prisma/client'
import { useCurrentUser } from '@/hooks/use-current-user'

export function NotificationsPopover() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const { toast } = useToast()
    const user = useCurrentUser();

    const fetchNotifications = async () => {
        if (!user || !user.id) return;

        setLoading(true)
        const response = await getNotifications(user.id)
        if (response.data) {
            setNotifications(response.data)
            setUnreadCount(response.data.filter(n => !n.read).length)
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: response.error
            })
        }
        setLoading(false)
    }

    // Initial fetch on mount
    useEffect(() => {
        if (user?.id && !mounted) {
            fetchNotifications()
            setMounted(true)
        }
    }, [user])

    // Fetch on open
    useEffect(() => {
        if (open && user?.id) {
            fetchNotifications()
        }
    }, [open, user?.id])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            setMounted(false)
            setNotifications([])
            setUnreadCount(0)
        }
    }, [])

    const handleMarkAsRead = async (id: string) => {
        if (!user || !user.id) return;

        const response = await markAsRead(user.id, id)
        if (response.success) {
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, read: true } : n
            ))
            setUnreadCount(prev => Math.max(0, prev - 1))
        }
    }

    const handleMarkAllAsRead = async () => {
        if (!user || !user.id) return;

        const response = await markAllAsRead(user.id)
        if (response.success) {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
            setUnreadCount(0)
        }
    }



    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative hover:bg-gray-100"
                    onClick={() => setOpen(true)}
                >
                    <Bell className="h-5 w-5" />
                    {mounted && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                        >
                            Mark all read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-20">
                            <LoadingSpinner />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                            No notifications
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={cn(
                                    "flex items-start gap-4 p-4 border-b transition-colors hover:bg-gray-50",
                                    !notification.read && "bg-blue-50/50"
                                )}
                            >
                                {getNotificationIcon(notification.type)}
                                <div className="flex-1 space-y-1">
                                    <p className={cn(
                                        "text-sm font-medium",
                                        !notification.read && "text-blue-600"
                                    )}>
                                        {notification.title}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {format(notification.createdAt, 'MMM d, h:mm a')}
                                    </p>
                                    {notification.actionUrl && (
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="p-0 h-auto"
                                            asChild
                                        >
                                            <a href={notification.actionUrl}>View details</a>
                                        </Button>
                                    )}
                                </div>
                                {!notification.read && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => handleMarkAsRead(notification.id)}
                                    >
                                        <Check className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}

export const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
        case 'MESSAGE':
            return <Bell className="h-5 w-5 text-gray-500" />
        case 'ALERT':
        case 'ERROR':
        case 'SYSTEM_ALERT':
            return <AlertTriangle className="h-5 w-5 text-red-500" />
        case 'REMINDER':
            return <Clock className="h-5 w-5 text-yellow-500" />
        case 'UPDATE':
        case 'SCHEDULE_UPDATED':
        case 'ROLE_UPDATED':
            return <Bell className="h-5 w-5 text-blue-500" />
        case 'TIMESHEET_PENDING':
        case 'TIME_OFF_REQUEST_PENDING':
            return <Clock className="h-5 w-5 text-blue-500" />
        case 'TIMESHEET_APPROVED':
        case 'TIMESHEET_APPROVED_ALL':
        case 'TIMESHEET_DEPARTMENT_APPROVED_ALL':
        case 'TIME_OFF_REQUEST_APPROVED':
            return <Check className="h-5 w-5 text-green-500" />
        case 'TIMESHEET_REJECTED':
        case 'TIME_OFF_REQUEST_REJECTED':
            return <UserCheck className="h-5 w-5 text-red-500" />
        case 'SCHEDULE_CONFLICT':
        case 'MISSING_CLOCKOUT':
        case 'EARLY_LEAVE':
        case 'OVERTIME_ALERT':
        case 'CLOCKED_OUT':
            return <AlertTriangle className="h-5 w-5 text-orange-500" />
        case 'DEPARTMENT_ADDED':
            return <Check className="h-5 w-5 text-green-500" />
        case 'DEPARTMENT_REMOVED':
            return <AlertTriangle className="h-5 w-5 text-red-500" />
        default:
            return <Bell className="h-5 w-5 text-gray-500" />
    }
}

"use server";

import { workStatsService } from '@/services/WorkStatsService'

export async function getWeeklyStats(userId: string) {
  try {
    const stats = await workStatsService.getWeeklyStats(userId)
    return { data: stats }
  } catch (error) {
    console.error('Failed to fetch work stats:', error)
    return { error: 'Failed to fetch work statistics' }
  }
}

export async function getDepartmentStats(userId: string, departmentId: string) {
  try {
    const stats = await workStatsService.getWeeklyStats(userId)
    const departmentStats = stats.departmentStats.find(
      dept => dept.departmentId === departmentId
    )
    return { data: departmentStats }
  } catch (error) {
    console.error('Failed to fetch department stats:', error)
    return { error: 'Failed to fetch department statistics' }
  }
}
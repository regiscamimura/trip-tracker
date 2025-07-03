import { useState, useEffect } from 'react'
import { api } from '@/api/Api'
import type { components } from '@/types/api'

type DailyLog = components['schemas']['DailyLog']
type DutyStatus = components['schemas']['DutyStatus']

export const useDutyStatuses = (dailyLog: DailyLog) => {
  const [dutyStatuses, setDutyStatuses] = useState<DutyStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDutyStatuses = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await api.GET(
          '/api/daily-logs/{daily_log_id}/duty-statuses',
          {
            params: { path: { daily_log_id: dailyLog.id! } },
          }
        )
        if (error) {
          // handle error (removed console)
        } else if (data) {
          setDutyStatuses(data as DutyStatus[])
        }
      } catch {
        // handle error (removed console)
      } finally {
        setIsLoading(false)
      }
    }
    loadDutyStatuses()
  }, [dailyLog.id])

  return { dutyStatuses, isLoading }
}

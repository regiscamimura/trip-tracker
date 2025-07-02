import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'
import { api } from '@/api/Api'
import type { components } from '@/types/api'
import DashboardHeader from './DashboardHeader'
import SimulationSection from './SimulationSection'
import DailyLogsList from './DailyLogsList'

// US truck route cities with coordinates
const TRUCK_ROUTES = [
  { city: 'Chicago, IL', lat: 41.8781, lng: -87.6298 },
  { city: 'Indianapolis, IN', lat: 39.7684, lng: -86.1581 },
  { city: 'Cincinnati, OH', lat: 39.1031, lng: -84.512 },
  { city: 'Louisville, KY', lat: 38.2527, lng: -85.7585 },
  { city: 'Nashville, TN', lat: 36.1627, lng: -86.7816 },
  { city: 'Atlanta, GA', lat: 33.749, lng: -84.388 },
  { city: 'Charlotte, NC', lat: 35.2271, lng: -80.8431 },
  { city: 'Richmond, VA', lat: 37.5407, lng: -77.436 },
  { city: 'Washington, DC', lat: 38.9072, lng: -77.0369 },
  { city: 'Philadelphia, PA', lat: 39.9526, lng: -75.1652 },
  { city: 'New York, NY', lat: 40.7128, lng: -74.006 },
]

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationResult, setSimulationResult] = useState<string>('')
  const [dailyLogs, setDailyLogs] = useState<
    components['schemas']['DailyLog'][]
  >([])
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)

  const handleLogout = async () => {
    await logout()
  }

  const loadDailyLogs = async () => {
    setIsLoadingLogs(true)
    try {
      const { data, error } = await api.GET('/api/daily-logs')
      if (error) {
        console.error('Failed to load daily logs:', error)
      } else if (data) {
        setDailyLogs(data)
      }
    } catch (err) {
      console.error('Error loading daily logs:', err)
    } finally {
      setIsLoadingLogs(false)
    }
  }

  // Load logs on component mount
  useEffect(() => {
    loadDailyLogs()
  }, [])

  const simulateDay = async () => {
    setIsSimulating(true)
    setSimulationResult('')

    try {
      // Generate random start time between 5:30-6:30 AM (15min intervals)
      const startHours = [5, 6]
      const startMinutes = [30, 45, 0, 15]
      const randomHour =
        startHours[Math.floor(Math.random() * startHours.length)]
      const randomMinute =
        startMinutes[Math.floor(Math.random() * startMinutes.length)]

      const startTime = new Date()
      startTime.setHours(randomHour, randomMinute, 0, 0)

      // Generate realistic truck route (3-5 cities)
      const routeLength = Math.floor(Math.random() * 3) + 3 // 3-5 cities
      const shuffledRoutes = [...TRUCK_ROUTES].sort(() => Math.random() - 0.5)
      const selectedRoute = shuffledRoutes.slice(0, routeLength)

      // Create duty status events
      const events = []
      const currentTime = new Date(startTime)

      // Start day - Off Duty to On Duty
      events.push({
        time: new Date(currentTime),
        status: 'off_duty',
        location: selectedRoute[0].city,
        lat: selectedRoute[0].lat,
        lng: selectedRoute[0].lng,
        notes: 'Day start - Off duty',
      })

      // On Duty (pre-trip inspection)
      currentTime.setMinutes(currentTime.getMinutes() + 15)
      events.push({
        time: new Date(currentTime),
        status: 'on_duty',
        location: selectedRoute[0].city,
        lat: selectedRoute[0].lat,
        lng: selectedRoute[0].lng,
        notes: 'Pre-trip inspection',
      })

      // Start driving
      currentTime.setMinutes(currentTime.getMinutes() + 15)
      events.push({
        time: new Date(currentTime),
        status: 'driving',
        location: selectedRoute[0].city,
        lat: selectedRoute[0].lat,
        lng: selectedRoute[0].lng,
        notes: 'Start driving',
      })

      // Generate stops along the route
      for (let i = 1; i < selectedRoute.length; i++) {
        // Driving time between cities (2-4 hours)
        const drivingHours = Math.floor(Math.random() * 3) + 2
        currentTime.setHours(currentTime.getHours() + drivingHours)

        // Stop for loading/unloading
        events.push({
          time: new Date(currentTime),
          status: 'on_duty',
          location: selectedRoute[i].city,
          lat: selectedRoute[i].lat,
          lng: selectedRoute[i].lng,
          notes: 'Loading/unloading',
        })

        // Break time (30min-1hr)
        const breakMinutes = Math.floor(Math.random() * 31) + 30
        currentTime.setMinutes(currentTime.getMinutes() + breakMinutes)

        // Resume driving
        events.push({
          time: new Date(currentTime),
          status: 'driving',
          location: selectedRoute[i].city,
          lat: selectedRoute[i].lat,
          lng: selectedRoute[i].lng,
          notes: 'Resume driving',
        })
      }

      // End day
      currentTime.setHours(17, 0, 0, 0) // 5:00 PM
      events.push({
        time: new Date(currentTime),
        status: 'off_duty',
        location: selectedRoute[selectedRoute.length - 1].city,
        lat: selectedRoute[selectedRoute.length - 1].lat,
        lng: selectedRoute[selectedRoute.length - 1].lng,
        notes: 'End of day',
      })

      // Sleeper berth
      currentTime.setHours(18, 0, 0, 0) // 6:00 PM
      events.push({
        time: new Date(currentTime),
        status: 'sleeper_berth',
        location: selectedRoute[selectedRoute.length - 1].city,
        lat: selectedRoute[selectedRoute.length - 1].lat,
        lng: selectedRoute[selectedRoute.length - 1].lng,
        notes: 'Sleeper berth',
      })

      // Save to backend
      const dailyLogData = {
        driver_id: user?.id || 1, // Use logged user's ID, fallback to 1
        truck_id: Math.floor(Math.random() * 2) + 1, // Random truck (1 or 2)
        trailer_id: Math.floor(Math.random() * 3) + 1, // Random trailer (1, 2, or 3)
        status: 'completed',
      }

      const { data: dailyLog, error: dailyLogError } = await api.POST(
        '/api/daily-logs',
        {
          body: dailyLogData as components['schemas']['DailyLog'],
        }
      )

      if (dailyLogError || !dailyLog || !dailyLog.id) {
        throw new Error('Failed to create daily log')
      }

      // Save all duty status events
      for (const event of events) {
        const { error: dutyStatusError } = await api.POST(
          '/api/daily-logs/{daily_log_id}/duty-statuses',
          {
            params: {
              path: { daily_log_id: dailyLog?.id },
            },
            body: {
              duty_status: event.status,
              location_address: event.location,
              latitude: event.lat,
              longitude: event.lng,
              timestamp: event.time.toISOString(),
              notes: event.notes,
            } as components['schemas']['DutyStatus'],
          }
        )

        if (dutyStatusError) {
          console.error('Failed to create duty status:', dutyStatusError)
        }
      }

      // Format result for display
      const result = `✅ Simulated day saved to database!
      
Daily Log ID: ${dailyLog.id}
Start time: ${startTime.toLocaleTimeString()}
Route: ${selectedRoute.map(city => city.city).join(' → ')}
Total events: ${events.length}
Total driving time: ~${Math.floor((currentTime.getTime() - startTime.getTime()) / (1000 * 60 * 60))} hours

Events saved:
${events
  .map(
    (event, index) =>
      `${index + 1}. ${event.time.toLocaleTimeString()} - ${event.status.replace('_', ' ').toUpperCase()} at ${event.location}`
  )
  .join('\n')}`

      setSimulationResult(result)
      // Refresh the daily logs list
      await loadDailyLogs()
    } catch (error) {
      setSimulationResult('Error simulating day: ' + error)
    } finally {
      setIsSimulating(false)
    }
  }

  return (
    <div className='min-h-screen bg-base p-4'>
      <div className='max-w-4xl mx-auto'>
        <DashboardHeader onLogout={handleLogout} />

        <SimulationSection
          isSimulating={isSimulating}
          onSimulateDay={simulateDay}
          simulationResult={simulationResult}
        />

        <DailyLogsList
          dailyLogs={dailyLogs}
          isLoadingLogs={isLoadingLogs}
          onRefresh={loadDailyLogs}
        />
      </div>
    </div>
  )
}

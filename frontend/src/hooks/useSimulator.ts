import { useState } from 'react'
import { api } from '@/api/Api'
import type { components } from '@/types/api'
import { RouteService } from '@/utils/routeService'

// Utility function to round time to nearest 15-minute interval
const roundTo15Minutes = (date: Date): Date => {
  const rounded = new Date(date)
  const minutes = rounded.getMinutes()
  const roundedMinutes = Math.round(minutes / 15) * 15

  if (roundedMinutes === 60) {
    rounded.setHours(rounded.getHours() + 1, 0, 0, 0)
  } else {
    rounded.setMinutes(roundedMinutes, 0, 0)
  }

  return rounded
}

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

export function useSimulator() {
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationResult, setSimulationResult] = useState<string>('')

  const simulateDay = async (userId: number) => {
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

      // Generate realistic truck route for single day (2-3 cities, closer together)
      const routeLength = Math.floor(Math.random() * 2) + 2 // 2-3 cities
      const shuffledRoutes = [...TRUCK_ROUTES].sort(() => Math.random() - 0.5)
      let selectedRoute = shuffledRoutes.slice(0, routeLength)

      // Ensure cities are reasonably close for single-day simulation
      // Calculate total route distance and limit to ~300km for single day
      let totalDistance = 0
      for (let i = 1; i < selectedRoute.length; i++) {
        const prevCity = selectedRoute[i - 1]
        const currentCity = selectedRoute[i]

        const R = 6371 // Earth's radius in kilometers
        const dLat = ((currentCity.lat - prevCity.lat) * Math.PI) / 180
        const dLon = ((currentCity.lng - prevCity.lng) * Math.PI) / 180
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((prevCity.lat * Math.PI) / 180) *
            Math.cos((currentCity.lat * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        totalDistance += R * c
      }

      // If total distance is too long, try to find closer cities
      if (totalDistance > 300) {
        // Find cities that are closer together
        const closeCities = []
        for (let i = 0; i < TRUCK_ROUTES.length; i++) {
          for (let j = i + 1; j < TRUCK_ROUTES.length; j++) {
            const city1 = TRUCK_ROUTES[i]
            const city2 = TRUCK_ROUTES[j]

            const R = 6371
            const dLat = ((city2.lat - city1.lat) * Math.PI) / 180
            const dLon = ((city2.lng - city1.lng) * Math.PI) / 180
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((city1.lat * Math.PI) / 180) *
                Math.cos((city2.lat * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2)
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
            const distance = R * c

            if (distance <= 200) {
              // Within 200km
              closeCities.push([city1, city2])
            }
          }
        }

        if (closeCities.length > 0) {
          const randomPair =
            closeCities[Math.floor(Math.random() * closeCities.length)]
          selectedRoute = randomPair
        }
      }

      // Get road-following coordinates for the entire route
      const routeCoordinates = await RouteService.getMultiPointRoute(
        selectedRoute.map(city => ({ lat: city.lat, lng: city.lng }))
      )

      // Create duty status events
      const events = []
      const currentTime = new Date(startTime)

      // Start day - Off Duty to On Duty
      events.push({
        time: roundTo15Minutes(new Date(currentTime)),
        status: 'off_duty',
        location: selectedRoute[0].city,
        lat: selectedRoute[0].lat,
        lng: selectedRoute[0].lng,
        notes: 'Day start - Off duty',
      })

      // On Duty (pre-trip inspection)
      currentTime.setMinutes(currentTime.getMinutes() + 15)
      events.push({
        time: roundTo15Minutes(new Date(currentTime)),
        status: 'on_duty',
        location: selectedRoute[0].city,
        lat: selectedRoute[0].lat,
        lng: selectedRoute[0].lng,
        notes: 'Pre-trip inspection',
      })

      // Start driving
      currentTime.setMinutes(currentTime.getMinutes() + 15)
      events.push({
        time: roundTo15Minutes(new Date(currentTime)),
        status: 'driving',
        location: selectedRoute[0].city,
        lat: selectedRoute[0].lat,
        lng: selectedRoute[0].lng,
        notes: 'Start driving',
      })

      // Generate driving events along the road-following route
      let routeIndex = 0
      let cumulativeDistance = 0 // Track total distance for fueling stops
      const FUELING_INTERVAL = 1600 // Fuel every ~1000 miles (1600 km)

      for (let i = 1; i < selectedRoute.length; i++) {
        const prevCity = selectedRoute[i - 1]
        const currentCity = selectedRoute[i]

        // Find the road coordinates between these two cities
        const startCoordIndex = routeIndex
        let endCoordIndex = routeIndex

        // Find where this segment ends in the route coordinates
        while (endCoordIndex < routeCoordinates.length - 1) {
          const coord = routeCoordinates[endCoordIndex]
          const distanceToCurrentCity = Math.sqrt(
            Math.pow(coord.lat - currentCity.lat, 2) +
              Math.pow(coord.lng - currentCity.lng, 2)
          )

          if (distanceToCurrentCity < 0.01) {
            // Within ~1km of the city
            break
          }
          endCoordIndex++
        }

        // Calculate total distance for this segment using road coordinates
        let segmentDistance = 0
        for (let j = startCoordIndex; j < endCoordIndex; j++) {
          if (j < routeCoordinates.length - 1) {
            const coord1 = routeCoordinates[j]
            const coord2 = routeCoordinates[j + 1]

            const R = 6371
            const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180
            const dLon = ((coord2.lng - coord1.lng) * Math.PI) / 180
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((coord1.lat * Math.PI) / 180) *
                Math.cos((coord2.lat * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2)
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
            segmentDistance += R * c
          }
        }

        // Check if we need a fueling stop before this segment
        const distanceBeforeSegment = cumulativeDistance
        const distanceAfterSegment = cumulativeDistance + segmentDistance

        // If we'll exceed the fueling interval during this segment, add a fueling stop
        if (
          Math.floor(distanceBeforeSegment / FUELING_INTERVAL) <
          Math.floor(distanceAfterSegment / FUELING_INTERVAL)
        ) {
          // Calculate where to place the fueling stop (at the start of this segment)
          const fuelingTime = new Date(currentTime)

          // Stop for fueling
          events.push({
            time: roundTo15Minutes(new Date(fuelingTime)),
            status: 'on_duty',
            location: prevCity.city,
            lat: prevCity.lat,
            lng: prevCity.lng,
            notes: 'Fueling stop',
          })

          // Fueling takes 15-30 minutes
          const fuelingMinutes = Math.floor(Math.random() * 16) + 15
          fuelingTime.setMinutes(fuelingTime.getMinutes() + fuelingMinutes)

          // Resume driving after fueling
          events.push({
            time: roundTo15Minutes(new Date(fuelingTime)),
            status: 'driving',
            location: prevCity.city,
            lat: prevCity.lat,
            lng: prevCity.lng,
            notes: 'Resume driving after fueling',
          })

          // Update current time to account for fueling stop
          currentTime.setMinutes(currentTime.getMinutes() + fuelingMinutes)
        }

        // Calculate realistic driving time based on road distance
        const maxDrivingHours = 3 // Maximum 3 hours between stops for single day
        const truckSpeed = 60 + Math.random() * 15 // 60-75 km/h
        let drivingHours = segmentDistance / truckSpeed

        // If driving time would exceed max, cap it
        if (drivingHours > maxDrivingHours) {
          drivingHours = maxDrivingHours
        }

        // Add some realistic variation (traffic, stops, etc.)
        const variation = 0.8 + Math.random() * 0.4 // ±20% variation
        const finalDrivingHours = drivingHours * variation

        // Convert to minutes and add to current time
        const drivingMinutes = Math.floor(finalDrivingHours * 60)
        currentTime.setMinutes(currentTime.getMinutes() + drivingMinutes)

        // Add intermediate driving events along the road path
        const intermediateEvents = Math.floor(drivingMinutes / 30) // Every 30 minutes
        for (
          let j = 1;
          j <= intermediateEvents && j < endCoordIndex - startCoordIndex;
          j++
        ) {
          const progress = j / (intermediateEvents + 1)
          const coordIndex = Math.floor(
            startCoordIndex + progress * (endCoordIndex - startCoordIndex)
          )

          if (coordIndex < routeCoordinates.length) {
            const coord = routeCoordinates[coordIndex]
            const intermediateTime = new Date(currentTime)
            intermediateTime.setMinutes(
              currentTime.getMinutes() - drivingMinutes + j * 30
            )

            events.push({
              time: roundTo15Minutes(intermediateTime),
              status: 'driving',
              location: `En route to ${currentCity.city}`,
              lat: coord.lat,
              lng: coord.lng,
              notes: `Driving - ${Math.round(progress * 100)}% complete`,
            })
          }
        }

        // Stop for loading/unloading
        events.push({
          time: roundTo15Minutes(new Date(currentTime)),
          status: 'on_duty',
          location: currentCity.city,
          lat: currentCity.lat,
          lng: currentCity.lng,
          notes: 'Loading/unloading',
        })

        // Break time (30min-1hr)
        const breakMinutes = Math.floor(Math.random() * 31) + 30
        currentTime.setMinutes(currentTime.getMinutes() + breakMinutes)

        // Resume driving
        events.push({
          time: roundTo15Minutes(new Date(currentTime)),
          status: 'driving',
          location: currentCity.city,
          lat: currentCity.lat,
          lng: currentCity.lng,
          notes: 'Resume driving',
        })

        // Update cumulative distance for next iteration
        cumulativeDistance += segmentDistance
        routeIndex = endCoordIndex
      }

      // End day - add 1 hour after last driving event
      currentTime.setMinutes(currentTime.getMinutes() + 60)
      events.push({
        time: roundTo15Minutes(new Date(currentTime)),
        status: 'off_duty',
        location: selectedRoute[selectedRoute.length - 1].city,
        lat: selectedRoute[selectedRoute.length - 1].lat,
        lng: selectedRoute[selectedRoute.length - 1].lng,
        notes: 'End of day',
      })

      // Sleeper berth - add 1 more hour
      currentTime.setMinutes(currentTime.getMinutes() + 60)
      events.push({
        time: roundTo15Minutes(new Date(currentTime)),
        status: 'sleeper_berth',
        location: selectedRoute[selectedRoute.length - 1].city,
        lat: selectedRoute[selectedRoute.length - 1].lat,
        lng: selectedRoute[selectedRoute.length - 1].lng,
        notes: 'Sleeper berth',
      })

      // Save to backend
      const dailyLogData = {
        driver_id: userId,
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
          // handle error (removed console)
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
      return { success: true, dailyLog }
    } catch (error) {
      const errorMessage = 'Error simulating day: ' + error
      setSimulationResult(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsSimulating(false)
    }
  }

  return {
    isSimulating,
    simulationResult,
    simulateDay,
  }
}

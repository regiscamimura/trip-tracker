import { useEffect, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet'
import { Icon, LatLngBounds, DivIcon } from 'leaflet'
import type { components } from '@/types/api'
import { api } from '@/api/Api'
import { RouteService } from '@/utils/routeService'
import MarkerClusterGroup from 'react-leaflet-cluster'

// Utility function to calculate distance between two points (Haversine formula)
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Utility function to calculate time difference in hours
const calculateTimeDifference = (time1: string, time2: string): number => {
  const date1 = new Date(time1)
  const date2 = new Date(time2)
  return Math.abs(date2.getTime() - date1.getTime()) / (1000 * 60 * 60)
}

// Fix for default markers in react-leaflet
import 'leaflet/dist/leaflet.css'

// Fix for Leaflet marker icons in React
import L from 'leaflet'
delete (L.Icon.Default.prototype as unknown)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom marker icons for different duty statuses
const createCustomIcon = (color: string) => {
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8" fill="${color}" stroke="white" stroke-width="2"/>
      </svg>
    `)}`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  })
}

const dutyStatusIcons = {
  off_duty: createCustomIcon('#6B7280'), // gray
  on_duty: createCustomIcon('#3B82F6'), // blue
  driving: createCustomIcon('#10B981'), // green
  sleeper_berth: createCustomIcon('#8B5CF6'), // purple
}

const dutyStatusColors = {
  off_duty: 'bg-gray-500',
  on_duty: 'bg-blue-500',
  driving: 'bg-green-500',
  sleeper_berth: 'bg-purple-500',
}

// Special icon for fueling stops
const fuelingIcon = createCustomIcon('#F59E0B') // orange
const fuelingColor = 'bg-orange-500'

type DailyLog = components['schemas']['DailyLog']
type DutyStatus = components['schemas']['DutyStatus']

interface MapViewProps {
  dailyLog: DailyLog
  onBack: () => void
  onViewLogBook: () => void
}

// Component to fit map bounds to show all markers
function MapBounds({ dutyStatuses }: { dutyStatuses: DutyStatus[] }) {
  const map = useMap()

  useEffect(() => {
    if (dutyStatuses.length > 0) {
      const bounds = new LatLngBounds()
      dutyStatuses.forEach(status => {
        if (status.latitude && status.longitude) {
          bounds.extend([Number(status.latitude), Number(status.longitude)])
        }
      })
      map.fitBounds(bounds, { padding: [20, 20] })
    }
  }, [dutyStatuses, map])

  return null
}

export default function MapView({
  dailyLog,
  onBack,
  onViewLogBook,
}: MapViewProps) {
  const [dutyStatuses, setDutyStatuses] = useState<DutyStatus[]>([])
  const [isLoadingDutyStatuses, setIsLoadingDutyStatuses] = useState(false)
  const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(
    null
  )
  const [mapRef, setMapRef] = useState<unknown>(null)
  const [roadCoordinates, setRoadCoordinates] = useState<
    Array<{ lat: number; lng: number }>
  >([])

  // Load duty statuses for the specific daily log
  useEffect(() => {
    const loadDutyStatuses = async () => {
      setIsLoadingDutyStatuses(true)
      try {
        const { data, error } = await api.GET(
          '/api/daily-logs/{daily_log_id}/duty-statuses',
          {
            params: { path: { daily_log_id: dailyLog.id! } },
          }
        )

        if (!error && data) {
          // Sort by timestamp
          const sortedData = data.sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          )
          setDutyStatuses(sortedData)

          // Get road-following coordinates for the route
          const coordinates = sortedData
            .filter(status => status.latitude && status.longitude)
            .map(status => ({
              lat: Number(status.latitude),
              lng: Number(status.longitude),
            }))

          if (coordinates.length >= 2) {
            // Fetching road coordinates
            try {
              const roadCoords =
                await RouteService.getMultiPointRoute(coordinates)
              // Road coordinates received
              setRoadCoordinates(roadCoords)
            } catch {
              // Error fetching road coordinates
              // Fallback to direct coordinates
              setRoadCoordinates(coordinates)
            }
          }
        }
      } catch {
        // handle error (removed console)
      } finally {
        setIsLoadingDutyStatuses(false)
      }
    }

    if (dailyLog.id) {
      loadDutyStatuses()
    }
  }, [dailyLog.id])

  const handleEventClick = (index: number) => {
    setSelectedEventIndex(index)

    // Zoom and center to the selected event
    if (
      mapRef &&
      dutyStatuses[index]?.latitude &&
      dutyStatuses[index]?.longitude
    ) {
      const lat = Number(dutyStatuses[index].latitude)
      const lng = Number(dutyStatuses[index].longitude)
      mapRef.setView([lat, lng], 16, {
        animate: true,
        duration: 1,
      })
    }
  }

  if (isLoadingDutyStatuses) {
    return (
      <div className='bg-surface p-6'>
        <div className='flex justify-center items-center h-64'>
          <div className='text-brand text-lg'>Loading route data...</div>
        </div>
      </div>
    )
  }

  if (dutyStatuses.length === 0) {
    return (
      <div className='bg-surface p-6'>
        <div className='flex justify-center items-center h-64'>
          <div className='text-brand text-lg'>
            No route data found for this daily log
          </div>
        </div>
      </div>
    )
  }

  // Create route points from duty statuses
  const routePoints = dutyStatuses
    .filter(status => status.latitude && status.longitude)
    .map(
      status =>
        [Number(status.latitude), Number(status.longitude)] as [number, number]
    )

  return (
    <div className='bg-surface p-2 sm:p-6'>
      {/* Header */}
      <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4'>
        <div className='w-full lg:w-auto'>
          <div className='flex flex-col sm:flex-row gap-2 mb-2'>
            <button
              onClick={onBack}
              className='btn-outline-sm border-gray-600 hover:bg-gray-600/10 flex items-center gap-1 w-full sm:w-auto'
            >
              <svg
                className='w-4 h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 19l-7-7 7-7'
                />
              </svg>
              Back to List
            </button>
            <button
              onClick={onViewLogBook}
              className='btn-outline-sm border-green-600 hover:bg-green-600/10 flex items-center gap-1 w-full sm:w-auto'
            >
              <svg
                className='w-4 h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
              </svg>
              View Log Book
            </button>
          </div>
          <h2 className='text-lg sm:text-xl text-brand'>
            Route Map - Daily Log #{dailyLog.id}
          </h2>
          <p className='text-gray-300 text-sm'>
            {dailyLog.driver?.user?.first_name}{' '}
            {dailyLog.driver?.user?.last_name} •
            {new Date(dailyLog.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className='flex flex-wrap gap-2 text-xs sm:text-sm w-full lg:w-auto'>
          <div className='flex items-center gap-1'>
            <div className='w-3 h-3 rounded-full bg-gray-500'></div>
            <span className='text-gray-300'>Off Duty</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='w-3 h-3 rounded-full bg-blue-500'></div>
            <span className='text-gray-300'>On Duty</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='w-3 h-3 rounded-full bg-green-500'></div>
            <span className='text-gray-300'>Driving</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='w-3 h-3 rounded-full bg-purple-500'></div>
            <span className='text-gray-300'>Sleeper</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='w-3 h-3 rounded-full bg-orange-500'></div>
            <span className='text-gray-300'>Fueling</span>
          </div>
        </div>
      </div>

      {/* Main content with floating event list over map */}
      <div className='relative'>
        <div className='h-72 overflow-hidden'>
          <MapContainer
            center={[39.8283, -98.5795]} // Center of USA
            zoom={4}
            style={{ height: '100%', width: '100%' }}
            ref={setMapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />

            <MapBounds dutyStatuses={dutyStatuses} />

            {/* Road-following route line */}
            {roadCoordinates.length >= 2 && (
              <Polyline
                positions={roadCoordinates.map(coord => [coord.lat, coord.lng])}
                color='#F59E0B'
                weight={4}
                opacity={0.8}
              />
            )}

            {/* Distance and time labels for segments */}
            {dutyStatuses.map((status, index) => {
              if (index === dutyStatuses.length - 1) return null

              const current = status
              const next = dutyStatuses[index + 1]

              if (
                !current.latitude ||
                !current.longitude ||
                !next.latitude ||
                !next.longitude
              ) {
                return null
              }

              const distance = calculateDistance(
                Number(current.latitude),
                Number(current.longitude),
                Number(next.latitude),
                Number(next.longitude)
              )

              const timeDiff = calculateTimeDifference(
                current.timestamp,
                next.timestamp
              )

              // Calculate midpoint for label position
              const midLat =
                (Number(current.latitude) + Number(next.latitude)) / 2
              const midLng =
                (Number(current.longitude) + Number(next.longitude)) / 2

              return (
                <Marker
                  key={index}
                  position={[midLat, midLng]}
                  icon={
                    new DivIcon({
                      className: 'distance-label',
                      html: `<div class="text-white text-base font-semibold whitespace-nowrap">${distance > 0 ? `${distance.toFixed(1)}km • ` : ''}${timeDiff.toFixed(1)}h</div>`,
                      iconSize: [0, 0],
                      iconAnchor: [0, 0],
                    })
                  }
                />
              )
            })}

            {/* Markers with clustering */}
            <MarkerClusterGroup
              chunkedLoading
              maxClusterRadius={50}
              spiderfyOnMaxZoom={true}
              polygonOptions={{
                fillColor: '#F59E0B',
                color: '#F59E0B',
                weight: 0.5,
                opacity: 1,
                fillOpacity: 0.3,
              }}
              iconCreateFunction={cluster => {
                const count = cluster.getChildCount()
                const size = count > 10 ? 'lg' : count > 5 ? 'md' : 'sm'
                const colors = {
                  sm: '#10B981',
                  md: '#F59E0B',
                  lg: '#EF4444',
                }

                return new DivIcon({
                  html: `<div style="background-color: ${colors[size]}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px; border: 2px solid white;">${count}</div>`,
                  className: 'custom-cluster-icon',
                  iconSize: [30, 30],
                  iconAnchor: [15, 15],
                })
              }}
            >
              {dutyStatuses.map((status, index) => {
                if (!status.latitude || !status.longitude) return null

                // Check if this is a fueling stop
                const isFuelingStop = status.notes
                  ?.toLowerCase()
                  .includes('fueling')

                return (
                  <Marker
                    key={index}
                    position={[
                      Number(status.latitude),
                      Number(status.longitude),
                    ]}
                    icon={
                      isFuelingStop
                        ? fuelingIcon
                        : dutyStatusIcons[
                            status.duty_status as keyof typeof dutyStatusIcons
                          ] || dutyStatusIcons.off_duty
                    }
                    eventHandlers={{
                      click: () => setSelectedEventIndex(index),
                    }}
                  >
                    <Popup>
                      <div className='text-sm'>
                        <div className='font-semibold text-gray-900'>
                          Event #{index + 1}
                          {isFuelingStop && (
                            <span className='ml-2 text-orange-600 font-bold'>
                              ⛽
                            </span>
                          )}
                        </div>
                        <div className='text-gray-700'>
                          <div>
                            <strong>Status:</strong>{' '}
                            {status.duty_status.replace('_', ' ').toUpperCase()}
                          </div>
                          <div>
                            <strong>Location:</strong> {status.location_address}
                          </div>
                          <div>
                            <strong>Time:</strong>{' '}
                            {new Date(status.timestamp).toLocaleString()}
                          </div>
                          {status.notes && (
                            <div>
                              <strong>Notes:</strong> {status.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}
            </MarkerClusterGroup>
          </MapContainer>
        </div>

        {/* Floating Event List */}
        <div className='absolute top-2 sm:top-4 right-1 sm:right-4 w-28 sm:w-36 bg-gray-900/50 backdrop-blur-sm border border-gray-700 shadow-lg z-[1000] pointer-events-auto hover:bg-gray-900/80 active:bg-gray-900/90 transition-all duration-200'>
          <div className='p-1 sm:p-2 border-b border-gray-700'>
            <h3 className='text-brand font-medium text-xs'>
              Events ({dutyStatuses.length})
            </h3>
          </div>
          <div className='max-h-20 sm:max-h-48 overflow-y-auto'>
            <div className='p-1 space-y-0.5'>
              {dutyStatuses.map((status, index) => {
                const isFuelingStop = status.notes
                  ?.toLowerCase()
                  .includes('fueling')

                return (
                  <div
                    key={index}
                    className={`p-1 sm:p-1.5 rounded cursor-pointer transition-colors ${
                      selectedEventIndex === index
                        ? 'bg-accent/30 border border-accent'
                        : 'hover:bg-gray-800/50'
                    }`}
                    onClick={() => handleEventClick(index)}
                  >
                    <div className='flex items-center gap-1 sm:gap-1.5'>
                      <div
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          isFuelingStop
                            ? fuelingColor
                            : dutyStatusColors[
                                status.duty_status as keyof typeof dutyStatusColors
                              ] || 'bg-gray-500'
                        }`}
                      ></div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex justify-between items-center'>
                          <span className='text-white text-xs font-medium'>
                            #{index + 1}
                            {isFuelingStop && (
                              <span className='ml-1 text-orange-400'>⛽</span>
                            )}
                          </span>
                          <span className='text-gray-400 text-xs'>
                            {new Date(status.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className='text-brand text-xs font-medium truncate'>
                          {status.duty_status.replace('_', ' ').toUpperCase()}
                          {isFuelingStop && ' - FUELING'}
                        </div>
                        <div className='text-gray-300 text-xs truncate'>
                          {status.location_address}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Route summary */}
      <div className='mt-4 p-3 bg-gray-800'>
        <div className='text-brand font-medium mb-2'>Route Summary</div>
        <div className='text-sm text-gray-300 space-y-1'>
          <div>
            <strong>Total Events:</strong> {dutyStatuses.length}
          </div>
          <div>
            <strong>Route Points:</strong> {routePoints.length}
          </div>
          <div>
            <strong>Start:</strong> {dutyStatuses[0]?.location_address}
          </div>
          <div>
            <strong>End:</strong>{' '}
            {dutyStatuses[dutyStatuses.length - 1]?.location_address}
          </div>
          {dutyStatuses.length > 1 && (
            <>
              <div>
                <strong>Total Distance:</strong>{' '}
                {(() => {
                  let totalDistance = 0
                  for (let i = 0; i < dutyStatuses.length - 1; i++) {
                    const current = dutyStatuses[i]
                    const next = dutyStatuses[i + 1]
                    if (
                      current.latitude &&
                      current.longitude &&
                      next.latitude &&
                      next.longitude
                    ) {
                      totalDistance += calculateDistance(
                        Number(current.latitude),
                        Number(current.longitude),
                        Number(next.latitude),
                        Number(next.longitude)
                      )
                    }
                  }
                  return `${totalDistance.toFixed(1)} km`
                })()}
              </div>
              <div>
                <strong>Total Time:</strong>{' '}
                {(() => {
                  const totalHours = calculateTimeDifference(
                    dutyStatuses[0].timestamp,
                    dutyStatuses[dutyStatuses.length - 1].timestamp
                  )
                  return `${totalHours.toFixed(1)} hours`
                })()}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Route segments with distance and time */}
      {dutyStatuses.length > 1 && (
        <div className='mt-4 p-3 bg-gray-800'>
          <div className='text-brand font-medium mb-2'>Route Segments</div>
          <div className='text-sm text-gray-300 space-y-2'>
            {dutyStatuses.map((status, index) => {
              if (index === dutyStatuses.length - 1) return null

              const current = status
              const next = dutyStatuses[index + 1]

              if (
                !current.latitude ||
                !current.longitude ||
                !next.latitude ||
                !next.longitude
              ) {
                return null
              }

              const distance = calculateDistance(
                Number(current.latitude),
                Number(current.longitude),
                Number(next.latitude),
                Number(next.longitude)
              )

              const timeDiff = calculateTimeDifference(
                current.timestamp,
                next.timestamp
              )

              return (
                <div
                  key={index}
                  className='flex justify-between items-center p-2 bg-gray-700 rounded'
                >
                  <div>
                    <div className='font-medium'>
                      #{index + 1} → #{index + 2}
                    </div>
                    <div className='text-xs text-gray-400'>
                      {current.location_address} → {next.location_address}
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='font-medium'>{distance.toFixed(1)} km</div>
                    <div className='text-xs text-gray-400'>
                      {timeDiff.toFixed(1)}h
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

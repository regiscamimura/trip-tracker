// Mapbox Directions API utility for road-following coordinates
// Free tier: 100,000 requests/month
// Requires Mapbox access token

interface RouteCoordinate {
  lat: number
  lng: number
}

interface MapboxRouteResponse {
  routes: Array<{
    geometry: {
      coordinates: Array<[number, number]> // [lng, lat] format
    }
    distance: number
    duration: number
  }>
  code: string
}

export class RouteService {
  private static readonly BASE_URL =
    'https://api.mapbox.com/directions/v5/mapbox/driving'

  /**
   * Get the Mapbox access token from environment or show error
   */
  private static getAccessToken(): string {
    // In a real app, this would come from environment variables
    // For now, we'll use a placeholder and show instructions
    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

    if (!token) {
      console.error(`
🚨 Mapbox Access Token Required!
To use road-following routes, you need a Mapbox access token:

1. Sign up at https://account.mapbox.com/ (free)
2. Create a new access token
3. Add to your .env file:
   VITE_MAPBOX_ACCESS_TOKEN=your_token_here

For now, routes will use straight lines.
      `)
      return ''
    }

    return token
  }

  /**
   * Get road-following coordinates between two points
   */
  static async getRouteCoordinates(
    start: RouteCoordinate,
    end: RouteCoordinate,
    profile: 'driving' | 'driving-traffic' = 'driving'
  ): Promise<RouteCoordinate[]> {
    const accessToken = this.getAccessToken()

    if (!accessToken) {
      // Fallback to direct line if no token
      return [start, end]
    }

    try {
      const coordinates = `${start.lng},${start.lat};${end.lng},${end.lat}`
      const url = `${this.BASE_URL}/${coordinates}?geometries=geojson&access_token=${accessToken}`

      console.log('Mapbox API URL:', url)

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(
          `Mapbox API error: ${response.status} ${response.statusText}`
        )
      }

      const data: MapboxRouteResponse = await response.json()
      console.log('Mapbox API response:', data)

      if (!data.routes || data.routes.length === 0) {
        throw new Error('No route found')
      }

      // Convert [lng, lat] back to {lat, lng} format
      const coordinates_result = data.routes[0].geometry.coordinates.map(
        coord => ({
          lng: coord[0],
          lat: coord[1],
        })
      )

      return coordinates_result
    } catch (error) {
      console.error('Error fetching route coordinates:', error)
      // Fallback to direct line if API fails
      return [start, end]
    }
  }

  /**
   * Get route with multiple waypoints
   */
  static async getMultiPointRoute(
    waypoints: RouteCoordinate[],
    profile: 'driving' | 'driving-traffic' = 'driving'
  ): Promise<RouteCoordinate[]> {
    if (waypoints.length < 2) {
      return waypoints
    }

    const accessToken = this.getAccessToken()

    if (!accessToken) {
      // Fallback to direct lines if no token
      return waypoints
    }

    try {
      const coordinates = waypoints
        .map(point => `${point.lng},${point.lat}`)
        .join(';')
      const url = `${this.BASE_URL}/${coordinates}?geometries=geojson&access_token=${accessToken}`

      console.log('Mapbox multi-point URL:', url)

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(
          `Mapbox API error: ${response.status} ${response.statusText}`
        )
      }

      const data: MapboxRouteResponse = await response.json()
      console.log('Mapbox multi-point response:', data)

      if (!data.routes || data.routes.length === 0) {
        throw new Error('No route found')
      }

      // Convert [lng, lat] back to {lat, lng} format
      const coordinates_result = data.routes[0].geometry.coordinates.map(
        coord => ({
          lng: coord[0],
          lat: coord[1],
        })
      )

      return coordinates_result
    } catch (error) {
      console.error('Error fetching multi-point route:', error)
      // Fallback to direct lines if API fails
      return waypoints
    }
  }

  /**
   * Calculate total distance and duration from route response
   */
  static getRouteStats(routeResponse: MapboxRouteResponse): {
    distance: number
    duration: number
  } {
    if (!routeResponse.routes || routeResponse.routes.length === 0) {
      return { distance: 0, duration: 0 }
    }

    const route = routeResponse.routes[0]

    return {
      distance: route.distance / 1000, // Convert to km
      duration: route.duration / 3600, // Convert to hours
    }
  }
}

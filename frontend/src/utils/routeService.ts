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
      return ''
    }

    return token
  }

  /**
   * Get road-following coordinates between two points
   */
  static async getRouteCoordinates(
    start: RouteCoordinate,
    end: RouteCoordinate
  ): Promise<RouteCoordinate[]> {
    const accessToken = this.getAccessToken()

    if (!accessToken) {
      // Fallback to direct line if no token
      return [start, end]
    }

    try {
      const coordinates = `${start.lng},${start.lat};${end.lng},${end.lat}`
      const url = `${this.BASE_URL}/${coordinates}?geometries=geojson&access_token=${accessToken}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(
          `Mapbox API error: ${response.status} ${response.statusText}`
        )
      }

      const data: MapboxRouteResponse = await response.json()

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
    } catch {
      // Fallback to direct line if API fails
      return [start, end]
    }
  }

  /**
   * Get route with multiple waypoints
   */
  static async getMultiPointRoute(
    waypoints: RouteCoordinate[]
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

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(
          `Mapbox API error: ${response.status} ${response.statusText}`
        )
      }

      const data: MapboxRouteResponse = await response.json()

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
    } catch {
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

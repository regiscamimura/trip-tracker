import axios from 'axios'
import type { AxiosInstance } from 'axios'
import type { operations, components } from '@/types/api'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Type aliases for better readability
type LoginRequest = components['schemas']['LoginSchema']
type LoginResponse = components['schemas']['LoginResponseSchema']
type Trip = components['schemas']['Trip']
type User = components['schemas']['User']

// Extract response types from operations
type LoginOperation = operations['trips_api_login']
type ListTripsOperation = operations['trips_api_list_trips']
type GetTripOperation = operations['trips_api_get_trip']
type CreateTripOperation = operations['trips_api_create_trip']
type UpdateTripOperation = operations['trips_api_update_trip']
type DeleteTripOperation = operations['trips_api_delete_trip']

// Helper type to extract response data type
type ResponseData<T> = T extends {
  responses: { 200: { content: { 'application/json': infer R } } }
}
  ? R
  : never

// Helper type to extract request body type
type RequestBody<T> = T extends {
  requestBody: { content: { 'application/json': infer R } }
}
  ? R
  : never

// Helper type to extract path parameters
type PathParams<T> = T extends { parameters: { path: infer P } } ? P : never

// Helper type to extract query parameters
type QueryParams<T> = T extends { parameters: { query: infer Q } } ? Q : never

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Important for session-based auth
    })

    // Add request interceptor for session-based auth
    this.client.interceptors.request.use(config => {
      // For session-based auth, we don't need to add tokens
      // The session cookie will be automatically included
      return config
    })

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          // Clear any stored auth data on 401
          this.clearAuthToken()
          localStorage.removeItem('user_info')
          // The auth context will handle the redirect
        }
        return Promise.reject(error)
      }
    )
  }

  // Auth methods
  async login(
    data: RequestBody<LoginOperation>
  ): Promise<ResponseData<LoginOperation>> {
    const response = await this.client.post<ResponseData<LoginOperation>>(
      '/login',
      data
    )
    return response.data
  }

  async logout(): Promise<void> {
    await this.client.post('/logout')
  }

  // Trip methods
  async listTrips(): Promise<ResponseData<ListTripsOperation>> {
    const response =
      await this.client.get<ResponseData<ListTripsOperation>>('/trips')
    return response.data
  }

  async getTrip(
    tripId: PathParams<GetTripOperation>['trip_id']
  ): Promise<ResponseData<GetTripOperation>> {
    const response = await this.client.get<ResponseData<GetTripOperation>>(
      `/trips/${tripId}`
    )
    return response.data
  }

  async createTrip(
    payload: QueryParams<CreateTripOperation>['payload']
  ): Promise<ResponseData<CreateTripOperation>> {
    const response = await this.client.post<ResponseData<CreateTripOperation>>(
      `/trips?payload=${encodeURIComponent(payload)}`
    )
    return response.data
  }

  async updateTrip(
    tripId: PathParams<UpdateTripOperation>['trip_id'],
    payload: QueryParams<UpdateTripOperation>['payload']
  ): Promise<ResponseData<UpdateTripOperation>> {
    const response = await this.client.put<ResponseData<UpdateTripOperation>>(
      `/trips/${tripId}?payload=${encodeURIComponent(payload)}`
    )
    return response.data
  }

  async deleteTrip(
    tripId: PathParams<DeleteTripOperation>['trip_id']
  ): Promise<void> {
    await this.client.delete(`/trips/${tripId}`)
  }

  // Utility methods for session-based auth
  setAuthToken(token: string): void {
    // For session-based auth, we might not need to store tokens
    // But keeping this for compatibility
    localStorage.setItem('auth_token', token)
  }

  clearAuthToken(): void {
    localStorage.removeItem('auth_token')
  }

  isAuthenticated(): boolean {
    // For session-based auth, check if we have user info stored
    return !!localStorage.getItem('user_info')
  }
}

// Export singleton instance
export const api = new ApiClient()

// Export types for external use
export type {
  LoginRequest,
  LoginResponse,
  Trip,
  User,
  ResponseData,
  RequestBody,
  PathParams,
  QueryParams,
}

// Export the class for testing or custom instances
export { ApiClient }

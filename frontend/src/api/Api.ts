import openapiFetch from 'openapi-fetch'
import type { paths } from '@/types/api'

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '/api' : 'http://localhost:8000')

// Ensure we don't double up on /api
const normalizedBaseUrl = API_BASE_URL.endsWith('/api')
  ? API_BASE_URL.slice(0, -4)
  : API_BASE_URL

// Create the API client with full type safety
export const api = openapiFetch<paths>({
  baseUrl: normalizedBaseUrl,
  credentials: 'include', // For session-based auth
})

// Export types for convenience
export type { components } from '@/types/api'

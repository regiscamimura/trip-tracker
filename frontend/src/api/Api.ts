import openapiFetch from 'openapi-fetch'
import type { paths } from '@/types/api'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Create the API client with full type safety
export const api = openapiFetch<paths>({
  baseUrl: API_BASE_URL,
  credentials: 'include', // For session-based auth
})

// Export types for convenience
export type { components } from '@/types/api'

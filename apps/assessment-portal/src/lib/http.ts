import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API,
  timeout: 10000,
  withCredentials: false,
})

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Add auth token from cookie (like survey-portal)
    if (typeof document !== 'undefined') {
      const token = document.cookie.split('; ').find(c => c.startsWith('token='))?.split('=')[1]
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    config.withCredentials = false
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for handling errors (like survey-portal)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const offline = typeof navigator !== 'undefined' && !navigator.onLine
    if (offline) {
      error.classification = { kind: 'offline', message: 'You are offline.' }
    } else if (error.response?.status === 401 || error.response?.status === 403) {
      error.classification = { kind: 'unauthorized', message: 'Session expired or access denied.' }
      // Clear token cookie and redirect to login
      if (typeof document !== 'undefined') {
        document.cookie = 'token=; path=/; max-age=0'
        const currentPath = window.location.pathname + window.location.search
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
      }
    } else if (error.code === 'ECONNABORTED') {
      error.classification = { kind: 'timeout', message: 'Request timed out.' }
    } else {
      const status = error.response?.status
      error.classification = { kind: 'api', message: error.response?.data?.message ?? `API error (${status ?? 'network'})` }
    }
    return Promise.reject(error)
  }
)

export { api }

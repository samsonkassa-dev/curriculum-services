import axios from "axios"

export const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API,
  withCredentials: true,
})

http.interceptors.request.use((config) => {
  // Skip auth header for public survey endpoints
  const url = config.url || ''
  const isPublicSurveyEndpoint = url.includes('/survey/check-link-validity') || url.includes('/survey/submit-survey-answers')

  if (!isPublicSurveyEndpoint && typeof document !== 'undefined') {
    const token = document.cookie.split('; ').find(c => c.startsWith('token='))?.split('=')[1]
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  if (isPublicSurveyEndpoint) {
    // remove credentials to avoid CORS with wildcard origins
    config.withCredentials = false
  }
  return config
})

http.interceptors.response.use(
  (res) => res,
  (error) => {
    const offline = typeof navigator !== 'undefined' && !navigator.onLine
    if (offline) error.classification = { kind: 'offline', message: 'You are offline.' }
    else if (error.response?.status === 401) {
      error.classification = { kind: 'unauthorized', message: 'Session expired.' }
    } else if (error.code === 'ECONNABORTED') {
      error.classification = { kind: 'timeout', message: 'Request timed out.' }
    } else {
      const status = error.response?.status
      error.classification = { kind: 'api', message: error.response?.data?.message ?? `API error (${status ?? 'network'})` }
    }
    return Promise.reject(error)
  }
)



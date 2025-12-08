import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api/v1'

export const http = axios.create({ baseURL, timeout: 10000 })

export function getAuthToken(): string | null {
  return localStorage.getItem('admin_token')
}

http.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (resp) => resp,
  (error) => {
    const status = error?.response?.status
    if (status === 401 || status === 403) {
      try {
        localStorage.removeItem('admin_token')
      } catch {}
      const curr = window.location.pathname + window.location.search
      window.location.href = `/login?from=${encodeURIComponent(curr)}`
    }
    return Promise.reject(error)
  }
)

export default http


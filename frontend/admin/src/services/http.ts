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
    const requestUrl = String(error?.config?.url || '')
    const hasToken = !!getAuthToken()
    const isLoginApi = requestUrl.includes('/auth/login')
    const isProfileApi = requestUrl.includes('/auth/me')

    // 只在认证链路失败时强制退回登录页，避免单个业务接口 403/401 导致“闪一下就退回登录”
    const shouldForceLogout =
      hasToken &&
      !isLoginApi &&
      ((status === 401 && isProfileApi) || (status === 403 && isProfileApi))

    if (shouldForceLogout) {
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

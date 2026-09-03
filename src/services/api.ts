import axios from 'axios'
// API depends on the backend URL.
// If the backend IP changes, update this URL.
const api = axios.create({
  baseURL: '/ispas-api/api',

  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

// ==========================================
// REQUEST INTERCEPTOR
// Automatically attach Sanctum token
// ==========================================
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('token')
    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
// ==========================================
// RESPONSE INTERCEPTOR
// Handle expired / invalid token
// ==========================================
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Remove invalid login information
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('role')
      /*
       * Don't redirect again if we're
       * already on a login page.
       */
      const currentPath =
        window.location.pathname
      if (
        currentPath.startsWith('/admin')
      ) {

        if (
          currentPath !== '/admin/login'
        ) {
          window.location.href =
            '/admin/login'
        }
      } else {
        if (currentPath !== '/') {
          window.location.href = '/'
        }
      }
    }
    return Promise.reject(error)
  }
)
export default api

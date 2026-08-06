import axios from 'axios'

//api depends on the backend url, so if you change the backend url, you need to change it here too
const api = axios.create({
 baseURL: ' http://192.168.1.154:8000/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api

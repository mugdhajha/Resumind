import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('resumind_token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

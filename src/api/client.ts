import axios from 'axios'
import { getApiBaseUrl } from './config'

export const TOKEN_STORAGE_KEY = 'shopsphere_token'
export const USER_STORAGE_KEY = 'shopsphere_user'

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

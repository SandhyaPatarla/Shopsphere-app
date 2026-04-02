/** Base URL from env, no trailing slash. */
export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL
  if (raw == null || raw === '') {
    console.warn('VITE_API_URL is not set; API calls may fail.')
    return ''
  }
  return String(raw).replace(/\/+$/, '')
}

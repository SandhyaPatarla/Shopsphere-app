import axios from 'axios'

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { errorMessage?: string } | undefined
    if (data && typeof data.errorMessage === 'string') return data.errorMessage
    return error.message
  }
  if (error instanceof Error) return error.message
  return 'Something went wrong'
}

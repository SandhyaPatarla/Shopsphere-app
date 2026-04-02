import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'

interface ProtectedRouteProps {
  children: React.ReactElement
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = useAppSelector((s) => s.auth.token)
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

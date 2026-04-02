import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'
import ProtectedRoute from './ProtectedRoute'

interface AdminRouteProps {
  children: React.ReactElement
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const role = useAppSelector((s) => s.auth.user?.role)

  return (
    <ProtectedRoute>
      {role === 'admin' ? children : <Navigate to="/" replace state={{ adminDenied: true }} />}
    </ProtectedRoute>
  )
}

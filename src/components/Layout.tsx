import { Outlet } from 'react-router-dom'
import AppBar from './AppBar'

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-surface-muted bg-surface py-8 text-center text-sm text-text-muted">
        <p>Shopsphere — fresh produce, one cart at a time.</p>
      </footer>
    </div>
  )
}

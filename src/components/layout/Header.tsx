import { Link, useLocation } from 'react-router-dom'
import { Settings, Home, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUserStore } from '@/stores/userStore'
import { Badge } from '@/components/ui/badge'

export function Header() {
  const location = useLocation()
  const users = useUserStore((state) => state.users)
  const selectedUserIds = useUserStore((state) => state.selectedUserIds)

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/achievements', label: 'Achievements', icon: Trophy },
    { path: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            <span className="font-bold text-lg">GW2 Achievement Tracker</span>
          </Link>

          <nav className="flex items-center gap-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {users.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedUserIds.length} / {users.length} users selected
              </span>
              <Badge variant="secondary">{users.length} total</Badge>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

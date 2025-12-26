'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NessLogo } from './ness-logo'
import { useAuth } from '@/lib/auth-context'
import {
  LayoutDashboard,
  Key,
  Lock,
  Plug,
  FileText,
  ShieldCheck,
  MessageSquare,
  CreditCard,
  Users,
  Settings,
  LogOut,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'API Keys', href: '/dashboard/api-keys', icon: Key },
  { name: 'Secrets', href: '/dashboard/secrets', icon: Lock },
  { name: 'Integrations', href: '/dashboard/integrations', icon: Plug },
  { name: 'Documents', href: '/dashboard/documents', icon: FileText },
  { name: 'Compliance', href: '/dashboard/compliance', icon: ShieldCheck },
  { name: 'Chat', href: '/dashboard/chat', icon: MessageSquare },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Team', href: '/dashboard/team', icon: Users },
]

const bottomNavigation = [
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // Get user initials for avatar
  const getInitials = () => {
    if (!user?.displayName) return user?.email?.charAt(0).toUpperCase() || "U"
    const names = user.displayName.split(" ")
    return names.length > 1 
      ? `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
      : names[0].charAt(0).toUpperCase()
  }

  return (
    <div className="flex h-screen w-64 flex-col glass-strong dark:glass-strong-dark border-r border-white/20 dark:border-gray-800/50">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-white/10 dark:border-gray-800/30">
        <Link href="/dashboard">
          <NessLogo size="lg" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-800/50 glass-hover dark:glass-hover-dark'
              )}
            >
              <item.icon className={cn(
                'h-5 w-5 flex-shrink-0 transition-colors',
                isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
              )} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-white/10 dark:border-gray-800/30 px-3 py-4 space-y-1">
        {bottomNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-800/50'
              )}
            >
              <item.icon className={cn(
                'h-5 w-5 flex-shrink-0 transition-colors',
                isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
              )} />
              {item.name}
            </Link>
          )
        })}
        
        {/* Logout Button */}
        <button
          onClick={() => logout()}
          className="w-full group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          Sign Out
        </button>
      </div>

      {/* User Profile */}
      <div className="border-t border-white/10 dark:border-gray-800/30 p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-semibold">
            {getInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.displayName || "User"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email || "Loading..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NessLogo } from './ness-logo'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n/context'
import { Badge } from '@/components/ui/badge'
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

export function Sidebar() {
  const pathname = usePathname()
  const { user, role, logout } = useAuth()
  const { t } = useI18n()

  const navigation = [
    { name: t.navigation.dashboard, href: '/dashboard', icon: LayoutDashboard },
    { name: t.navigation.apiKeys, href: '/dashboard/api-keys', icon: Key },
    { name: t.navigation.secrets, href: '/dashboard/secrets', icon: Lock },
    { name: t.navigation.integrations, href: '/dashboard/integrations', icon: Plug },
    { name: t.navigation.documents, href: '/dashboard/documents', icon: FileText },
    { name: t.navigation.compliance, href: '/dashboard/compliance', icon: ShieldCheck },
    { name: t.navigation.chat, href: '/dashboard/chat', icon: MessageSquare },
    { name: t.navigation.billing, href: '/dashboard/billing', icon: CreditCard },
    { name: t.navigation.team, href: '/dashboard/team', icon: Users },
  ]

  const bottomNavigation = [
    { name: t.navigation.settings, href: '/dashboard/settings', icon: Settings },
  ]

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
      {/* Logo - Header fixo com mesma altura do header da página */}
      <div className="sticky top-0 z-20 flex h-16 items-center justify-start px-3 border-b border-white/10 dark:border-gray-800/30 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 backdrop-blur-sm">
        <Link href="/dashboard" className="pl-3">
          <NessLogo size="lg" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 pt-6 lg:pt-8 pb-4 overflow-y-auto">
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
          {t.common.signOut}
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
            {role && (
              <div className="mt-1.5">
                <Badge 
                  variant={
                    role === 'super_admin' ? 'default' :
                    role === 'admin' ? 'default' :
                    role === 'finops_manager' ? 'outline' :
                    role === 'auditor' ? 'outline' :
                    'outline'
                  }
                  className={`text-xs px-2 py-0.5 ${
                    role === 'super_admin' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                    role === 'admin' ? 'bg-primary/20 text-primary border-primary/30' :
                    role === 'finops_manager' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    role === 'auditor' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                    'bg-gray-500/10 text-gray-400 border-gray-500/20'
                  }`}
                >
                  {role === 'super_admin' ? '⭐ Super Admin' : 
                   role === 'admin' ? '👑 Admin' :
                   role === 'finops_manager' ? '💰 FinOps Manager' :
                   role === 'auditor' ? '🔍 Auditor' :
                   role === 'viewer' ? '👁️ Viewer' : '👤 User'}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
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
  BookOpen,
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
    { name: "Manual", href: '/dashboard/manual', icon: BookOpen },
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
    <div className="flex h-screen w-64 flex-col bg-zinc-950 border-r border-zinc-800">
      {/* Logo - Header fixo */}
      <div className="flex h-16 items-center justify-start px-6 border-b border-zinc-800">
        <Link href="/dashboard">
          <span className="font-brand font-medium text-2xl tracking-tight text-white">
            n.process<span className="text-[#00ade8]">.</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 pt-6 pb-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors relative',
                isActive
                  ? 'text-white border-l-2 border-brand-ness'
                  : 'text-zinc-400 hover:text-zinc-300'
              )}
            >
              <item.icon className={cn(
                'h-5 w-5 flex-shrink-0 transition-colors',
                isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-400'
              )} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-zinc-800 px-3 py-4 space-y-1">
        {bottomNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors relative',
                isActive
                  ? 'text-white border-l-2 border-brand-ness'
                  : 'text-zinc-400 hover:text-zinc-300'
              )}
            >
              <item.icon className={cn(
                'h-5 w-5 flex-shrink-0 transition-colors',
                isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-400'
              )} />
              {item.name}
            </Link>
          )
        })}
        
        {/* Logout Button */}
        <button
          onClick={() => logout()}
          className="w-full group flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors text-zinc-400 hover:text-red-400"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {t.common.signOut}
        </button>
      </div>

      {/* User Profile */}
      <div className="border-t border-zinc-800 p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-brand-ness flex items-center justify-center text-white font-semibold text-sm">
            {getInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.displayName || "User"}
            </p>
            <p className="text-xs text-zinc-400 truncate">
              {user?.email || "Loading..."}
            </p>
            {role && (
              <div className="mt-1.5">
                <Badge 
                  variant="outline"
                  className={cn(
                    "text-xs px-2 py-0.5 border-zinc-800",
                    role === 'super_admin' && 'bg-purple-500/10 text-purple-400 border-purple-500/30',
                    role === 'admin' && 'bg-brand-ness/10 text-brand-ness border-brand-ness/30',
                    role === 'finops_manager' && 'bg-zinc-800/50 text-zinc-300 border-zinc-700',
                    role === 'auditor' && 'bg-zinc-800/50 text-zinc-300 border-zinc-700',
                    !['super_admin', 'admin', 'finops_manager', 'auditor'].includes(role) && 'bg-zinc-800/50 text-zinc-400 border-zinc-700'
                  )}
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

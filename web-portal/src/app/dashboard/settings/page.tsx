'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/page-header'
import { User, Bell } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n/context'

export default function SettingsPage() {
  const { user, role, isAdmin } = useAuth()
  const { t } = useI18n()
  
  const getRoleDisplayName = (role: string | null) => {
    switch (role) {
      case 'super_admin': return 'Super Admin'
      case 'admin': return 'Admin'
      case 'finops_manager': return 'FinOps Manager'
      case 'auditor': return 'Auditor'
      case 'viewer': return 'Viewer'
      case 'user': return 'User'
      default: return 'User'
    }
  }

  return (
    <>
      <PageHeader title={t.settings.title} description="Manage your profile and notification preferences" />
      <div className="p-6 lg:p-8 space-y-8">
        {/* Profile */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your personal information (Managed by Google Auth)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              {t.settings.fullName}
            </label>
            <Input className="glass" defaultValue={user?.displayName || "User Name"} disabled />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              {t.settings.email}
            </label>
            <Input className="glass" type="email" defaultValue={user?.email || "user@example.com"} disabled />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              {t.settings.role}
            </label>
            <div className="flex items-center gap-2">
              <Badge 
                variant={isAdmin ? "default" : "outline"} 
                className={`text-sm ${
                  role === 'super_admin' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                  role === 'admin' ? 'bg-primary/20 text-primary border-primary/30' :
                  ''
                }`}
              >
                {role === 'super_admin' ? '⭐ Super Admin' : getRoleDisplayName(role)}
              </Badge>
              {isAdmin && (
                <Badge variant="default" className="text-xs bg-green-500/20 text-green-600 dark:text-green-400">
                  {t.settings.adminAccess}
                </Badge>
              )}
              {role === 'super_admin' && (
                <Badge variant="default" className="text-xs bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30">
                  Full Access
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {role === 'super_admin' 
                ? 'You have full administrative access to all features and settings.'
                : isAdmin 
                ? t.settings.adminAccessDesc
                : t.settings.currentAccessLevel}
            </p>
            {role && (
              <details className="mt-2">
                <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                  Debug Info (click to expand)
                </summary>
                <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
                  <div>Role: <strong>{role}</strong></div>
                  <div>Is Admin: <strong>{isAdmin ? 'Yes' : 'No'}</strong></div>
                  <div>Is Super Admin: <strong>{role === 'super_admin' ? 'Yes' : 'No'}</strong></div>
                  <div>UID: <strong>{user?.uid}</strong></div>
                </div>
              </details>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>{t.settings.notifications}</CardTitle>
              <CardDescription>{t.settings.notifications}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {t.settings.emailNotifications}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {t.settings.emailNotificationsDesc}
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 text-primary rounded"
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {t.settings.complianceAlerts}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {t.settings.complianceAlertsDesc}
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 text-primary rounded"
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {t.settings.usageAlerts}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {t.settings.usageAlertsDesc}
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 text-primary rounded"
            />
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  )
}

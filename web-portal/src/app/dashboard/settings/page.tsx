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
              <Badge variant={isAdmin ? "default" : "outline"} className="text-sm">
                {getRoleDisplayName(role)}
              </Badge>
              {isAdmin && (
                <Badge variant="default" className="text-xs bg-green-500/20 text-green-600 dark:text-green-400">
                  {t.settings.adminAccess}
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {isAdmin 
                ? t.settings.adminAccessDesc
                : t.settings.currentAccessLevel}
            </p>
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

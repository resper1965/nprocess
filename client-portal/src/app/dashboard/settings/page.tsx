'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/page-header'
import { User, Bell, Shield, Palette } from 'lucide-react'
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
      <PageHeader title={t.settings.title} />
      <div className="p-6 lg:p-8 space-y-8">
        {/* Profile */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              {t.settings.fullName}
            </label>
            <Input className="glass" defaultValue={user?.displayName || "User Name"} />
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
          <Button>{t.settings.saveChanges}</Button>
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

      {/* Appearance */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Palette className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how ness. looks</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              Theme
            </label>
            <select
              className="w-full px-4 py-2 rounded-lg glass dark:glass-dark border border-white/20 dark:border-gray-800/50 bg-white/5 dark:bg-gray-900/30 text-gray-900 dark:text-white"
              defaultValue="dark"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>{t.settings.security}</CardTitle>
              <CardDescription>{t.settings.manageAccountSecurity}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full">
            Change Password
          </Button>
          <Button variant="outline" className="w-full">
            Enable Two-Factor Authentication
          </Button>
        </CardContent>
      </Card>
      </div>
    </>
  )
}

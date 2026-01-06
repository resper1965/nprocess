"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings, Bell, DollarSign, Shield, Users, Zap, Mail, AlertCircle } from "lucide-react"

export default function SettingsPage() {
  // Mock data - replace with actual settings data
  const settings = {
    general: {
      platformName: "Process & Compliance Engine Platform",
      adminEmail: "admin@company.com",
      supportEmail: "support@company.com",
      timezone: "America/Sao_Paulo",
      language: "en-US"
    },
    budget: {
      monthlyBudget: 3000,
      alertThreshold: 80,
      criticalThreshold: 95,
      autoScaleLimit: 5000
    },
    quotas: {
      defaultRequestsPerMinute: 100,
      defaultRequestsPerDay: 10000,
      defaultRequestsPerMonth: 100000,
      maxKeysPerConsumer: 10
    },
    alerts: {
      emailNotifications: true,
      slackNotifications: false,
      budgetAlerts: true,
      serviceDownAlerts: true,
      highLatencyAlerts: true,
      errorRateAlerts: true,
      slackWebhook: ""
    },
    security: {
      apiKeyExpiration: 365,
      forceKeyRotation: false,
      allowTestKeys: true,
      ipWhitelisting: false,
      requireMFA: false
    }
  }

  const adminUsers = [
    {
      id: "1",
      name: "Admin User",
      email: "admin@company.com",
      role: "Super Admin",
      status: "active",
      lastLogin: "2024-02-15 14:30 UTC",
      mfaEnabled: true
    },
    {
      id: "2",
      name: "John Doe",
      email: "john.doe@company.com",
      role: "Admin",
      status: "active",
      lastLogin: "2024-02-14 09:15 UTC",
      mfaEnabled: false
    },
    {
      id: "3",
      name: "Jane Smith",
      email: "jane.smith@company.com",
      role: "Viewer",
      status: "active",
      lastLogin: "2024-02-13 16:45 UTC",
      mfaEnabled: true
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage platform configuration and preferences
        </p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>General Settings</CardTitle>
          </div>
          <CardDescription>Basic platform configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Platform Name</label>
              <Input
                defaultValue={settings.general.platformName}
                placeholder="Process & Compliance Engine Platform"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Timezone</label>
              <Input
                defaultValue={settings.general.timezone}
                placeholder="America/Sao_Paulo"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Email</label>
              <Input
                type="email"
                defaultValue={settings.general.adminEmail}
                placeholder="admin@company.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Support Email</label>
              <Input
                type="email"
                defaultValue={settings.general.supportEmail}
                placeholder="support@company.com"
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* Budget & Cost Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            <CardTitle>Budget & Cost Management</CardTitle>
          </div>
          <CardDescription>Configure budget limits and cost alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Monthly Budget (USD)</label>
              <Input
                type="number"
                defaultValue={settings.budget.monthlyBudget}
                placeholder="3000"
              />
              <p className="text-xs text-muted-foreground">
                Maximum budget for all services per month
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Auto-Scale Limit (USD)</label>
              <Input
                type="number"
                defaultValue={settings.budget.autoScaleLimit}
                placeholder="5000"
              />
              <p className="text-xs text-muted-foreground">
                Maximum allowed budget when auto-scaling is enabled
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Alert Threshold (%)</label>
              <Input
                type="number"
                defaultValue={settings.budget.alertThreshold}
                placeholder="80"
              />
              <p className="text-xs text-muted-foreground">
                Send alert when budget reaches this percentage
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Critical Threshold (%)</label>
              <Input
                type="number"
                defaultValue={settings.budget.criticalThreshold}
                placeholder="95"
              />
              <p className="text-xs text-muted-foreground">
                Send critical alert and consider throttling
              </p>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* Default API Quotas */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            <CardTitle>Default API Quotas</CardTitle>
          </div>
          <CardDescription>Default rate limits for new API keys</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Requests per Minute</label>
              <Input
                type="number"
                defaultValue={settings.quotas.defaultRequestsPerMinute}
                placeholder="100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Requests per Day</label>
              <Input
                type="number"
                defaultValue={settings.quotas.defaultRequestsPerDay}
                placeholder="10000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Requests per Month</label>
              <Input
                type="number"
                defaultValue={settings.quotas.defaultRequestsPerMonth}
                placeholder="100000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Keys per Consumer</label>
              <Input
                type="number"
                defaultValue={settings.quotas.maxKeysPerConsumer}
                placeholder="10"
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* Alerts & Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Alerts & Notifications</CardTitle>
          </div>
          <CardDescription>Configure how you receive alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">Email Notifications</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Receive alerts via email
                </p>
              </div>
              <Badge variant={settings.alerts.emailNotifications ? "success" : "default"}>
                {settings.alerts.emailNotifications ? "Enabled" : "Disabled"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <p className="font-medium">Budget Alerts</p>
                <p className="text-sm text-muted-foreground">
                  Alert when budget thresholds are reached
                </p>
              </div>
              <Badge variant={settings.alerts.budgetAlerts ? "success" : "default"}>
                {settings.alerts.budgetAlerts ? "Enabled" : "Disabled"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <p className="font-medium">Service Down Alerts</p>
                <p className="text-sm text-muted-foreground">
                  Alert when services become unhealthy
                </p>
              </div>
              <Badge variant={settings.alerts.serviceDownAlerts ? "success" : "default"}>
                {settings.alerts.serviceDownAlerts ? "Enabled" : "Disabled"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <p className="font-medium">High Latency Alerts</p>
                <p className="text-sm text-muted-foreground">
                  Alert when P95 latency exceeds thresholds
                </p>
              </div>
              <Badge variant={settings.alerts.highLatencyAlerts ? "success" : "default"}>
                {settings.alerts.highLatencyAlerts ? "Enabled" : "Disabled"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <p className="font-medium">Error Rate Alerts</p>
                <p className="text-sm text-muted-foreground">
                  Alert when error rate exceeds 1%
                </p>
              </div>
              <Badge variant={settings.alerts.errorRateAlerts ? "success" : "default"}>
                {settings.alerts.errorRateAlerts ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <label className="text-sm font-medium">Slack Webhook URL (Optional)</label>
            <Input
              type="url"
              defaultValue={settings.alerts.slackWebhook}
              placeholder="https://hooks.slack.com/services/..."
            />
            <p className="text-xs text-muted-foreground">
              Receive alerts in Slack by providing a webhook URL
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Security Settings</CardTitle>
          </div>
          <CardDescription>Configure security policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <p className="font-medium">Force API Key Rotation</p>
                <p className="text-sm text-muted-foreground">
                  Require key rotation every {settings.security.apiKeyExpiration} days
                </p>
              </div>
              <Badge variant={settings.security.forceKeyRotation ? "success" : "default"}>
                {settings.security.forceKeyRotation ? "Enabled" : "Disabled"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <p className="font-medium">Allow Test Keys</p>
                <p className="text-sm text-muted-foreground">
                  Allow creation of test environment API keys
                </p>
              </div>
              <Badge variant={settings.security.allowTestKeys ? "success" : "default"}>
                {settings.security.allowTestKeys ? "Enabled" : "Disabled"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <p className="font-medium">IP Whitelisting</p>
                <p className="text-sm text-muted-foreground">
                  Restrict API access to specific IP addresses
                </p>
              </div>
              <Badge variant={settings.security.ipWhitelisting ? "success" : "default"}>
                {settings.security.ipWhitelisting ? "Enabled" : "Disabled"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <p className="font-medium">Require MFA for Admins</p>
                <p className="text-sm text-muted-foreground">
                  Enforce multi-factor authentication for admin users
                </p>
              </div>
              <Badge variant={settings.security.requireMFA ? "success" : "default"}>
                {settings.security.requireMFA ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <label className="text-sm font-medium">API Key Expiration (days)</label>
            <Input
              type="number"
              defaultValue={settings.security.apiKeyExpiration}
              placeholder="365"
            />
            <p className="text-xs text-muted-foreground">
              Default expiration period for new API keys (0 = never expire)
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* Admin Users */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle>Admin Users</CardTitle>
              </div>
              <CardDescription>Manage admin access to the platform</CardDescription>
            </div>
            <Button>
              <Users className="mr-2 h-4 w-4" />
              Add Admin
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {adminUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{user.name}</p>
                    <Badge variant="outline" className="capitalize">
                      {user.role}
                    </Badge>
                    {user.mfaEnabled && (
                      <Badge variant="success" className="text-xs">
                        <Shield className="mr-1 h-3 w-3" />
                        MFA
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Last login: {user.lastLogin}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  {user.role !== "Super Admin" && (
                    <Button variant="outline" size="sm">
                      Revoke
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-500/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-red-500">Danger Zone</CardTitle>
          </div>
          <CardDescription>Irreversible actions - use with caution</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-red-500/50 rounded-lg">
            <div className="space-y-1">
              <p className="font-medium">Revoke All API Keys</p>
              <p className="text-sm text-muted-foreground">
                Immediately revoke all active API keys across all consumers
              </p>
            </div>
            <Button variant="destructive">Revoke All</Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-red-500/50 rounded-lg">
            <div className="space-y-1">
              <p className="font-medium">Clear All Analytics Data</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete all usage and cost analytics data
              </p>
            </div>
            <Button variant="destructive">Clear Data</Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-red-500/50 rounded-lg">
            <div className="space-y-1">
              <p className="font-medium">Reset Platform</p>
              <p className="text-sm text-muted-foreground">
                Reset all settings to factory defaults
              </p>
            </div>
            <Button variant="destructive">Reset Platform</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

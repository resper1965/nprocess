'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, Key, FileText, MessageSquare, TrendingUp, AlertCircle } from 'lucide-react'

export default function DashboardPage() {
  // Mock data - will be replaced with real API calls
  const stats = [
    {
      name: 'API Calls',
      value: '847',
      limit: '1,000',
      percentage: 84.7,
      icon: Activity,
      trend: '+12% from last month',
      color: 'text-blue-500',
    },
    {
      name: 'Documents Analyzed',
      value: '23',
      limit: '50',
      percentage: 46,
      icon: FileText,
      trend: '+5 this month',
      color: 'text-green-500',
    },
    {
      name: 'Active API Keys',
      value: '1',
      limit: '1',
      percentage: 100,
      icon: Key,
      trend: 'Starter plan limit',
      color: 'text-purple-500',
    },
    {
      name: 'Chat Messages',
      value: '67',
      limit: '100',
      percentage: 67,
      icon: MessageSquare,
      trend: '+23 this week',
      color: 'text-cyan-500',
    },
  ]

  const recentActivity = [
    {
      action: 'Document analyzed',
      document: 'LGPD Compliance Policy v2.pdf',
      time: '2 hours ago',
      status: 'success',
    },
    {
      action: 'API key created',
      document: 'Production Key',
      time: '1 day ago',
      status: 'success',
    },
    {
      action: 'Chat session',
      document: 'HIPAA Requirements Discussion',
      time: '2 days ago',
      status: 'success',
    },
    {
      action: 'Integration configured',
      document: 'Google Drive',
      time: '3 days ago',
      status: 'success',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's what's happening with your compliance engine today
        </p>
      </div>

      {/* Plan Badge */}
      <Card glass>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="glass" className="text-base px-4 py-2">
                Starter Plan
              </Badge>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                3 frameworks included • $99/month
              </p>
            </div>
            <button className="text-sm text-primary hover:underline font-medium">
              Upgrade Plan
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          const isNearLimit = stat.percentage >= 80

          return (
            <Card key={stat.name} glass className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs uppercase tracking-wide font-semibold">
                    {stat.name}
                  </CardDescription>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      / {stat.limit}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isNearLimit ? 'bg-yellow-500' : 'bg-primary'
                        }`}
                        style={{ width: `${stat.percentage}%` }}
                      />
                    </div>
                    {isNearLimit && (
                      <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-500 text-xs">
                        <AlertCircle className="h-3 w-3" />
                        <span>Approaching limit</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {stat.trend}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <Card glass>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest compliance operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-white/10 dark:border-gray-800/30 last:border-0"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {activity.document}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </span>
                  <Badge variant="success" className="text-xs">
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card glass className="hover:scale-[1.02] transition-transform cursor-pointer">
          <CardHeader>
            <CardTitle className="text-lg">Analyze Document</CardTitle>
            <CardDescription>Upload a document for compliance analysis</CardDescription>
          </CardHeader>
        </Card>

        <Card glass className="hover:scale-[1.02] transition-transform cursor-pointer">
          <CardHeader>
            <CardTitle className="text-lg">Chat with AI</CardTitle>
            <CardDescription>Get instant compliance guidance</CardDescription>
          </CardHeader>
        </Card>

        <Card glass className="hover:scale-[1.02] transition-transform cursor-pointer">
          <CardHeader>
            <CardTitle className="text-lg">Generate Report</CardTitle>
            <CardDescription>Create compliance status report</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}

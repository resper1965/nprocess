'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, Key, FileText, MessageSquare, TrendingUp, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

interface Stat {
  name: string
  value: string
  limit: string
  percentage: number
  icon: any
  trend: string
  color: string
}

interface ActivityItem {
  action: string
  document: string
  time: string
  status: string
}

interface DashboardData {
  stats: Stat[]
  recentActivity: ActivityItem[]
  plan: {
    name: string
    price: number
  }
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        // TODO: Replace with actual API endpoint
        // const response = await fetch('/api/dashboard/stats')
        // const data = await response.json()

        // For now, return empty/zero data until API is connected
        setData({
          stats: [
            {
              name: 'API Calls',
              value: '0',
              limit: '1,000',
              percentage: 0,
              icon: Activity,
              trend: 'No data yet',
              color: 'text-blue-500',
            },
            {
              name: 'Documents Analyzed',
              value: '0',
              limit: '50',
              percentage: 0,
              icon: FileText,
              trend: 'No data yet',
              color: 'text-green-500',
            },
            {
              name: 'Active API Keys',
              value: '0',
              limit: '1',
              percentage: 0,
              icon: Key,
              trend: 'Create your first key',
              color: 'text-purple-500',
            },
            {
              name: 'Chat Messages',
              value: '0',
              limit: '100',
              percentage: 0,
              icon: MessageSquare,
              trend: 'Start chatting',
              color: 'text-cyan-500',
            },
          ],
          recentActivity: [],
          plan: {
            name: 'Starter',
            price: 99
          }
        })
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card glass>
          <CardContent className="p-6">
            <p className="text-red-500">{error || 'No data available'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { stats, recentActivity, plan } = data

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
                {plan.name} Plan
              </Badge>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                3 frameworks included • ${plan.price}/month
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
          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No recent activity yet. Start by analyzing a document or chatting with AI.
              </p>
            </div>
          ) : (
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
          )}
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

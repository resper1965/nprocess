'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/page-header'
import { useI18n } from '@/lib/i18n/context'
import { Activity, Key, FileText, MessageSquare, TrendingUp, AlertCircle, Loader2 } from 'lucide-react'
import { useDashboardStats } from '@/hooks/use-dashboard-stats'
import { useAuditLogs, transformAuditLogToActivity } from '@/hooks/use-audit-logs'

export default function DashboardPage() {
  const { t } = useI18n()
  const { data: statsData, isLoading } = useDashboardStats()
  const { data: auditLogs, isLoading: logsLoading } = useAuditLogs(10)
  
  // Transform API data to stats format
  const stats = statsData ? [
    {
      name: t.dashboard.stats.apiCalls,
      value: statsData.apiCallsToday.toLocaleString(),
      limit: '1,000',
      percentage: Math.min((statsData.apiCallsToday / 1000) * 100, 100),
      icon: Activity,
      trend: statsData.apiCallsChange || '+0%',
      color: 'text-blue-500',
    },
    {
      name: t.dashboard.stats.documentsAnalyzed,
      value: statsData.documentsAnalyzed.toString(),
      limit: '50',
      percentage: Math.min((statsData.documentsAnalyzed / 50) * 100, 100),
      icon: FileText,
      trend: statsData.documentsChange || '+0%',
      color: 'text-green-500',
    },
    {
      name: t.dashboard.stats.activeApiKeys,
      value: statsData.activeApiKeys.toString(),
      limit: '1',
      percentage: Math.min((statsData.activeApiKeys / 1) * 100, 100),
      icon: Key,
      trend: statsData.activeApiKeysChange || '+0%',
      color: 'text-purple-500',
    },
    {
      name: t.dashboard.stats.chatMessages,
      value: statsData.chatMessages.toString(),
      limit: '100',
      percentage: Math.min((statsData.chatMessages / 100) * 100, 100),
      icon: MessageSquare,
      trend: statsData.chatMessagesChange || '+0%',
      color: 'text-cyan-500',
    },
  ] : []

  // Transform audit logs to activity format
  const recentActivity = auditLogs && auditLogs.length > 0
    ? auditLogs.slice(0, 4).map(log => transformAuditLogToActivity(log, t))
    : [
        // Fallback mock data if no logs available
        {
          action: t.dashboard.activity.documentAnalyzed,
          document: 'LGPD Compliance Policy v2.pdf',
          time: `2 ${t.dashboard.activity.hoursAgo}`,
          status: t.dashboard.activity.success,
        },
        {
          action: t.dashboard.activity.apiKeyCreated,
          document: 'Production Key',
          time: `1 ${t.dashboard.activity.dayAgo}`,
          status: t.dashboard.activity.success,
        },
        {
          action: t.dashboard.activity.chatSession,
          document: 'HIPAA Requirements Discussion',
          time: `2 ${t.dashboard.activity.daysAgo}`,
          status: t.dashboard.activity.success,
        },
        {
          action: t.dashboard.activity.integrationConfigured,
          document: 'Google Drive',
          time: `3 ${t.dashboard.activity.daysAgo}`,
          status: t.dashboard.activity.success,
        },
      ]

  return (
    <>
      <PageHeader 
        title={t.dashboard.title} 
        description={t.dashboard.subtitle}
      />
      <div className="p-6 lg:p-8 space-y-8">

      {/* Plan Badge */}
      <Card className="glass">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-base px-4 py-2">
                {t.dashboard.plan.starter}
              </Badge>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                3 {t.dashboard.plan.frameworksIncluded} • $99/{t.dashboard.plan.perMonth}
              </p>
            </div>
            <button className="text-sm text-primary hover:underline font-medium">
              {t.dashboard.plan.upgrade}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          const isNearLimit = stat.percentage >= 80

          return (
            <Card key={stat.name} className="glass relative overflow-hidden">
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
                        <span>{t.dashboard.trends.approachingLimit}</span>
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
      )}

      {/* Recent Activity */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>{t.dashboard.recentActivity}</CardTitle>
          <CardDescription>{t.dashboard.recentActivityDescription}</CardDescription>
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
        <Card className="glass hover:scale-[1.02] transition-transform cursor-pointer">
          <CardHeader>
            <CardTitle className="text-lg">{t.dashboard.quickActions.analyzeDocument}</CardTitle>
            <CardDescription>{t.dashboard.quickActions.analyzeDocumentDesc}</CardDescription>
          </CardHeader>
        </Card>

        <Card className="glass hover:scale-[1.02] transition-transform cursor-pointer">
          <CardHeader>
            <CardTitle className="text-lg">{t.dashboard.quickActions.chatWithAI}</CardTitle>
            <CardDescription>{t.dashboard.quickActions.chatWithAIDesc}</CardDescription>
          </CardHeader>
        </Card>

        <Card className="glass hover:scale-[1.02] transition-transform cursor-pointer">
          <CardHeader>
            <CardTitle className="text-lg">{t.dashboard.quickActions.generateReport}</CardTitle>
            <CardDescription>{t.dashboard.quickActions.generateReportDesc}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
    </>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShieldCheck, AlertTriangle, CheckCircle2, TrendingUp, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

interface Framework {
  name: string
  fullName: string
  score: number
  status: 'compliant' | 'needs_attention' | 'non_compliant'
  lastCheck: string
  gaps: number
  trend: string
}

interface ComplianceGap {
  framework: string
  requirement: string
  severity: 'high' | 'medium' | 'low'
  description: string
}

interface ComplianceData {
  overallScore: number
  overallTrend: string
  frameworks: Framework[]
  recentGaps: ComplianceGap[]
}

export default function CompliancePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ComplianceData | null>(null)

  useEffect(() => {
    const loadComplianceData = async () => {
      try {
        setLoading(true)
        // TODO: Replace with actual API endpoint
        // const response = await fetch('/api/compliance')
        // const complianceData = await response.json()
        // setData(complianceData)

        setData({
          overallScore: 0,
          overallTrend: '+0%',
          frameworks: [],
          recentGaps: []
        })
      } catch (err) {
        console.error('Failed to load compliance data:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadComplianceData()
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data) {
    return null
  }

  const { overallScore, overallTrend, frameworks, recentGaps } = data

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Compliance Status
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor your compliance across all regulatory frameworks
        </p>
      </div>

      {/* Overall Status */}
      <Card glass className="border-2 border-primary/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gray-500/10 flex items-center justify-center">
                <ShieldCheck className="h-8 w-8 text-gray-500" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {overallScore}%
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Overall Compliance Score
                </p>
              </div>
            </div>
            {overallScore > 0 && (
              <div className="flex items-center gap-2 text-green-500">
                <TrendingUp className="h-5 w-5" />
                <span className="text-lg font-semibold">{overallTrend} this month</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Frameworks Grid or Empty State */}
      {frameworks.length === 0 ? (
        <Card glass>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShieldCheck className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Frameworks Configured
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center max-w-md">
              Add regulatory frameworks to your account to start monitoring compliance
            </p>
            <Button>
              Add Framework
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Framework Compliance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {frameworks.map((framework) => (
                <Card key={framework.name} glass>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{framework.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {framework.fullName}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={framework.status === 'compliant' ? 'success' : 'warning'}
                        className="text-xs"
                      >
                        {framework.status === 'compliant' ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Compliant
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Needs Attention
                          </>
                        )}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Score Circle */}
                    <div className="text-center py-4">
                      <div className="relative inline-flex items-center justify-center">
                        <svg className="w-24 h-24 transform -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-gray-200 dark:text-gray-800"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - framework.score / 100)}`}
                            className={
                              framework.score >= 80
                                ? 'text-green-500'
                                : framework.score >= 60
                                ? 'text-yellow-500'
                                : 'text-red-500'
                            }
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute text-2xl font-bold text-gray-900 dark:text-white">
                          {framework.score}%
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Gaps Found</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {framework.gaps}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Trend</span>
                        <span className={`font-medium ${framework.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                          {framework.trend}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Last Check</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {framework.lastCheck}
                        </span>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Gaps */}
          {recentGaps.length > 0 && (
            <Card glass>
              <CardHeader>
                <CardTitle>Compliance Gaps</CardTitle>
                <CardDescription>
                  Recent gaps identified across your frameworks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentGaps.map((gap, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-lg glass dark:glass-dark"
                    >
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          gap.severity === 'high'
                            ? 'bg-red-500/10'
                            : gap.severity === 'medium'
                            ? 'bg-yellow-500/10'
                            : 'bg-blue-500/10'
                        }`}
                      >
                        <AlertTriangle
                          className={`h-5 w-5 ${
                            gap.severity === 'high'
                              ? 'text-red-500'
                              : gap.severity === 'medium'
                              ? 'text-yellow-500'
                              : 'text-blue-500'
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="glass" className="text-xs">
                            {gap.framework}
                          </Badge>
                          <Badge
                            variant={
                              gap.severity === 'high'
                                ? 'destructive'
                                : gap.severity === 'medium'
                                ? 'warning'
                                : 'glass'
                            }
                            className="text-xs"
                          >
                            {gap.severity}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {gap.requirement}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {gap.description}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Resolve
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

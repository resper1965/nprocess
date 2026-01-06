'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import { useI18n } from '@/lib/i18n/context'
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

export default function CompliancePage() {
  const { t } = useI18n()

  const handleViewDetails = (framework: string) => {
    toast.info(`Viewing details for ${framework}`)
  }

  const handleResolve = (gapId: string, requirement: string) => {
    toast.info(`Resolving gap: ${requirement}`)
  }
  const frameworks = [
    {
      name: 'LGPD',
      fullName: 'Lei Geral de Proteção de Dados',
      score: 92,
      status: 'compliant',
      lastCheck: '2 hours ago',
      gaps: 3,
      trend: '+5%',
    },
    {
      name: 'ISO 27001',
      fullName: 'Information Security Management',
      score: 88,
      status: 'compliant',
      lastCheck: '1 day ago',
      gaps: 8,
      trend: '+2%',
    },
    {
      name: 'HIPAA',
      fullName: 'Health Insurance Portability Act',
      score: 76,
      status: 'needs_attention',
      lastCheck: '2 days ago',
      gaps: 12,
      trend: '-3%',
    },
  ]

  const recentGaps = [
    {
      framework: 'HIPAA',
      requirement: 'Administrative Safeguards §164.308(a)(1)(ii)(B)',
      severity: 'high',
      description: 'Missing risk management procedures documentation',
    },
    {
      framework: 'LGPD',
      requirement: 'Article 50 - Data Protection Officer',
      severity: 'medium',
      description: 'DPO contact information not publicly available',
    },
    {
      framework: 'ISO 27001',
      requirement: 'A.18.1.4 - Privacy and Protection of PII',
      severity: 'low',
      description: 'Privacy impact assessment needs update',
    },
  ]

  return (
    <>
      <PageHeader 
        title={t.compliance.title} 
        description={t.compliance.subtitle}
      />
      <div className="p-6 lg:p-8 space-y-8">

      {/* Overall Status */}
      <Card className="glass border-2 border-primary/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <ShieldCheck className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  85%
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {t.compliance.overallScore}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-500">
              <TrendingUp className="h-5 w-5" />
              <span className="text-lg font-semibold">+4% {t.compliance.thisMonth}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Frameworks Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {t.compliance.frameworkCompliance}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {frameworks.map((framework) => (
            <Card key={framework.name} className="glass">
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
                        {t.compliance.compliant}
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {t.compliance.needsAttention}
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

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleViewDetails(framework.name)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Gaps */}
      <Card className="glass">
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
                    <Badge variant="outline" className="text-xs">
                      {gap.framework}
                    </Badge>
                    <Badge
                      variant={
                        gap.severity === 'high'
                          ? 'destructive'
                          : gap.severity === 'medium'
                          ? 'warning'
                          : 'outline'
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
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleResolve(`gap-${index}`, gap.requirement)}
                >
                  Resolve
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  )
}

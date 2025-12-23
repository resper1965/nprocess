'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from './stats-card';
import { Activity, Shield, Zap, TrendingUp, LucideIcon } from 'lucide-react';

interface OverviewProps {
  stats: {
    processes: number;
    analyses: number;
    complianceScore: number;
    recentActivity: number;
  };
}

export function Overview({ stats }: OverviewProps) {
  const statCards = [
    {
      title: 'Total Processes',
      value: stats.processes,
      description: 'Processes mapped',
      icon: Activity as LucideIcon,
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Compliance Score',
      value: `${stats.complianceScore}%`,
      description: 'Average compliance',
      icon: Shield as LucideIcon,
      trend: stats.complianceScore > 0 ? '+5%' : undefined,
      trendUp: stats.complianceScore > 0,
    },
    {
      title: 'Analyses',
      value: stats.analyses,
      description: 'Completed analyses',
      icon: Zap as LucideIcon,
      trend: '+8%',
      trendUp: true,
    },
    {
      title: 'Recent Activity',
      value: stats.recentActivity,
      description: 'Last 7 days',
      icon: TrendingUp as LucideIcon,
      trend: '+15%',
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>
    </div>
  );
}


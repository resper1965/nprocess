'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import AppLayout from '@/components/layout/app-layout';
import { Overview } from '@/components/dashboard/overview';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { RecentActivity } from '@/components/dashboard/recent-activity';

export default function DashboardPage() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    processes: 0,
    analyses: 0,
    complianceScore: 0,
    recentActivity: 0,
  });

  useEffect(() => {
    // Health check
    apiClient
      .healthCheck()
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error checking API health:', err);
        setLoading(false);
      });

    // Load stats
    apiClient
      .listProcesses(100)
      .then((processes) => {
        setStats({
          processes: processes.length,
          analyses: 0, // TODO: implement analytics endpoint
          complianceScore: 0, // TODO: calculate from processes
          recentActivity: processes.filter((p: any) => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return p.created_at && new Date(p.created_at) > weekAgo;
          }).length,
        });
      })
      .catch((err) => {
        console.error('Error loading stats:', err);
      });
  }, []);

  return (
    <AppLayout health={health} loading={loading}>
      {/* Page Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-3xl lg:text-4xl font-display font-bold text-slate-100 mb-2 tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm lg:text-base text-slate-500 font-normal">
          Overview of your process mapping and compliance analysis
        </p>
      </div>

      {/* Overview Stats */}
      <div className="mb-6 lg:mb-8">
        <Overview stats={stats} />
      </div>

      {/* Quick Actions */}
      <div className="mb-6 lg:mb-8">
        <QuickActions />
      </div>

      {/* Recent Activity */}
      <div>
        <RecentActivity />
      </div>
    </AppLayout>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import AppSidebar from '@/components/layout/app-sidebar';
import AppHeader from '@/components/layout/app-header';
import { useSidebar } from '@/components/ui/sidebar';
import { Overview } from '@/components/dashboard/overview';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { RecentActivity } from '@/components/dashboard/recent-activity';

export default function DashboardPage() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { state } = useSidebar();
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

  // Adjust padding based on sidebar state
  const contentPadding = state === 'expanded' ? 'lg:pl-64' : 'lg:pl-16';

  return (
    <div className="min-h-screen bg-slate-950">
      <AppSidebar />

      {/* Main content area - adapts to sidebar state */}
      <div
        className={`${contentPadding} min-h-screen flex flex-col relative z-10 transition-all duration-300`}
      >
        <AppHeader health={health} loading={loading} />

        <main className="flex-1 p-4 lg:p-6 xl:p-8 relative z-10">
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
        </main>
      </div>
    </div>
  );
}

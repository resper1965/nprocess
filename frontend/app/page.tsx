'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import AppSidebar from '@/components/layout/app-sidebar';
import AppHeader from '@/components/layout/app-header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { 
  Sparkles, 
  Folder, 
  BarChart3,
  ArrowRight,
  Activity,
  Shield,
  Zap,
  TrendingUp,
  FileText
} from 'lucide-react';

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
    apiClient.healthCheck()
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error checking API health:', err);
        setLoading(false);
      });

    // Load stats
    apiClient.listProcesses(100)
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

  const statCards = [
    {
      title: 'Total Processes',
      value: stats.processes,
      icon: Activity,
      description: 'Processes mapped',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Compliance Score',
      value: `${stats.complianceScore}%`,
      icon: Shield,
      description: 'Average compliance',
      trend: stats.complianceScore > 0 ? '+5%' : 'N/A',
      trendUp: stats.complianceScore > 0,
    },
    {
      title: 'Analyses',
      value: stats.analyses,
      icon: Zap,
      description: 'Completed analyses',
      trend: '+8%',
      trendUp: true,
    },
    {
      title: 'Recent Activity',
      value: stats.recentActivity,
      icon: TrendingUp,
      description: 'Last 7 days',
      trend: '+15%',
      trendUp: true,
    },
  ];

  const quickActions = [
    {
      name: 'Generate Diagram',
      description: 'Create a new process diagram using AI',
      href: '/generate',
      icon: Sparkles,
      color: 'text-[#00ade8]',
      bgColor: 'bg-[#00ade8]/10',
    },
    {
      name: 'View Processes',
      description: 'Browse and manage your processes',
      href: '/processes',
      icon: Folder,
      color: 'text-slate-400',
      bgColor: 'bg-slate-900/50',
    },
    {
      name: 'Run Analysis',
      description: 'Analyze compliance with regulatory frameworks',
      href: '/analyze',
      icon: BarChart3,
      color: 'text-slate-400',
      bgColor: 'bg-slate-900/50',
    },
    {
      name: 'Documentation',
      description: 'Access API documentation and guides',
      href: '/docs',
      icon: FileText,
      color: 'text-slate-400',
      bgColor: 'bg-slate-900/50',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <AppSidebar />
      
      {/* Main content area - starts after sidebar */}
      <div className="lg:pl-64 min-h-screen flex flex-col">
        <AppHeader health={health} loading={loading} />

        <main className="flex-1 p-4 lg:p-6 xl:p-8">
          {/* Page Header */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-3xl lg:text-4xl font-display font-bold text-slate-100 mb-2 tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm lg:text-base text-slate-500 font-normal">
              Overview of your process mapping and compliance analysis
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6 lg:mb-8">
            {statCards.map((stat) => (
              <Card key={stat.title} className="p-5 lg:p-6 hover:border-slate-700/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 font-normal mb-1.5">{stat.title}</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl lg:text-3xl font-display font-bold text-slate-100 tracking-tight">
                        {stat.value}
                      </p>
                      {stat.trend && stat.trend !== 'N/A' && (
                        <span className={`text-xs font-medium ${stat.trendUp ? 'text-emerald-500' : 'text-red-500'}`}>
                          {stat.trend}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`p-2.5 rounded-lg ${stat.icon === Activity ? 'bg-[#00ade8]/10' : 'bg-slate-900/50'}`}>
                    <stat.icon className={`w-5 h-5 ${stat.icon === Activity ? 'text-[#00ade8]' : 'text-slate-400'}`} strokeWidth={1.5} />
                  </div>
                </div>
                <p className="text-xs text-slate-600 font-normal">{stat.description}</p>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-6 lg:mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg lg:text-xl font-display font-semibold text-slate-100 tracking-tight">
                Quick Actions
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action) => (
                <Link key={action.name} href={action.href}>
                  <Card hover className="p-5 lg:p-6 h-full group cursor-pointer">
                    <div className={`w-10 h-10 rounded-lg ${action.bgColor} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                      <action.icon className={`w-5 h-5 ${action.color}`} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-base font-display font-semibold text-slate-100 mb-1.5 tracking-tight group-hover:text-[#00ade8] transition-colors">
                      {action.name}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-normal">
                      {action.description}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg lg:text-xl font-display font-semibold text-slate-100 tracking-tight">
                Getting Started
              </h2>
            </div>
            <Card className="p-5 lg:p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#00ade8]/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-[#00ade8]" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-display font-semibold text-slate-100 mb-1">
                      Generate your first process diagram
                    </h3>
                    <p className="text-sm text-slate-500 font-normal mb-3">
                      Use AI to convert your process description into a structured BPMN diagram
                    </p>
                    <Link href="/generate">
                      <Button size="sm">
                        Get Started
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" strokeWidth={2} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

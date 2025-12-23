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
  Zap
} from 'lucide-react';

export default function DashboardPage() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    processes: 0,
    analyses: 0,
    complianceScore: 0,
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
        });
      })
      .catch((err) => {
        console.error('Error loading stats:', err);
      });
  }, []);

  const features = [
    {
      name: 'Generate Diagrams',
      description: 'Convert textual descriptions into BPMN diagrams using AI',
      href: '/generate',
      icon: Sparkles,
      color: 'text-[#00ade8]',
    },
    {
      name: 'Manage Processes',
      description: 'Store and manage validated processes in Firestore',
      href: '/processes',
      icon: Folder,
      color: 'text-slate-400',
    },
    {
      name: 'Compliance Analysis',
      description: 'Identify compliance gaps (LGPD, SOX, GDPR)',
      href: '/analyze',
      icon: BarChart3,
      color: 'text-slate-400',
    },
  ];

  const statCards = [
    {
      title: 'Total Processes',
      value: stats.processes,
      icon: Activity,
      description: 'Processes mapped',
    },
    {
      title: 'Compliance Score',
      value: `${stats.complianceScore}%`,
      icon: Shield,
      description: 'Average compliance',
    },
    {
      title: 'Analyses',
      value: stats.analyses,
      icon: Zap,
      description: 'Completed analyses',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <AppSidebar />
      
      <div className="lg:pl-64">
        <AppHeader health={health} loading={loading} />

        <main className="p-4 lg:p-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold text-slate-100 mb-2 tracking-tight">
              Dashboard
            </h1>
            <p className="text-base text-slate-500 font-normal">
              Overview of your process mapping and compliance analysis
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            {statCards.map((stat) => (
              <Card key={stat.title} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-slate-500 font-normal mb-1">{stat.title}</p>
                    <p className="text-3xl font-display font-bold text-slate-100 tracking-tight">
                      {stat.value}
                    </p>
                  </div>
                  <stat.icon className="w-8 h-8 text-[#00ade8]" strokeWidth={1.5} />
                </div>
                <p className="text-xs text-slate-600 font-normal">{stat.description}</p>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-display font-semibold text-slate-100 mb-4 tracking-tight">
              Quick Actions
            </h2>
            <div className="flex items-center gap-3">
              <Link href="/generate">
                <Button size="lg">
                  Generate Diagram
                  <ArrowRight className="w-4 h-4 ml-2" strokeWidth={2} />
                </Button>
              </Link>
              <Link href="/processes">
                <Button variant="secondary" size="lg">
                  View Processes
                </Button>
              </Link>
              <Link href="/analyze">
                <Button variant="secondary" size="lg">
                  Run Analysis
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div>
            <h2 className="text-xl font-display font-semibold text-slate-100 mb-4 tracking-tight">
              Features
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature) => (
                <Link key={feature.name} href={feature.href}>
                  <Card hover className="p-6 h-full">
                    <div className="mb-4">
                      <feature.icon className={`w-6 h-6 ${feature.color}`} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-base font-display font-semibold text-slate-100 mb-2 tracking-tight">
                      {feature.name}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-normal">
                      {feature.description}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

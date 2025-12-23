'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { 
  SparklesIcon, 
  FolderIcon, 
  ChartBarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.healthCheck()
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error checking API health:', err);
        setLoading(false);
      });
  }, []);

  const features = [
    {
      name: 'Generate Diagrams',
      description: 'Convert textual descriptions into BPMN diagrams using AI',
      href: '/generate',
      icon: SparklesIcon,
      color: 'text-[#00ade8]',
    },
    {
      name: 'Manage Processes',
      description: 'Store and manage validated processes in Firestore',
      href: '/processes',
      icon: FolderIcon,
      color: 'text-slate-400',
    },
    {
      name: 'Compliance Analysis',
      description: 'Identify compliance gaps (LGPD, SOX, GDPR)',
      href: '/analyze',
      icon: ChartBarIcon,
      color: 'text-slate-400',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <Sidebar />
      
      <div className="lg:pl-64">
        <Header health={health} loading={loading} />

        <main className="px-6 py-12 max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="mb-16">
            <h1 className="text-5xl font-display font-bold text-slate-100 mb-4 leading-tight">
              Process Mapping &<br />
              <span className="text-[#00ade8]">Compliance Analysis</span>
            </h1>
            <p className="text-xl text-slate-400 mb-8 max-w-2xl leading-relaxed">
              Transform business process descriptions into structured BPMN diagrams and analyze compliance with regulatory frameworks using AI.
            </p>
            
            <div className="flex items-center gap-4">
              <Link href="/generate">
                <Button size="lg">
                  Get Started
                  <ArrowRightIcon className="w-5 h-5 ml-2 inline" />
                </Button>
              </Link>
              <Link href="/docs">
                <Button variant="secondary" size="lg">
                  Documentation
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {features.map((feature) => (
              <Link key={feature.name} href={feature.href}>
                <Card hover className="p-6 h-full">
                  <div className="mb-4">
                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-slate-100 mb-2">
                    {feature.name}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </Link>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Card className="p-6">
              <div className="text-3xl font-display font-bold text-slate-100 mb-1">
                AI-Powered
              </div>
              <p className="text-sm text-slate-400">
                Generative AI for process mapping
              </p>
            </Card>
            <Card className="p-6">
              <div className="text-3xl font-display font-bold text-slate-100 mb-1">
                Multi-Domain
              </div>
              <p className="text-sm text-slate-400">
                LGPD, SOX, GDPR compliance
              </p>
            </Card>
            <Card className="p-6">
              <div className="text-3xl font-display font-bold text-slate-100 mb-1">
                Real-Time
              </div>
              <p className="text-sm text-slate-400">
                Continuous compliance monitoring
              </p>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

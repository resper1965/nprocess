'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { 
  Sparkles, 
  Folder, 
  BarChart3,
  ArrowRight
} from 'lucide-react';

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
      icon: Sparkles,
    },
    {
      name: 'Manage Processes',
      description: 'Store and manage validated processes in Firestore',
      href: '/processes',
      icon: Folder,
    },
    {
      name: 'Compliance Analysis',
      description: 'Identify compliance gaps (LGPD, SOX, GDPR)',
      href: '/analyze',
      icon: BarChart3,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <Sidebar />
      
      <div className="lg:pl-64">
        <Header health={health} loading={loading} />

        <main className="px-6 py-16 max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="mb-20">
            <h1 className="text-5xl font-display font-bold text-slate-100 mb-4 leading-tight tracking-tight">
              Process Mapping &<br />
              <span className="text-[#00ade8]">Compliance Analysis</span>
            </h1>
            <p className="text-lg text-slate-500 mb-10 max-w-2xl leading-relaxed font-normal">
              Transform business process descriptions into structured BPMN diagrams and analyze compliance with regulatory frameworks using AI.
            </p>
            
            <div className="flex items-center gap-3">
              <Link href="/generate">
                <Button size="lg">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" strokeWidth={2} />
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
                    <feature.icon className="w-6 h-6 text-[#00ade8]" strokeWidth={1.5} />
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

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="text-2xl font-display font-bold text-slate-100 mb-1 tracking-tight">
                AI-Powered
              </div>
              <p className="text-sm text-slate-500 font-normal">
                Generative AI for process mapping
              </p>
            </Card>
            <Card className="p-6">
              <div className="text-2xl font-display font-bold text-slate-100 mb-1 tracking-tight">
                Multi-Domain
              </div>
              <p className="text-sm text-slate-500 font-normal">
                LGPD, SOX, GDPR compliance
              </p>
            </Card>
            <Card className="p-6">
              <div className="text-2xl font-display font-bold text-slate-100 mb-1 tracking-tight">
                Real-Time
              </div>
              <p className="text-sm text-slate-500 font-normal">
                Continuous compliance monitoring
              </p>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

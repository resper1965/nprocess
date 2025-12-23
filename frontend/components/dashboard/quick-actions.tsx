'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Folder, BarChart3, FileText, LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface QuickAction {
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

const quickActions: QuickAction[] = [
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

export function QuickActions() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg lg:text-xl font-display font-semibold text-slate-100 tracking-tight mb-4">
          Quick Actions
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.name} href={action.href}>
            <Card className="h-full group cursor-pointer hover:border-slate-700/50 transition-all">
              <CardContent className="p-5 lg:p-6">
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform',
                    action.bgColor
                  )}
                >
                  <action.icon
                    className={cn('w-5 h-5', action.color)}
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="text-base font-display font-semibold text-slate-100 mb-1.5 tracking-tight group-hover:text-[#00ade8] transition-colors">
                  {action.name}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed font-normal">
                  {action.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}


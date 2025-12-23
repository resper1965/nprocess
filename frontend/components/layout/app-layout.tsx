'use client';

import { ReactNode } from 'react';
import AppSidebar from './app-sidebar';
import AppHeader from './app-header';
import { useSidebar } from '@/components/ui/sidebar';

interface AppLayoutProps {
  children: ReactNode;
  health?: {
    status: string;
    version?: string;
  } | null;
  loading?: boolean;
}

export default function AppLayout({ children, health, loading }: AppLayoutProps) {
  const { state } = useSidebar();

  // Adjust padding based on sidebar state
  const contentPadding = state === 'expanded' ? 'lg:pl-64' : 'lg:pl-16';

  return (
    <div className="min-h-screen bg-slate-950">
      <AppSidebar />

      {/* Main content area - adapts to sidebar state */}
      <div
        className={`${contentPadding} min-h-screen flex flex-col transition-all duration-300`}
      >
        <AppHeader health={health} loading={loading} />

        <main className="flex-1 p-4 lg:p-6 xl:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

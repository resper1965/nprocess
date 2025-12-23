'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Sparkles, 
  Folder, 
  BarChart3,
  FileText,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import Logo from './logo';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Generate', href: '/generate', icon: Sparkles },
  { name: 'Processes', href: '/processes', icon: Folder },
  { name: 'Analysis', href: '/analyze', icon: BarChart3 },
  { name: 'Documentation', href: '/docs', icon: FileText },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div 
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm" 
          onClick={() => setSidebarOpen(false)} 
        />
        <div className="fixed inset-y-0 left-0 w-64 bg-slate-950/95 backdrop-blur-sm border-r border-slate-800/50">
          <div className="flex items-center justify-between p-4 border-b border-slate-800/50 h-[60px]">
            <Logo />
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-900/50 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
          <nav className="p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-normal transition-all
                    ${
                      isActive
                        ? 'bg-slate-900/50 text-slate-100'
                        : 'text-slate-500 hover:text-slate-200 hover:bg-slate-900/30'
                    }
                  `}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-slate-800/50">
            <p className="text-xs text-slate-600 font-normal tracking-wide">
              Process Mapping & Compliance
            </p>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 border-r border-slate-800/50 bg-slate-950/95 backdrop-blur-sm">
          <div className="flex items-center gap-2 p-6 border-b border-slate-800/50 h-[60px]">
            <Logo />
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-normal transition-all
                    ${
                      isActive
                        ? 'bg-slate-900/50 text-slate-100'
                        : 'text-slate-500 hover:text-slate-200 hover:bg-slate-900/30'
                    }
                  `}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-6 border-t border-slate-800/50">
            <p className="text-xs text-slate-600 font-normal tracking-wide">
              Process Mapping & Compliance
            </p>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-800/50 text-slate-400 hover:text-slate-200 hover:border-slate-700/50 transition-all"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>
    </>
  );
}


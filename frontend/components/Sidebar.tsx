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

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Generate', href: '/generate', icon: Sparkles },
  { name: 'Processes', href: '/processes', icon: Folder },
  { name: 'Analysis', href: '/analyze', icon: BarChart3 },
  { name: 'Documentation', href: '/docs', icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-800/50 text-slate-400 hover:text-slate-200 hover:border-slate-700/50 transition-all"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X className="w-5 h-5" strokeWidth={1.5} />
          ) : (
            <Menu className="w-5 h-5" strokeWidth={1.5} />
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-slate-950/95 backdrop-blur-sm border-r border-slate-800/50 z-40
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-8 border-b border-slate-800/50">
            <Link href="/" className="flex items-center gap-2.5" onClick={() => setIsOpen(false)}>
              <span className="text-2xl font-display font-medium text-slate-100 tracking-tight">
                ness<span className="text-[#00ade8]">.</span>
              </span>
              <span className="text-xs text-slate-500 font-normal tracking-wide">ComplianceEngine</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-0.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-normal transition-all
                    ${
                      isActive
                        ? 'bg-slate-900/50 text-slate-100'
                        : 'text-slate-500 hover:text-slate-200 hover:bg-slate-900/30'
                    }
                  `}
                >
                  <item.icon className="w-4 h-4" strokeWidth={1.5} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-6 py-5 border-t border-slate-800/50">
            <p className="text-xs text-slate-600 font-normal tracking-wide">
              Process Mapping & Compliance
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

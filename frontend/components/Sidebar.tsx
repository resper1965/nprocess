'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  SparklesIcon, 
  FolderIcon, 
  ChartBarIcon,
  DocumentTextIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Generate', href: '/generate', icon: SparklesIcon },
  { name: 'Processes', href: '/processes', icon: FolderIcon },
  { name: 'Analysis', href: '/analyze', icon: ChartBarIcon },
  { name: 'Documentation', href: '/docs', icon: DocumentTextIcon },
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
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 hover:border-slate-700 transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-slate-950 border-r border-slate-800 z-40
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-8 border-b border-slate-800">
            <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
              <span className="text-2xl font-display font-medium text-slate-100">
                ness<span className="text-[#00ade8]">.</span>
              </span>
              <span className="text-xs text-slate-500 font-medium">ComplianceEngine</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                    ${
                      isActive
                        ? 'bg-slate-900 text-slate-100 border border-slate-800'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-800">
            <p className="text-xs text-slate-500">
              Process Mapping & Compliance
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}


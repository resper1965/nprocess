'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { 
  LayoutDashboard, 
  Brain, 
  Terminal, 
  Network, 
  ShieldAlert, 
  LogOut, 
  Menu,
  Wand2
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Define Navigation Items
  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, requiredRole: 'member' },
    { name: 'Process Engine', href: '/admin/process', icon: Wand2, requiredRole: 'member' },
    { name: 'Knowledge Ops', href: '/admin/knowledge', icon: Brain, requiredRole: 'member' },
    { name: 'Developer Hub', href: '/admin/developer', icon: Terminal, requiredRole: 'member' },
    { name: 'Network & Access', href: '/admin/network', icon: Network, requiredRole: 'super_admin' },
    { name: 'System Admin', href: '/admin/system', icon: ShieldAlert, requiredRole: 'super_admin' },
  ];

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Mobile Menu Button */}
      <button 
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-neutral-800 rounded-full text-white"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-neutral-900 border-r border-neutral-800 transform transition-transform duration-200 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:relative lg:translate-x-0
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center font-bold text-white text-xl">n</div>
            <span className="text-xl font-bold text-white tracking-tight">process</span>
          </div>
        </div>

        <nav className="px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            // Check Role
            if (item.requiredRole === 'super_admin' && user?.claims?.role !== 'super_admin') return null;

            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-cyan-950/30 text-cyan-400 border border-cyan-900/50' 
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}
                `}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-neutral-800">
             <div className="flex items-center mb-4 px-2">
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 font-bold mr-3">
                    {user?.displayName?.[0] || 'U'}
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-white truncate">{user?.displayName}</p>
                    <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
                </div>
             </div>
             <button 
                onClick={handleSignOut}
                className="w-full flex items-center justify-center space-x-2 p-2 bg-neutral-800 hover:bg-red-900/20 hover:text-red-400 rounded-lg transition-colors text-neutral-400 text-sm"
             >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
             </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

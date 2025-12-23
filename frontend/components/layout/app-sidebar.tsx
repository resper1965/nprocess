'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Sparkles, 
  Folder, 
  BarChart3,
  FileText,
  Key,
  X,
} from 'lucide-react';
import Logo from './logo';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Generate', href: '/generate', icon: Sparkles },
  { name: 'Processes', href: '/processes', icon: Folder },
  { name: 'Analysis', href: '/analyze', icon: BarChart3 },
  { name: 'API Keys', href: '/api-keys', icon: Key },
  { name: 'Documentation', href: '/docs', icon: FileText },
];

function AppSidebarContent() {
  const pathname = usePathname();
  const { state, setOpen } = useSidebar();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center justify-between w-full">
          <Logo />
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-900/50 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                  >
                    <Link href={item.href} onClick={() => setOpen(false)}>
                      <item.icon className="w-4 h-4" strokeWidth={1.5} />
                      <span className={state === 'collapsed' ? 'lg:hidden' : ''}>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <p className={`text-xs text-slate-600 font-normal tracking-wide px-2 ${state === 'collapsed' ? 'lg:hidden' : ''}`}>
          Process Mapping & Compliance
        </p>
      </SidebarFooter>
    </>
  );
}

export default function AppSidebar() {
  const { open, setOpen } = useSidebar();

  return (
    <>
      {/* Mobile sidebar */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-30">
          <div
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-64 bg-slate-950/95 backdrop-blur-sm border-r border-slate-800/50 flex flex-col z-40">
            <AppSidebarContent />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <Sidebar>
        <AppSidebarContent />
      </Sidebar>
    </>
  );
}

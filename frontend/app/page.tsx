'use client';

/**
 * Console Home Page (Dashboard)
 * 
 * Main dashboard showing the status of the 4 engines.
 * Protected route - requires authenticated user with org_id.
 */

import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, Bot, ShieldCheck, FileText, BrainCircuit } from 'lucide-react';

export default function ConsolePage() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // The 4 Engines
  const engines = [
    {
      name: 'Process Engine',
      description: 'Generate BPMN 2.0 diagrams from text/audio instantly.',
      status: 'online',
      href: '/admin/process',
      icon: <Bot className="w-8 h-8 text-primary" />,
      color: "border-primary/20 hover:border-primary/50"
    },
    {
      name: 'Compliance Guard',
      description: 'Audit processes against regulations using RAG.',
      status: 'online',
      href: '#', 
      icon: <ShieldCheck className="w-8 h-8 text-emerald-500" />,
      color: "border-emerald-500/20 hover:border-emerald-500/50"
    },
    {
      name: 'Document Factory',
      description: 'Generate official PDF manuals and documentation.',
      status: 'idle',
      href: '#',
      icon: <FileText className="w-8 h-8 text-amber-500" />,
      color: "border-amber-500/20 hover:border-amber-500/50"
    },
    {
      name: 'Knowledge Store',
      description: 'The RAG + MCP brain shared across the platform.',
      status: 'online',
      href: '/admin/knowledge',
      icon: <BrainCircuit className="w-8 h-8 text-violet-500" />,
      color: "border-violet-500/20 hover:border-violet-500/50"
    },
  ];

  return (
    <div className="h-screen flex flex-col relative overflow-hidden bg-black selection:bg-primary/20">
      
      {/* Background Gradient/Mesh */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-montserrat font-medium text-xl tracking-tight">
              n<span className="text-primary">.</span>process
            </h1>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
              v2.0
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground hidden sm:inline">
                  {user.email}
                </span>
                <Badge variant="outline" className="font-mono text-[9px] border-white/10 bg-white/5">
                  {user.claims.role}
                </Badge>
              </div>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={signOut}
              className="text-muted-foreground hover:text-white h-8"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              <span className="text-xs">Exit</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Compact Grid */}
      <main className="relative z-10 flex-1 flex flex-col max-w-7xl w-full mx-auto px-6 py-6 overflow-hidden">
        
        {/* Hero Section - Compact */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-white tracking-tight mb-1">
            Intelligence Engines
          </h2>
          <p className="text-sm text-muted-foreground">
            Orchestrate your AI workforce from a unified console.
          </p>
        </div>

        {/* Engines Grid - Compact 2x2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {engines.map((engine) => (
            <Link 
              key={engine.name} 
              href={engine.href}
              className={engine.href === '#' ? 'cursor-not-allowed opacity-60' : ''}
              onClick={(e) => engine.href === '#' && e.preventDefault()}
            >
              <Card className={`h-full bg-black/40 backdrop-blur-md border transition-all duration-300 group ${engine.color}`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 py-3 px-4">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:scale-110 transition-transform duration-300">
                    {engine.icon}
                  </div>
                  <Badge 
                    variant={engine.status === 'online' ? 'default' : 'secondary'}
                    className={engine.status === 'online' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20 text-[9px]' : 'text-[9px]'}
                  >
                    {engine.status.toUpperCase()}
                  </Badge>
                </CardHeader>
                <CardContent className="pt-2 pb-4 px-4">
                  <CardTitle className="text-base font-medium text-white mb-1 group-hover:text-primary transition-colors">
                    {engine.name}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {engine.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Actions - Compact */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-0.5">Quick Start</h3>
            <p className="text-xs text-muted-foreground">Common actions to jumpstart your workflow.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/process">
              <Button size="sm" className="font-medium shadow-lg shadow-primary/20 text-xs h-8">
                <Bot className="w-3.5 h-3.5 mr-1.5" />
                New Process
              </Button>
            </Link>
            <Link href="/admin/knowledge">
               <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5 text-xs h-8">
                <BrainCircuit className="w-3.5 h-3.5 mr-1.5" />
                Knowledge
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer - Compact */}
      <footer className="relative z-10 py-2 text-center text-muted-foreground text-[10px] border-t border-white/5 bg-black/80 backdrop-blur-md">
        <p>powered by <span className="font-montserrat font-medium text-white">ness<span className="text-[#00ade8]">.</span></span> © 2026</p>
      </footer>
    </div>
  );
}

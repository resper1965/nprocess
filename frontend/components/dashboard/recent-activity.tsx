'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Getting Started</CardTitle>
        <CardDescription>
          Start by generating your first process diagram
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-[#00ade8]/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-[#00ade8]" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-display font-semibold text-slate-100 mb-1">
              Generate your first process diagram
            </h3>
            <p className="text-sm text-slate-500 font-normal mb-3">
              Use AI to convert your process description into a structured BPMN diagram
            </p>
            <Link href="/generate">
              <Button size="sm">
                Get Started
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" strokeWidth={2} />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

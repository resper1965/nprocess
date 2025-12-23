import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendUp,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn('hover:border-slate-700/50 transition-colors', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">
          {title}
        </CardTitle>
        <div className="p-2 rounded-lg bg-slate-900/50">
          <Icon className="h-4 w-4 text-slate-400" strokeWidth={1.5} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-display font-bold text-slate-100 tracking-tight">
          {value}
        </div>
        {description && (
          <p className="text-xs text-slate-600 font-normal mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <span
              className={cn(
                'text-xs font-medium',
                trendUp ? 'text-emerald-500' : 'text-red-500'
              )}
            >
              {trend}
            </span>
            <span className="text-xs text-slate-500 ml-1">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


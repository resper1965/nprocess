import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          'flex h-10 w-full rounded-lg border border-slate-800/50 bg-slate-900/30 px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-[#00ade8]/50 focus:ring-1 focus:ring-[#00ade8]/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all font-normal',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';

export { Select };


import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-slate-800/50 bg-slate-900/30 px-3 py-2 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-[#00ade8]/50 focus:ring-1 focus:ring-[#00ade8]/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all font-normal',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };


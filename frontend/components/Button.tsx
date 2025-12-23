import { ReactNode } from 'react';
import Link from 'next/link';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  href?: string;
  as?: typeof Link;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  href,
  as,
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 inline-flex items-center justify-center';
  
  const variants = {
    primary: 'bg-[#00ade8] text-white hover:bg-[#0088b8] focus:ring-[#00ade8] disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:bg-slate-800 focus:ring-slate-700 disabled:opacity-50 disabled:cursor-not-allowed',
    ghost: 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 focus:ring-slate-700 disabled:opacity-50 disabled:cursor-not-allowed',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href && as === Link) {
    return (
      <Link href={href} className={classes}>
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading...
          </span>
        ) : (
          children
        )}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}


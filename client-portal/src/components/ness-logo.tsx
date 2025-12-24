import React from 'react'
import { cn } from '@/lib/utils'

interface NessLogoProps {
  /**
   * Size of the logo
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'

  /**
   * Color scheme - auto adapts to light/dark mode
   * @default 'auto'
   */
  variant?: 'auto' | 'light' | 'dark'

  /**
   * Additional CSS classes
   */
  className?: string
}

const sizeClasses = {
  xs: 'text-base',
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
  xl: 'text-6xl',
}

export function NessLogo({ size = 'md', variant = 'auto', className }: NessLogoProps) {
  const textColor = variant === 'auto'
    ? 'text-foreground dark:text-white'
    : variant === 'light'
    ? 'text-white'
    : 'text-black'

  return (
    <div className={cn('font-montserrat font-medium select-none', sizeClasses[size], className)}>
      <span className={textColor}>ness</span>
      <span className="text-[#00ade8]">.</span>
    </div>
  )
}

interface NessLogomarkProps {
  /**
   * Size of the logomark (just the dot)
   */
  size?: number

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * Just the ness. dot - useful for favicons, etc.
 */
export function NessLogomark({ size = 24, className }: NessLogomarkProps) {
  return (
    <div
      className={cn('rounded-full bg-[#00ade8]', className)}
      style={{ width: size, height: size }}
    />
  )
}

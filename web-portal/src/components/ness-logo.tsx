import React from 'react'
import { cn } from '@/lib/utils'

interface NProcessLogoProps {
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

/**
 * n.process Logo Component
 * 
 * Renders the n.process brand name with:
 * - Font: Montserrat Medium
 * - Text: black or white (auto-adapts to theme)
 * - Dot: #00ade8 (ness blue)
 */
export function NProcessLogo({ size = 'md', variant = 'auto', className }: NProcessLogoProps) {
  const textColor = variant === 'auto'
    ? 'text-foreground dark:text-white'
    : variant === 'light'
    ? 'text-white'
    : 'text-black'

  return (
    <div className={cn('font-montserrat font-medium select-none', sizeClasses[size], className)}>
      <span className={textColor}>n</span>
      <span className="text-[#00ade8]">.</span>
      <span className={textColor}>process</span>
    </div>
  )
}

interface NProcessLogomarkProps {
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
 * Just the n.process dot - useful for favicons, etc.
 */
export function NProcessLogomark({ size = 24, className }: NProcessLogomarkProps) {
  return (
    <div
      className={cn('rounded-full bg-[#00ade8]', className)}
      style={{ width: size, height: size }}
    />
  )
}

// Legacy export for backwards compatibility
export { NProcessLogo as NessLogo }

'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  children?: ReactNode
  className?: string
}

export function PageHeader({ title, description, children, className = '' }: PageHeaderProps) {
  return (
    <div className={cn("sticky top-0 z-10 bg-zinc-950 border-b border-zinc-800", className)}>
      <div className="flex items-center justify-between h-14 px-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-medium text-zinc-300 truncate">
            {title}
          </h1>
          {description && (
            <p className="text-xs text-zinc-500 truncate mt-0.5">
              {description}
            </p>
          )}
        </div>
        {children && (
          <div className="flex items-center gap-3 ml-4">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}

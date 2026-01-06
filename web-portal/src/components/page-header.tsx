'use client'

import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  children?: ReactNode
  className?: string
}

export function PageHeader({ title, description, children, className = '' }: PageHeaderProps) {
  return (
    <div className={`sticky top-0 z-10 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 border-b border-white/20 dark:border-gray-800/50 backdrop-blur-sm ${className}`}>
      <div className="flex items-center justify-between h-16 px-6 lg:px-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-0.5">
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

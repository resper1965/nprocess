'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'

export default function PrivacyPolicyPage() {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/legal/privacy-policy.md')
      .then(res => res.text())
      .then(text => {
        // Simple markdown to HTML conversion
        let html = text
          // Headers
          .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">$1</h1>')
          .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-semibold mt-6 mb-3 text-gray-900 dark:text-white">$1</h2>')
          .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold mt-4 mb-2 text-gray-900 dark:text-white">$1</h3>')
          .replace(/^#### (.+)$/gm, '<h4 class="text-lg font-medium mt-3 mb-2 text-gray-900 dark:text-white">$1</h4>')
          // Bold
          .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>')
          // Lists
          .replace(/^\- (.+)$/gm, '<li class="ml-4 mb-1 text-gray-700 dark:text-gray-300">$1</li>')
          // Paragraphs
          .split('\n\n')
          .map(p => {
            if (p.trim().startsWith('<')) return p
            return `<p class="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">${p.trim()}</p>`
          })
          .join('')
        
        setContent(html)
        setLoading(false)
      })
      .catch(() => {
        setContent('<p class="text-red-500">Error loading Privacy Policy. Please try again later.</p>')
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Privacy Policy</h1>
          <p className="text-gray-600 dark:text-gray-400">Last Updated: January 6, 2026</p>
        </div>
        
        <Card className="glass">
          <CardContent className="p-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div 
                className="prose prose-slate dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

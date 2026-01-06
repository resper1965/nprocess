'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from '@/lib/auth-context'
import { I18nProvider } from '@/lib/i18n/context'
import { analytics } from '@/lib/firebase-config'
import { setAnalyticsUserId } from '@/lib/firebase-analytics'

function AnalyticsWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  
  useEffect(() => {
    if (user && analytics) {
      setAnalyticsUserId(user.uid)
    }
  }, [user])
  
  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AnalyticsWrapper>
              {children}
              <Toaster richColors position="top-right" />
            </AnalyticsWrapper>
          </AuthProvider>
        </ThemeProvider>
      </I18nProvider>
    </QueryClientProvider>
  )
}

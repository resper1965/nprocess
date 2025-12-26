'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { NProcessLogo } from '@/components/ness-logo'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowRight, Shield, Zap, Database, Key } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      // Redirect authenticated users to dashboard
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (user) {
    // Will redirect in useEffect
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <NProcessLogo size="lg" />
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Intelligent Compliance
            <br />
            <span className="text-primary">Management Platform</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Automate compliance analysis, process mapping, and regulatory adherence 
            with AI-powered insights and real-time monitoring.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Compliance Engine</CardTitle>
              <CardDescription>
                Analyze processes against regulatory frameworks (LGPD, SOX, ISO 27001)
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-8 w-8 text-primary mb-2" />
              <CardTitle>AI-Powered Analysis</CardTitle>
              <CardDescription>
                Get intelligent insights and suggestions for process improvement
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Database className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Regulatory Intelligence</CardTitle>
              <CardDescription>
                Access up-to-date regulatory information from multiple sources
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* API Integration Section */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <Key className="h-8 w-8 text-primary mb-2" />
            <CardTitle>API-First Architecture</CardTitle>
            <CardDescription>
              Integrate n.process into your applications with our RESTful API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto">
              <div className="text-gray-500 mb-2"># Example API call</div>
              <div>POST https://api.nprocess.ness.com.br/v1/processes/analyze</div>
              <div className="text-gray-500 mt-4 mb-2"># Response</div>
              <div>{'{'}</div>
              <div className="ml-4">"compliance_score": 87,</div>
              <div className="ml-4">"recommendations": [...]</div>
              <div>{'}'}</div>
            </div>
            <div className="mt-4 flex items-center justify-center">
              <Link href="/dashboard/api-keys">
                <Button variant="outline" className="gap-2">
                  Manage API Keys
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <NProcessLogo size="sm" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2025 ness. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

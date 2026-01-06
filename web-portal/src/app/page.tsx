'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { NessLogo } from '@/components/ness-logo'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowRight, Shield, Zap, Database, Key, CheckCircle2, FileText, MessageSquare, TrendingUp, Globe, Lock, BarChart3, Sparkles } from 'lucide-react'
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

  const features = [
    {
      icon: Shield,
      title: 'Process & Compliance Engine',
      description: 'Analyze processes against regulatory frameworks (LGPD, SOX, ISO 27001, HIPAA, GDPR) with AI-powered insights.',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Analysis',
      description: 'Get intelligent insights and recommendations powered by Google Gemini 1.5 Pro for process improvement.',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: Database,
      title: 'Regulatory Intelligence',
      description: 'Access up-to-date regulatory information from multiple sources with semantic search capabilities.',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: FileText,
      title: 'Document Analysis',
      description: 'Upload and analyze compliance documents with automated scoring and gap identification.',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      icon: MessageSquare,
      title: 'AI Assistant',
      description: 'Chat with our AI assistant to get instant answers about compliance requirements and best practices.',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
    {
      icon: Key,
      title: 'API-First Architecture',
      description: 'Integrate n.process into your applications with our comprehensive RESTful API.',
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
    },
  ]

  const frameworks = [
    'LGPD', 'GDPR', 'SOX', 'ISO 27001', 'HIPAA', 'PCI-DSS', 'NIST', 'FDA', 'ANVISA'
  ]

  const stats = [
    { value: '23+', label: 'Regulatory Frameworks' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '<250ms', label: 'Average Response' },
    { value: '24/7', label: 'Support' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <NessLogo size="lg" />
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
      <main>
        <section className="container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <Badge variant="outline" className="mb-4 text-sm px-4 py-1">
              Process & Compliance Engine
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Intelligent Compliance
              <br />
              <span className="text-primary">Management Platform</span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
              Automate compliance analysis, process mapping, and regulatory adherence 
              with AI-powered insights and real-time monitoring. Built for modern enterprises.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/register">
                <Button size="lg" className="gap-2 text-lg px-8 py-6">
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-20">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20 bg-white/50 dark:bg-gray-900/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Everything You Need for Compliance
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Comprehensive tools and AI-powered insights to keep your organization compliant
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Card key={index} className="glass hover:scale-[1.02] transition-transform">
                    <CardHeader>
                      <div className={`h-12 w-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                        <Icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Frameworks Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Support for Major Regulatory Frameworks
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              We support compliance with the most important regulatory frameworks worldwide
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {frameworks.map((framework) => (
                <Badge key={framework} variant="outline" className="text-base px-4 py-2">
                  {framework}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* API Integration Section */}
        <section className="container mx-auto px-4 py-20 bg-white/50 dark:bg-gray-900/50">
          <div className="max-w-4xl mx-auto">
            <Card className="glass border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Key className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">API-First Architecture</CardTitle>
                    <CardDescription className="text-base">
                      Integrate n.process into your applications with our comprehensive RESTful API
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-6 font-mono text-sm text-gray-300 overflow-x-auto mb-6">
                  <div className="text-gray-500 mb-3"># Example API call</div>
                  <div className="mb-4">
                    <span className="text-purple-400">POST</span>{' '}
                    <span className="text-blue-400">https://nprocess-api-prod-43006907338.us-central1.run.app/v1/analyze</span>
                  </div>
                  <div className="text-gray-500 mb-3"># Response</div>
                  <div className="text-green-400">{'{'}</div>
                  <div className="ml-4 text-yellow-400">"compliance_score": <span className="text-blue-400">87</span>,</div>
                  <div className="ml-4 text-yellow-400">"recommendations": <span className="text-blue-400">[...]</span></div>
                  <div className="text-green-400">{'}'}</div>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <Link href="/dashboard/api-keys">
                    <Button variant="outline" className="gap-2">
                      Manage API Keys
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <a 
                    href="https://nprocess-api-prod-43006907338.us-central1.run.app/docs" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" className="gap-2">
                      View API Docs
                      <Globe className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="glass border-2 border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-12">
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                  Start your free trial today. No credit card required.
                </p>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <Link href="/register">
                    <Button size="lg" className="gap-2 text-lg px-8 py-6">
                      Create Free Account
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <NessLogo size="lg" className="mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Process & Compliance Engine by ness.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/dashboard" className="hover:text-primary">Dashboard</Link></li>
                <li><Link href="/dashboard/api-keys" className="hover:text-primary">API Keys</Link></li>
                <li><Link href="/dashboard/compliance" className="hover:text-primary">Compliance</Link></li>
                <li><Link href="/dashboard/documents" className="hover:text-primary">Documents</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <a href="https://nprocess-api-prod-43006907338.us-central1.run.app/docs" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    API Documentation
                  </a>
                </li>
                <li><Link href="/dashboard/chat" className="hover:text-primary">AI Assistant</Link></li>
                <li><Link href="/dashboard/billing" className="hover:text-primary">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/login" className="hover:text-primary">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-primary">Get Started</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2025 ness. Process & Compliance Engine. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

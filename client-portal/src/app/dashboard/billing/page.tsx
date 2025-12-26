'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Download, CheckCircle2, Calendar, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

interface Plan {
  name: string
  price: number
  annualPrice: number
  description: string
  features: string[]
  current?: boolean
  popular?: boolean
}

interface Invoice {
  id: string
  date: string
  amount: number
  status: string
  downloadUrl: string
}

interface BillingData {
  currentPlan: {
    name: string
    price: number
    billingCycle: string
    renewalDate: string
    features: string[]
  }
  plans: Plan[]
  invoices: Invoice[]
}

export default function BillingPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<BillingData | null>(null)

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        setLoading(true)
        // TODO: Replace with actual API endpoint
        // const response = await fetch('/api/billing')
        // const billingData = await response.json()

        // Default plans structure (these are the available tiers)
        const defaultPlans: Plan[] = [
          {
            name: 'Starter',
            price: 99,
            annualPrice: 990,
            description: 'Perfect for small teams getting started',
            features: [
              '50 documents/month',
              '1,000 API calls/month',
              '1 API key',
              '3 team members',
              '3 frameworks',
              'Email support',
            ],
            current: true,
          },
          {
            name: 'Professional',
            price: 299,
            annualPrice: 2990,
            description: 'For growing teams with more demands',
            features: [
              '200 documents/month',
              '10,000 API calls/month',
              '5 API keys',
              '10 team members',
              '10 frameworks',
              'Priority support',
              'Google Drive integration',
              'SharePoint integration',
            ],
            popular: true,
          },
          {
            name: 'Enterprise',
            price: 999,
            annualPrice: 9990,
            description: 'Advanced features for large organizations',
            features: [
              'Unlimited documents',
              'Unlimited API calls',
              'Unlimited API keys',
              'Unlimited team members',
              'All 23 frameworks',
              '24/7 priority support',
              'All integrations',
              'Custom compliance frameworks',
              'Dedicated account manager',
              'SLA guarantee',
            ],
          },
        ]

        // Set data with defaults
        setData({
          currentPlan: {
            name: 'Starter',
            price: 99,
            billingCycle: 'monthly',
            renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            features: [
              '50 documents per month',
              '1,000 API calls per month',
              '1 API key',
              '3 team members',
              '3 frameworks (LGPD, ISO 27001, HIPAA)',
              '100 chat messages per month',
              'Email support',
            ],
          },
          plans: defaultPlans,
          invoices: []
        })
      } catch (err) {
        console.error('Failed to load billing data:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchBillingData()
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data) {
    return null
  }

  const { currentPlan, plans, invoices } = data

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Billing & Subscription
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your subscription plan and billing information
        </p>
      </div>

      {/* Current Plan */}
      <Card glass className="border-2 border-primary/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{currentPlan.name} Plan</CardTitle>
              <CardDescription>
                ${currentPlan.price}/month • Renews on {currentPlan.renewalDate}
              </CardDescription>
            </div>
            <Badge variant="glass" className="text-sm px-4 py-2">
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {currentPlan.features.slice(0, 4).map((feature, index) => (
              <div key={index} className="text-center p-3 rounded-lg bg-white/5 dark:bg-gray-900/30">
                <p className="text-2xl font-bold text-primary mb-1">
                  {feature.split(' ')[0]}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {feature.split(' ').slice(1).join(' ')}
                </p>
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <Button className="flex-1">
              Upgrade Plan
            </Button>
            <Button variant="outline" className="flex-1">
              Update Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Available Plans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              glass
              className={
                plan.popular
                  ? 'border-2 border-primary/50 scale-105'
                  : plan.current
                  ? 'opacity-60'
                  : ''
              }
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {plan.description}
                    </CardDescription>
                  </div>
                  {plan.popular && (
                    <Badge variant="default" className="text-xs">
                      Popular
                    </Badge>
                  )}
                  {plan.current && (
                    <Badge variant="glass" className="text-xs">
                      Current
                    </Badge>
                  )}
                </div>
                <div className="pt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">/month</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    ${plan.annualPrice}/year (save ${(plan.price * 12) - plan.annualPrice})
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.current ? 'outline' : 'default'}
                  className="w-full"
                  disabled={plan.current}
                >
                  {plan.current ? 'Current Plan' : `Upgrade to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <Card glass>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>
                Manage your payment information
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Update
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                •••• •••• •••• 4242
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Expires 12/2025
              </p>
            </div>
            <Badge variant="success">Verified</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card glass>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            Download your past invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No invoices yet. Your billing history will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between py-3 border-b border-white/10 dark:border-gray-800/30 last:border-0"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {invoice.id}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {invoice.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      ${invoice.amount}
                    </p>
                    <Badge variant="success" className="text-xs">
                      {invoice.status}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Alerts */}
      <Card glass>
        <CardHeader>
          <CardTitle>Usage Alerts</CardTitle>
          <CardDescription>
            Get notified when you're approaching your plan limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                API calls at 80% of limit
              </span>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-primary rounded"
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Documents at 80% of limit
              </span>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-primary rounded"
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Monthly billing reminder (3 days before)
              </span>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-primary rounded"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

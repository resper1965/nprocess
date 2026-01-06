'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/page-header'
import { useI18n } from '@/lib/i18n/context'
import { CreditCard, Download, CheckCircle2, ArrowUpRight, Calendar, Loader2 } from 'lucide-react'
import { usePlans, useCurrentPlan, useInvoices, usePaymentMethod } from '@/hooks/use-billing'
import { toast } from 'sonner'

export default function BillingPage() {
  const { t } = useI18n()

  const handleUpgrade = () => {
    toast.info('Upgrade feature coming soon')
  }

  const handleUpdatePaymentMethod = () => {
    toast.info('Payment method update feature coming soon')
  }

  const handleDownloadInvoice = (invoiceId: string) => {
    toast.info(`Downloading invoice: ${invoiceId}`)
  }
  const { data: plans, isLoading: plansLoading } = usePlans()
  const { data: currentPlan, isLoading: currentPlanLoading } = useCurrentPlan()
  const { data: invoices, isLoading: invoicesLoading } = useInvoices()
  const { data: paymentMethod, isLoading: paymentMethodLoading } = usePaymentMethod()
  
  // Fallback mock data if loading
  const currentPlanData = currentPlan || {
    name: t.billing.plans.starter.name,
    price: 99,
    billingCycle: 'monthly',
    renewalDate: '2024-02-15',
    features: [
      '50 documents per month',
      '1,000 API calls per month',
      '1 API key',
      '3 team members',
      '3 frameworks (LGPD, ISO 27001, HIPAA)',
      '100 chat messages per month',
      'Email support',
    ],
  }

  const plansData = plans || [
    {
      name: t.billing.plans.starter.name,
      price: 99,
      annualPrice: 990,
      description: t.billing.plans.starter.description,
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
      name: t.billing.plans.professional.name,
      price: 299,
      annualPrice: 2990,
      description: t.billing.plans.professional.description,
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
      name: t.billing.plans.enterprise.name,
      price: 999,
      annualPrice: 9990,
      description: t.billing.plans.enterprise.description,
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

  const invoicesData = invoices || [
    {
      id: 'INV-001',
      date: '2024-01-15',
      amount: 99,
      status: 'paid',
      downloadUrl: '#',
    },
    {
      id: 'INV-002',
      date: '2023-12-15',
      amount: 99,
      status: 'paid',
      downloadUrl: '#',
    },
    {
      id: 'INV-003',
      date: '2023-11-15',
      amount: 99,
      status: 'paid',
      downloadUrl: '#',
    },
  ]

  return (
    <>
      <PageHeader 
        title={t.billing.title} 
        description={t.billing.subtitle}
      />
      <div className="p-6 lg:p-8 space-y-8">

      {/* Current Plan */}
      <Card className="glass border-2 border-primary/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{currentPlanData.name} {t.billing.currentPlan}</CardTitle>
              <CardDescription>
                ${currentPlanData.price}/{t.billing.perMonth} • {t.billing.renewsOn} {(currentPlanData as any).renewal_date}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm px-4 py-2">
              {t.billing.active}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {currentPlanData.features.slice(0, 4).map((feature, index) => (
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
            <Button className="flex-1" onClick={handleUpgrade}>
              {t.billing.upgrade}
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleUpdatePaymentMethod}>
              {t.billing.updatePaymentMethod}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {t.billing.availablePlans}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plansData.map((plan) => (
            <Card
              key={plan.name}
              className={
                `glass ${plan.popular
                  ? 'border-2 border-primary/50 scale-105'
                  : (plan as any).current
                  ? 'opacity-60'
                  : ''}`
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
                  {(plan as any).current && (
                    <Badge variant="outline" className="text-xs">
                      Current
                    </Badge>
                  )}
                </div>
                <div className="pt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">/{t.billing.perMonth}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    ${(plan as any).annualPrice}/{t.billing.perYear} ({t.billing.save} ${(plan.price * 12) - (plan as any).annualPrice})
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
                  variant={(plan as any).current ? 'outline' : 'default'}
                  className="w-full"
                  disabled={(plan as any).current}
                  onClick={(plan as any).current ? undefined : handleUpgrade}
                >
                  {(plan as any).current ? 'Current Plan' : `Upgrade to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>
                Manage your payment information
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleUpdatePaymentMethod}>
              Update
            </Button>
          </div>
        </CardHeader>
        <CardContent>
            {paymentMethodLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading payment method...</p>
              </div>
            ) : paymentMethod ? (
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    •••• •••• •••• {paymentMethod.last4}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Expires {paymentMethod.expiry_month}/{paymentMethod.expiry_year}
                  </p>
                </div>
                {paymentMethod.verified && <Badge variant="success">Verified</Badge>}
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">No payment method on file</p>
            )}
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            Download your past invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoicesLoading ? (
              <div className="flex items-center justify-center gap-2 py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading invoices...</p>
              </div>
            ) : invoicesData.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">No invoices found</p>
            ) : (
              invoicesData.map((invoice) => (
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
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDownloadInvoice(invoice.id)}
                    title="Download invoice"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Alerts */}
      <Card className="glass">
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
    </>
  )
}

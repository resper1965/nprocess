import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api-client'

export interface Plan {
  name: string
  price: number
  annual_price: number
  description: string
  features: string[]
  popular: boolean
}

export interface CurrentPlan {
  name: string
  price: number
  billing_cycle: string
  renewal_date: string
  features: string[]
}

export interface Invoice {
  id: string
  date: string
  amount: number
  status: string
  download_url?: string
}

export interface PaymentMethod {
  type: string
  last4: string
  expiry_month: number
  expiry_year: number
  verified: boolean
}

export function usePlans() {
  return useQuery<Plan[], Error>({
    queryKey: ['billing', 'plans'],
    queryFn: async () => {
      const response = await adminApi.get('/v1/billing/plans')
      return response.data
    },
  })
}

export function useCurrentPlan() {
  return useQuery<CurrentPlan, Error>({
    queryKey: ['billing', 'current-plan'],
    queryFn: async () => {
      const response = await adminApi.get('/v1/billing/current-plan')
      return response.data
    },
  })
}

export function useInvoices() {
  return useQuery<Invoice[], Error>({
    queryKey: ['billing', 'invoices'],
    queryFn: async () => {
      const response = await adminApi.get('/v1/billing/invoices')
      return response.data
    },
  })
}

export function usePaymentMethod() {
  return useQuery<PaymentMethod, Error>({
    queryKey: ['billing', 'payment-method'],
    queryFn: async () => {
      const response = await adminApi.get('/v1/billing/payment-method')
      return response.data
    },
  })
}


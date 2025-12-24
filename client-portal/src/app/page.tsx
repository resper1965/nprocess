import { redirect } from 'next/navigation'

export default function HomePage() {
  // In production, this would check authentication
  // For now, redirect to dashboard
  redirect('/dashboard')
}

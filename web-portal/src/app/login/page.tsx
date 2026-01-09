'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n/context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NessLogo } from '@/components/ness-logo'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function LoginPage() {
  const { login, loginWithGoogle, loading, user, role } = useAuth()
  const { t } = useI18n()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  // Simple redirect: observe user from context and redirect when authenticated
  useEffect(() => {
    if (user) {
      const targetPath = (role === 'admin' || role === 'super_admin') 
        ? '/admin/overview' 
        : '/dashboard'
      router.push(targetPath)
    }
  }, [user, role, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    try {
      setError('')
      await login({ email, password })
      // Redirect handled by useEffect watching `user`
    } catch (error: any) {
      console.error('Login error:', error)
      
      let errorMessage = t.auth.login.errors.generic
      
      if (error?.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error?.code) {
        const errorMessages: Record<string, string> = {
          'auth/invalid-email': t.auth.login.errors.invalidEmail,
          'auth/user-not-found': t.auth.login.errors.userNotFound,
          'auth/wrong-password': t.auth.login.errors.wrongPassword,
          'auth/invalid-credential': t.auth.login.errors.invalidCredential,
          'auth/too-many-requests': t.auth.login.errors.tooManyRequests,
          'auth/network-request-failed': t.auth.login.errors.networkError,
        }
        errorMessage = errorMessages[error.code] || error.message || errorMessage
      }
      
      setError(errorMessage)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true)
      setError('')
      
      // Direct call to loginWithGoogle - context handles everything
      await loginWithGoogle()
      
      // Success: useEffect watching `user` will handle redirect automatically
    } catch (error: any) {
      console.error('Google login error:', error)
      
      const errorMessage = error?.message || 'Erro ao fazer login com Google'
      
      // Show toast for errors
      toast.error('Erro ao fazer login', {
        description: errorMessage,
        duration: 5000
      })
      
      setError(errorMessage)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <NessLogo size="xl" className="inline-block mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {t.auth.login.subtitle}
          </p>
        </div>

        {/* Login Card */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>{t.auth.login.title}</CardTitle>
            <CardDescription>
              {t.auth.login.email} e {t.auth.login.password}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-600 dark:text-red-400">
                <div className="font-medium mb-2">⚠️ Erro ao fazer login</div>
                <div>{error}</div>
              </div>
            )}

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <label 
                  htmlFor="login-email"
                  className="text-sm font-medium text-gray-900 dark:text-white"
                >
                  {t.auth.login.email}
                </label>
                <Input
                  id="login-email"
                  name="email"
                  className="glass"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label 
                    htmlFor="login-password"
                    className="text-sm font-medium text-gray-900 dark:text-white"
                  >
                    {t.auth.login.password}
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    {t.auth.login.forgotPassword}
                  </Link>
                </div>
                <Input
                  id="login-password"
                  name="password"
                  className="glass"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="current-password"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !email || !password}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t.common.loading}
                  </>
                ) : (
                  t.common.signIn
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={loading || isGoogleLoading}
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t.common.loading}
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {t.auth.login.signInWithGoogle}
                </>
              )}
            </Button>

            {/* Sign up link */}
            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              {t.auth.login.dontHaveAccount}{' '}
              <Link href="/register" className="text-primary font-medium hover:underline">
                {t.auth.login.signUp}
              </Link>
            </div>
            
            {/* Legal Links */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                By signing in, you agree to our{' '}
                <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            © 2025 ness. n.process. All rights reserved.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useI18n } from '@/lib/i18n/context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NessLogo } from '@/components/ness-logo'
import { Loader2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { checkTrackingPreventionStatus } from '@/lib/firebase-auth'

export default function LoginPage() {
  const { login, loginWithGoogle, loading, user, role, isAuthenticated } = useAuth()
  const { t } = useI18n()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [trackingPreventionWarning, setTrackingPreventionWarning] = useState('')

  // Check for Tracking Prevention on mount
  useEffect(() => {
    const checkStorage = async () => {
      const status = await checkTrackingPreventionStatus();
      if (status.blocked) {
        console.warn('⚠️ Tracking Prevention detected:', status.reason);
        setTrackingPreventionWarning(
          'Seu navegador está bloqueando o armazenamento necessário para login. ' +
          'Por favor, desative a "Prevenção de Rastreamento" para este site.'
        );
      }
    };
    
    checkStorage();
  }, []);

  // Redirect authenticated users away from login page
  useEffect(() => {
    console.log('LoginPage useEffect: Auth state', { 
      loading, 
      isAuthenticated, 
      hasUser: !!user, 
      role, 
      path: typeof window !== 'undefined' ? window.location.pathname : 'N/A' 
    });
    
    // Only redirect if:
    // 1. Not loading anymore
    // 2. User is authenticated
    // 3. Role has been determined (not null) - IMPORTANT!
    if (!loading && isAuthenticated && user && role !== null) {
      // Use role if available, otherwise default to dashboard
      const targetPath = (role === 'admin' || role === 'super_admin') ? '/admin/overview' : '/dashboard'
      console.log('LoginPage: User authenticated with role, redirecting to:', targetPath, { 
        user: user.uid, 
        role, 
        currentPath: typeof window !== 'undefined' ? window.location.pathname : 'N/A' 
      })
      
      // Small delay to ensure state is fully updated
      setTimeout(() => {
        if (window.location.pathname === '/login' || window.location.pathname === '/login/') {
          console.log('LoginPage: Executing redirect to', targetPath);
          router.push(targetPath);
        }
      }, 300);
    } else {
      console.log('LoginPage: Not redirecting yet', {
        loading,
        isAuthenticated,
        hasUser: !!user,
        hasRole: role !== null,
        role
      });
    }
  }, [loading, isAuthenticated, user, role, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    try {
      setError('')
      await login({ email, password })
    } catch (error: any) {
      // Extract meaningful error message
      let errorMessage = t.auth.login.errors.generic
      
      if (error?.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error?.code) {
        // Firebase error code
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
      
      console.error('Login error:', error)
      setError(errorMessage)
    }
  }

  const handleGoogleLogin = async () => {
    console.log('handleGoogleLogin: Button clicked, starting Google login...')
    
    // Detect Edge browser
    const isEdge = typeof window !== 'undefined' && 
                   (window.navigator.userAgent.includes('Edg/') || 
                    window.navigator.userAgent.includes('Edge/'));
    
    if (isEdge) {
      console.log('handleGoogleLogin: Edge browser detected - using Edge-optimized flow');
    }
    
    try {
      setError('')
      
      console.log('handleGoogleLogin: Calling loginWithGoogle()...')
      
      // loginWithGoogle now uses redirect instead of popup
      // This avoids third-party cookie blocking issues
      // signInWithRedirect should work with Edge's Tracking Prevention as it's a full-page redirect
      await loginWithGoogle()
      
      console.log('handleGoogleLogin: loginWithGoogle() completed - redirect should happen now')
      
      // Note: The user will be redirected to Google for authentication
      // After authentication, they'll be redirected back to our app
      // The redirect result will be handled automatically by the auth context
    } catch (error: any) {
      console.error('handleGoogleLogin: Error caught:', error)
      console.error('handleGoogleLogin: Error details:', {
        code: error?.code,
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      })
      
      // Extract meaningful error message
      let errorMessage = t.auth.login.errors.generic
      
      if (error?.userMessage) {
        errorMessage = error.userMessage
      } else if (error?.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error?.code) {
        // Firebase error code - map to user-friendly messages
        const errorMessages: Record<string, string> = {
          'auth/popup-closed-by-user': 'Login cancelado. Por favor, tente novamente.',
          'auth/popup-blocked': 'Popup bloqueado pelo navegador. Usando redirecionamento...',
          'auth/cancelled-popup-request': 'Login cancelado. Por favor, tente novamente.',
          'auth/operation-not-allowed': 'Login com Google não está habilitado. Entre em contato com o suporte.',
          'auth/configuration-not-found': 'Configuração do Firebase não encontrada. Verifique as configurações.',
          'auth/unauthorized-domain': 'Domínio não autorizado. Verifique as configurações do Firebase.',
          'auth/network-request-failed': 'Erro de rede. Verifique sua conexão e tente novamente. ' +
                                         'Se o problema persistir, pode ser bloqueio de rastreamento do navegador.',
        }
        errorMessage = errorMessages[error.code] || error.message || errorMessage
      }
      
      // Check for tracking prevention errors in message
      const isEdge = typeof window !== 'undefined' && 
                     (window.navigator.userAgent.includes('Edg/') || 
                      window.navigator.userAgent.includes('Edge/'));
      
      if (errorMessage.toLowerCase().includes('tracking prevention') || 
          (errorMessage.toLowerCase().includes('storage') && errorMessage.toLowerCase().includes('blocked'))) {
        if (isEdge) {
          errorMessage = 'O Microsoft Edge está bloqueando o acesso necessário para o login com Google. ' +
                         'Para resolver, siga estes passos:\n\n' +
                         '1. Clique no ícone de cadeado ao lado do endereço do site\n' +
                         '2. Em "Prevenção de rastreamento", selecione "Desativada" para este site\n' +
                         '3. Ou vá em Configurações → Privacidade → Prevenção de rastreamento → "Básico"\n\n' +
                         'O login com Google funcionará após essas configurações.';
        } else {
          errorMessage = 'Seu navegador está bloqueando o acesso necessário para o login com Google. ' +
                         'Por favor, desative a "Prevenção de Rastreamento" nas configurações do navegador ' +
                         'ou use outro navegador (Chrome, Firefox).';
        }
      }
      
      console.error('handleGoogleLogin: Setting error message:', errorMessage)
      setError(errorMessage)
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
            {/* Tracking Prevention Warning - Show proactively */}
            {trackingPreventionWarning && (
              <div className="mb-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-sm">
                <div className="flex items-start gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-amber-900 dark:text-amber-300 mb-1">
                      ⚠️ Bloqueio de Armazenamento Detectado
                    </div>
                    <div className="text-amber-800 dark:text-amber-200 mb-3">
                      {trackingPreventionWarning}
                    </div>
                    <div className="text-xs font-medium text-amber-900 dark:text-amber-300 mb-2">
                      💡 Como resolver no Microsoft Edge:
                    </div>
                    <ol className="text-xs list-decimal list-inside space-y-1.5 text-amber-800/90 dark:text-amber-200/90 ml-1">
                      <li className="font-medium">
                        Método Rápido (Recomendado):
                        <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5 font-normal">
                          <li>Clique no ícone de <strong>cadeado 🔒</strong> ao lado do endereço</li>
                          <li>Em "Prevenção de rastreamento", escolha <strong>"Desativada"</strong></li>
                          <li>Recarregue a página</li>
                        </ul>
                      </li>
                      <li className="font-medium">
                        Método Alternativo:
                        <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5 font-normal">
                          <li>Menu Edge → Configurações → Privacidade</li>
                          <li>Em "Prevenção de rastreamento", selecione <strong>"Básico"</strong></li>
                          <li>Recarregue a página</li>
                        </ul>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-600 dark:text-red-400">
                <div className="font-medium mb-2">⚠️ Erro ao fazer login</div>
                <div className="mb-2">{error}</div>
                {(error.toLowerCase().includes('tracking prevention') || 
                  (error.toLowerCase().includes('storage') && error.toLowerCase().includes('blocked')) ||
                  error.toLowerCase().includes('rastreamento') ||
                  error.toLowerCase().includes('microsoft edge')) ? (
                  <div className="mt-3 pt-3 border-t border-red-500/20">
                    <div className="text-xs font-medium mb-2">💡 Soluções para Microsoft Edge:</div>
                    <ol className="text-xs list-decimal list-inside space-y-2 text-red-500/80 dark:text-red-400/80">
                      <li className="font-medium">Método Rápido (Recomendado):
                        <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                          <li>Clique no ícone de <strong>cadeado</strong> ao lado do endereço do site</li>
                          <li>Em "Prevenção de rastreamento", selecione <strong>"Desativada"</strong> para este site</li>
                          <li>Recarregue a página e tente novamente</li>
                        </ul>
                      </li>
                      <li className="font-medium">Método Global:
                        <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                          <li>Configurações → <strong>Privacidade, pesquisa e serviços</strong></li>
                          <li>Em "Prevenção de rastreamento", escolha <strong>"Básico"</strong></li>
                          <li>Recarregue a página e tente novamente</li>
                        </ul>
                      </li>
                    </ol>
                    <div className="mt-2 text-xs text-red-500/60 dark:text-red-400/60">
                      ⚠️ O login com Google requer acesso ao storage do Google APIs, que é bloqueado pela Prevenção de Rastreamento.
                    </div>
                  </div>
                ) : null}
              </div>
            )}
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

              {/* Submit */}
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

            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? (
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

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NessLogo } from '@/components/ness-logo'
import { Loader2, ArrowLeft, Mail } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Por favor, insira seu email')
      return
    }

    setLoading(true)
    try {
      // TODO: Implement password reset via Firebase Auth
      // For now, show success message
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSent(true)
      toast.success('Email de recuperação enviado!', {
        description: 'Verifique sua caixa de entrada e siga as instruções.'
      })
    } catch (error: any) {
      console.error('Error sending password reset:', error)
      toast.error('Erro ao enviar email', {
        description: error?.message || 'Tente novamente mais tarde.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <NessLogo size="lg" />
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Recuperar Senha</CardTitle>
            <CardDescription>
              {sent 
                ? 'Verifique seu email para redefinir sua senha'
                : 'Digite seu email para receber instruções de recuperação'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center p-6 bg-primary/10 rounded-lg">
                  <Mail className="w-12 h-12 text-primary" />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Enviamos um email para <strong>{email}</strong> com instruções para redefinir sua senha.
                </p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSent(false)
                      setEmail('')
                    }}
                  >
                    Enviar novamente
                  </Button>
                  <Link href="/login">
                    <Button variant="ghost" className="w-full">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar para login
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || !email}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Enviar email de recuperação
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar para login
                    </Button>
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Não tem uma conta?{' '}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

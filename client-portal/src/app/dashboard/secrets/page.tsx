'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Lock, Plus, Trash2, Eye, EyeOff, Cloud, Github, Database } from 'lucide-react'
import { toast } from 'sonner'

type IntegrationType = 'google_cloud' | 'aws' | 'azure' | 'github'

interface Secret {
  id: string
  integration_type: IntegrationType
  secret_name: string
  description: string
  created: string
  lastUsed?: string
}

const integrationConfig = {
  google_cloud: {
    name: 'Google Cloud',
    icon: Cloud,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  aws: {
    name: 'AWS',
    icon: Cloud,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  azure: {
    name: 'Azure',
    icon: Cloud,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
  },
  github: {
    name: 'GitHub',
    icon: Github,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
}

export default function SecretsPage() {
  const [showNewSecretDialog, setShowNewSecretDialog] = useState(false)
  const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState({
    integration_type: 'google_cloud' as IntegrationType,
    secret_name: '',
    secret_value: '',
    description: '',
  })

  // Mock data
  const secrets: Secret[] = [
    {
      id: 'secret_1',
      integration_type: 'google_cloud',
      secret_name: 'GOOGLE_APPLICATION_CREDENTIALS',
      description: 'Service account key for Vertex AI',
      created: '2024-01-15',
      lastUsed: '2 hours ago',
    },
  ]

  const toggleSecretVisibility = (secretId: string) => {
    setRevealedSecrets(prev => {
      const next = new Set(prev)
      if (next.has(secretId)) {
        next.delete(secretId)
      } else {
        next.add(secretId)
      }
      return next
    })
  }

  const handleCreateSecret = () => {
    if (!formData.secret_name.trim() || !formData.secret_value.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    // TODO: Call API to create secret
    toast.success('Secret created successfully')
    setShowNewSecretDialog(false)
    setFormData({
      integration_type: 'google_cloud',
      secret_name: '',
      secret_value: '',
      description: '',
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Secrets Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Securely store API keys and credentials for external integrations
          </p>
        </div>
        <Button onClick={() => setShowNewSecretDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Secret
        </Button>
      </div>

      {/* Security Notice */}
      <Card glass className="border-yellow-500/50">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <Lock className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Security Best Practices
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                All secrets are encrypted at rest using AES-256-GCM and stored in Google Cloud Secret Manager.
                Never share your secrets or commit them to version control.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Secret Dialog */}
      {showNewSecretDialog && (
        <Card glass className="border-2 border-primary/50">
          <CardHeader>
            <CardTitle>Add New Secret</CardTitle>
            <CardDescription>
              Configure credentials for external integrations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Integration Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Integration Type
              </label>
              <select
                className="w-full px-4 py-2 rounded-lg glass dark:glass-dark border border-white/20 dark:border-gray-800/50 bg-white/5 dark:bg-gray-900/30 text-gray-900 dark:text-white"
                value={formData.integration_type}
                onChange={(e) => setFormData({ ...formData, integration_type: e.target.value as IntegrationType })}
              >
                <option value="google_cloud">Google Cloud</option>
                <option value="aws">AWS</option>
                <option value="azure">Azure</option>
                <option value="github">GitHub</option>
              </select>
            </div>

            {/* Secret Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Secret Name
              </label>
              <Input
                glass
                placeholder="e.g., GEMINI_API_KEY, AWS_ACCESS_KEY_ID"
                value={formData.secret_name}
                onChange={(e) => setFormData({ ...formData, secret_name: e.target.value })}
              />
            </div>

            {/* Secret Value */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Secret Value
              </label>
              <Input
                glass
                type="password"
                placeholder="Enter the secret value"
                value={formData.secret_value}
                onChange={(e) => setFormData({ ...formData, secret_value: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Description (Optional)
              </label>
              <Input
                glass
                placeholder="What is this secret used for?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowNewSecretDialog(false)
                  setFormData({
                    integration_type: 'google_cloud',
                    secret_name: '',
                    secret_value: '',
                    description: '',
                  })
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateSecret}>
                Create Secret
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Secrets List */}
      <div className="space-y-4">
        {secrets.map((secret) => {
          const isRevealed = revealedSecrets.has(secret.id)
          const config = integrationConfig[secret.integration_type]
          const Icon = config.icon

          return (
            <Card key={secret.id} glass>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {secret.secret_name}
                          </h3>
                          <Badge variant="glass" className="text-xs">
                            {config.name}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {secret.description}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        // TODO: Implement delete
                        toast.success('Secret deleted')
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>

                  {/* Secret Value */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Value
                    </label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-900/60 rounded-lg text-sm font-mono border border-gray-200 dark:border-gray-800">
                        {isRevealed ? '*********************' : '•'.repeat(40)}
                      </code>
                      <Button
                        variant="glass"
                        size="icon"
                        onClick={() => toggleSecretVisibility(secret.id)}
                      >
                        {isRevealed ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>Created {secret.created}</span>
                    {secret.lastUsed && (
                      <>
                        <span>•</span>
                        <span>Last used {secret.lastUsed}</span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Integration Examples */}
      <Card glass>
        <CardHeader>
          <CardTitle>Common Integration Secrets</CardTitle>
          <CardDescription>
            Examples of secrets you might need to configure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Google Cloud
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• GOOGLE_APPLICATION_CREDENTIALS</li>
                <li>• GEMINI_API_KEY</li>
                <li>• VERTEX_AI_PROJECT_ID</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                AWS
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• AWS_ACCESS_KEY_ID</li>
                <li>• AWS_SECRET_ACCESS_KEY</li>
                <li>• AWS_REGION</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

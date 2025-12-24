'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Cloud,
  MessageSquare,
  FileText,
  Brain,
  CheckCircle2,
  XCircle,
  Settings,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'

interface Integration {
  id: string
  name: string
  description: string
  icon: any
  color: string
  bgColor: string
  status: 'connected' | 'disconnected'
  requiresPlan?: string
  configurable: boolean
}

export default function IntegrationsPage() {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null)

  const integrations: Integration[] = [
    {
      id: 'google_drive',
      name: 'Google Drive',
      description: 'Automatically save analyzed documents to Google Drive',
      icon: Cloud,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      status: 'connected',
      configurable: true,
    },
    {
      id: 'sharepoint',
      name: 'SharePoint',
      description: 'Sync compliance documents with Microsoft SharePoint',
      icon: Cloud,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
      status: 'disconnected',
      requiresPlan: 'Professional',
      configurable: true,
    },
    {
      id: 'onedrive',
      name: 'OneDrive',
      description: 'Store documents in Microsoft OneDrive',
      icon: Cloud,
      color: 'text-blue-600',
      bgColor: 'bg-blue-600/10',
      status: 'disconnected',
      requiresPlan: 'Professional',
      configurable: true,
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Get notifications about compliance status in Slack',
      icon: MessageSquare,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      status: 'disconnected',
      configurable: true,
    },
    {
      id: 'notebooklm',
      name: 'NotebookLM',
      description: 'Create AI-powered notebooks from compliance documents',
      icon: Brain,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      status: 'disconnected',
      requiresPlan: 'Enterprise',
      configurable: true,
    },
  ]

  const handleConnect = (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId)

    if (integration?.requiresPlan) {
      toast.error(`${integration.name} requires ${integration.requiresPlan} plan or higher`)
      return
    }

    // TODO: Implement OAuth flow
    toast.success(`${integration?.name} connected successfully`)
  }

  const handleDisconnect = (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId)
    toast.success(`${integration?.name} disconnected`)
  }

  const handleConfigure = (integrationId: string) => {
    setSelectedIntegration(integrationId)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Integrations
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Connect ComplianceEngine with your favorite tools and services
        </p>
      </div>

      {/* Connected Count */}
      <Card glass>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                1 integration active
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Connect more tools to enhance your workflow
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((integration) => {
          const Icon = integration.icon
          const isConnected = integration.status === 'connected'

          return (
            <Card key={integration.id} glass>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-lg ${integration.bgColor} flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${integration.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      {integration.requiresPlan && (
                        <Badge variant="glass" className="text-xs mt-1">
                          {integration.requiresPlan}+ plan
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={isConnected ? 'success' : 'glass'}
                    className="text-xs"
                  >
                    {isConnected ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Connected
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Disconnected
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {integration.description}
                </p>

                <div className="flex gap-2">
                  {isConnected ? (
                    <>
                      {integration.configurable && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConfigure(integration.id)}
                          className="flex-1 gap-2"
                        >
                          <Settings className="h-4 w-4" />
                          Configure
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDisconnect(integration.id)}
                        className="flex-1"
                      >
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleConnect(integration.id)}
                      className="flex-1 gap-2"
                      disabled={!!integration.requiresPlan}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Connect
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Configuration Panel */}
      {selectedIntegration === 'google_drive' && (
        <Card glass className="border-2 border-primary/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Google Drive Configuration</CardTitle>
                <CardDescription>
                  Customize how documents are saved to Google Drive
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIntegration(null)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Folder ID */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Destination Folder ID (Optional)
              </label>
              <Input
                glass
                placeholder="Leave empty to save to root folder"
                defaultValue=""
              />
              <p className="text-xs text-gray-600 dark:text-gray-400">
                You can find the folder ID in the folder URL
              </p>
            </div>

            {/* Folder Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Folder Name
              </label>
              <Input
                glass
                defaultValue="ComplianceEngine Documents"
              />
            </div>

            {/* Auto Upload */}
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Auto-upload analyzed documents
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Automatically save documents to Drive after analysis
                </p>
              </div>
              <input
                type="checkbox"
                defaultChecked={false}
                className="h-4 w-4 text-primary rounded"
              />
            </div>

            {/* Share Settings */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Share with emails (comma-separated)
              </label>
              <Input
                glass
                placeholder="user1@example.com, user2@example.com"
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setSelectedIntegration(null)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast.success('Google Drive configuration saved')
                setSelectedIntegration(null)
              }}>
                Save Configuration
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Coming Soon */}
      <Card glass>
        <CardHeader>
          <CardTitle>More Integrations Coming Soon</CardTitle>
          <CardDescription>
            We're constantly adding new integrations. Request one!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="glass">Jira</Badge>
            <Badge variant="glass">Confluence</Badge>
            <Badge variant="glass">Microsoft Teams</Badge>
            <Badge variant="glass">Asana</Badge>
            <Badge variant="glass">Monday.com</Badge>
            <Badge variant="glass">Dropbox</Badge>
            <Badge variant="glass">Box</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

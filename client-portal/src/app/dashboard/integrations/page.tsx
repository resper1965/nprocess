'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/page-header'
import {
  Cloud,
  MessageSquare,
  FileText,
  Brain,
  CheckCircle2,
  XCircle,
  Settings,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useIntegrations } from '@/hooks/use-integrations'

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
  const { integrations, isLoading, connect, disconnect, updateConfig, isConnecting, isDisconnecting } = useIntegrations()
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null)
  const [configData, setConfigData] = useState({
    folder_id: '',
    folder_name: 'Process & Compliance Engine Documents',
    auto_upload: false,
    share_with_emails: '',
  })

  // Icon mapping
  const iconMap: Record<string, any> = {
    google_drive: Cloud,
    sharepoint: Cloud,
    onedrive: Cloud,
    slack: MessageSquare,
    notebooklm: Brain,
  }

  const colorMap: Record<string, string> = {
    google_drive: 'text-blue-500',
    sharepoint: 'text-cyan-500',
    onedrive: 'text-blue-600',
    slack: 'text-purple-500',
    notebooklm: 'text-orange-500',
  }

  const bgColorMap: Record<string, string> = {
    google_drive: 'bg-blue-500/10',
    sharepoint: 'bg-cyan-500/10',
    onedrive: 'bg-blue-600/10',
    slack: 'bg-purple-500/10',
    notebooklm: 'bg-orange-500/10',
  }

  // Fallback mock data if loading
  const integrationsData: Integration[] = integrations.length > 0 ? integrations.map(integration => ({
    id: integration.id,
    name: integration.name,
    description: integration.description,
    icon: iconMap[integration.id] || Cloud,
    color: colorMap[integration.id] || 'text-gray-500',
    bgColor: bgColorMap[integration.id] || 'bg-gray-500/10',
    status: integration.status,
    requiresPlan: integration.requires_plan,
    configurable: integration.configurable,
  })) : []

  const handleConnect = async (integrationId: string) => {
    const integration = integrationsData.find(i => i.id === integrationId)

    if (integration?.requiresPlan) {
      toast.error(`${integration.name} requires ${integration.requiresPlan} plan or higher`)
      return
    }

    try {
      await connect(integrationId)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleDisconnect = async (integrationId: string) => {
    try {
      await disconnect(integrationId)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleConfigure = (integrationId: string) => {
    setSelectedIntegration(integrationId)
  }

  return (
    <>
      <PageHeader 
        title="Integrations" 
        description="Connect Process & Compliance Engine with your favorite tools and services"
      />
      <div className="p-6 lg:p-8 space-y-8">

      {/* Connected Count */}
      <Card className="glass">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              ) : (
                <CheckCircle2 className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {isLoading ? 'Loading...' : `${integrationsData.filter(i => i.status === 'connected').length} integration${integrationsData.filter(i => i.status === 'connected').length !== 1 ? 's' : ''} active`}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Connect more tools to enhance your workflow
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integrations Grid */}
      {isLoading ? (
        <Card className="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading integrations...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrationsData.map((integration) => {
          const Icon = integration.icon
          const isConnected = integration.status === 'connected'

          return (
            <Card key={integration.id} className="glass">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-lg ${integration.bgColor} flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${integration.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      {integration.requiresPlan && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {integration.requiresPlan}+ plan
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
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
                        disabled={isDisconnecting}
                      >
                        {isDisconnecting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Disconnecting...
                          </>
                        ) : (
                          'Disconnect'
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleConnect(integration.id)}
                      className="flex-1 gap-2"
                      disabled={!!integration.requiresPlan || isConnecting}
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4" />
                          Connect
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
        </div>
      )}

      {/* Configuration Panel */}
      {selectedIntegration === 'google_drive' && (
        <Card className="glass border-2 border-primary/50">
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
                className="glass"
                placeholder="Leave empty to save to root folder"
                value={configData.folder_id}
                onChange={(e) => setConfigData({ ...configData, folder_id: e.target.value })}
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
                className="glass"
                value={configData.folder_name}
                onChange={(e) => setConfigData({ ...configData, folder_name: e.target.value })}
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
                checked={configData.auto_upload}
                onChange={(e) => setConfigData({ ...configData, auto_upload: e.target.checked })}
                className="h-4 w-4 text-primary rounded"
              />
            </div>

            {/* Share Settings */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Share with emails (comma-separated)
              </label>
              <Input
                className="glass"
                placeholder="user1@example.com, user2@example.com"
                value={configData.share_with_emails}
                onChange={(e) => setConfigData({ ...configData, share_with_emails: e.target.value })}
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setSelectedIntegration(null)}>
                Cancel
              </Button>
              <Button onClick={async () => {
                try {
                  await updateConfig({
                    integrationId: 'google_drive',
                    config: {
                      folder_id: configData.folder_id || undefined,
                      folder_name: configData.folder_name,
                      auto_upload: configData.auto_upload,
                      share_with_emails: configData.share_with_emails ? configData.share_with_emails.split(',').map(e => e.trim()) : undefined,
                    }
                  })
                  setSelectedIntegration(null)
                } catch (error) {
                  // Error handled by mutation
                }
              }}>
                Save Configuration
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Coming Soon */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>More Integrations Coming Soon</CardTitle>
          <CardDescription>
            We're constantly adding new integrations. Request one!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Jira</Badge>
            <Badge variant="outline">Confluence</Badge>
            <Badge variant="outline">Microsoft Teams</Badge>
            <Badge variant="outline">Asana</Badge>
            <Badge variant="outline">Monday.com</Badge>
            <Badge variant="outline">Dropbox</Badge>
            <Badge variant="outline">Box</Badge>
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  )
}

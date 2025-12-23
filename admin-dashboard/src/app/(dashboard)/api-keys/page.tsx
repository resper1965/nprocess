"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Copy, Eye, EyeOff, MoreVertical, Trash2, Key } from "lucide-react"
import { cn } from "@/lib/utils"

export default function APIKeysPage() {
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [newKey, setNewKey] = useState<string | null>(null)

  // Mock data - replace with actual API calls
  const apiKeys = [
    {
      id: "1",
      name: "Contracts App - Production",
      keyPrefix: "ce_live_1234",
      consumerApp: "contracts-app",
      status: "active",
      createdAt: "2024-01-15T10:30:00Z",
      lastUsed: "2 hours ago",
      requestsToday: 1247,
      quotaPerDay: 10000
    },
    {
      id: "2",
      name: "Audit Portal - Production",
      keyPrefix: "ce_live_5678",
      consumerApp: "audit-portal",
      status: "active",
      createdAt: "2024-01-10T14:20:00Z",
      lastUsed: "15 minutes ago",
      requestsToday: 834,
      quotaPerDay: 5000
    },
    {
      id: "3",
      name: "Internal Testing",
      keyPrefix: "ce_test_9012",
      consumerApp: "test-suite",
      status: "active",
      createdAt: "2024-01-05T09:00:00Z",
      lastUsed: "3 days ago",
      requestsToday: 12,
      quotaPerDay: 1000
    },
  ]

  const filteredKeys = apiKeys.filter((key) =>
    key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    key.consumerApp.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCopyKey = (keyPrefix: string) => {
    // In production, this would copy the actual key
    navigator.clipboard.writeText(keyPrefix + "...")
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground mt-2">
            Manage API keys for consumer applications
          </p>
        </div>
        <Button onClick={() => setShowNewKeyDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create API Key
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search API keys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              All Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Keys List */}
      <div className="space-y-4">
        {filteredKeys.map((apiKey) => {
          const usagePercent = (apiKey.requestsToday / apiKey.quotaPerDay) * 100

          return (
            <Card key={apiKey.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{apiKey.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-muted rounded text-xs font-mono">
                        {apiKey.keyPrefix}...
                      </code>
                      <span>•</span>
                      <span>{apiKey.consumerApp}</span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success">
                      {apiKey.status}
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium mt-1">
                      {new Date(apiKey.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Used</p>
                    <p className="font-medium mt-1">{apiKey.lastUsed}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Requests Today</p>
                    <p className="font-medium mt-1">
                      {apiKey.requestsToday.toLocaleString()} / {apiKey.quotaPerDay.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Usage</p>
                    <div className="mt-2">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all",
                            usagePercent > 80 ? "bg-red-500" :
                            usagePercent > 50 ? "bg-yellow-500" :
                            "bg-green-500"
                          )}
                          style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {usagePercent.toFixed(1)}% of quota
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyKey(apiKey.keyPrefix)}
                  >
                    <Copy className="w-3 h-3 mr-2" />
                    Copy Prefix
                  </Button>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Rotate Key
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                    <Trash2 className="w-3 h-3 mr-2" />
                    Revoke
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredKeys.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <Key className="w-12 h-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="font-semibold">No API keys found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery ? "Try adjusting your search" : "Create your first API key to get started"}
                </p>
              </div>
              {!searchQuery && (
                <Button onClick={() => setShowNewKeyDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create API Key
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Key Dialog (Modal) - Simplified version */}
      {showNewKeyDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Create New API Key</CardTitle>
              <CardDescription>
                Generate a new API key for a consumer application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Key Name</label>
                <Input placeholder="e.g., Contracts App - Production" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Consumer App ID</label>
                <Input placeholder="e.g., contracts-app" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Daily Request Quota</label>
                <Input type="number" placeholder="10000" defaultValue="10000" />
              </div>
              <div className="flex gap-2 pt-4">
                <Button className="flex-1">
                  <Key className="w-4 h-4 mr-2" />
                  Generate Key
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowNewKeyDialog(false)}
                >
                  Cancel
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                ⚠️  The API key will be shown only once. Make sure to copy and store it securely.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

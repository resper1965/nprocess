'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Upload, Download, Eye, Trash2, CheckCircle2, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'

interface Document {
  id: string
  name: string
  size: string
  framework: string
  status: 'analyzed' | 'analyzing' | 'pending'
  uploadedAt: string
  score: number | null
}

interface DocumentStats {
  used: number
  limit: number
  percentage: number
}

export default function DocumentsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState<Document[]>([])
  const [stats, setStats] = useState<DocumentStats | null>(null)

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoading(true)
        // TODO: Replace with actual API endpoint
        // const response = await fetch('/api/documents')
        // const data = await response.json()
        // setDocuments(data.documents)
        // setStats(data.stats)

        setDocuments([])
        setStats({
          used: 0,
          limit: 50,
          percentage: 0
        })
      } catch (err) {
        console.error('Failed to load documents:', err)
        toast.error('Failed to load documents')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadDocuments()
    }
  }, [user])

  const handleUpload = () => {
    // TODO: Implement upload functionality
    toast.info('Upload functionality - connect to /api/documents/upload')
  }

  const handleDelete = (id: string) => {
    // TODO: Implement delete functionality
    toast.info('Delete functionality - connect to /api/documents/' + id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Documents
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload and analyze compliance documents
          </p>
        </div>
        <Button onClick={handleUpload} className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Usage */}
      {stats && (
        <Card glass>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {stats.used} / {stats.limit} Documents Used
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your monthly document quota
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{stats.percentage}%</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Used</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents List or Empty State */}
      {documents.length === 0 ? (
        <Card glass>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Documents Yet
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center max-w-md">
              Upload your first compliance document to get started with AI-powered analysis
            </p>
            <Button onClick={handleUpload} className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Your First Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => (
            <Card key={doc.id} glass>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {doc.name}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <span>{doc.size}</span>
                        <span>•</span>
                        <Badge variant="glass" className="text-xs">
                          {doc.framework}
                        </Badge>
                        <span>•</span>
                        <span>Uploaded {doc.uploadedAt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {doc.score && (
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-500">
                          {doc.score}%
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Compliance
                        </p>
                      </div>
                    )}
                    <Badge
                      variant={doc.status === 'analyzed' ? 'success' : 'glass'}
                      className="text-xs"
                    >
                      {doc.status === 'analyzed' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {doc.status === 'analyzed' ? 'Analyzed' : doc.status === 'analyzing' ? 'Analyzing...' : 'Pending'}
                    </Badge>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(doc.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

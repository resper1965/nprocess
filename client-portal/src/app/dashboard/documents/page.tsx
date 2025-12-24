'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Upload, Download, Eye, Trash2, CheckCircle2 } from 'lucide-react'

export default function DocumentsPage() {
  const documents = [
    {
      id: '1',
      name: 'LGPD Compliance Policy v2.pdf',
      size: '2.4 MB',
      framework: 'LGPD',
      status: 'analyzed',
      uploadedAt: '2024-01-15',
      score: 92,
    },
    {
      id: '2',
      name: 'Privacy Impact Assessment.docx',
      size: '1.8 MB',
      framework: 'GDPR',
      status: 'analyzing',
      uploadedAt: '2024-01-14',
      score: null,
    },
    {
      id: '3',
      name: 'Security Controls Documentation.pdf',
      size: '3.2 MB',
      framework: 'ISO 27001',
      status: 'analyzed',
      uploadedAt: '2024-01-13',
      score: 88,
    },
  ]

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
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Usage */}
      <Card glass>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  23 / 50 Documents Used
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your monthly document quota
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">54%</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Used</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
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
                    {doc.status === 'analyzed' ? 'Analyzed' : 'Analyzing...'}
                  </Badge>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

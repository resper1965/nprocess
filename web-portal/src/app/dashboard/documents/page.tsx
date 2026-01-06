'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/page-header'
import { useI18n } from '@/lib/i18n/context'
import { FileText, Upload, Download, Eye, Trash2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function DocumentsPage() {
  const { t } = useI18n()

  const handleUpload = () => {
    toast.info('Document upload feature coming soon')
  }

  const handleView = (docId: string, docName: string) => {
    toast.info(`Viewing document: ${docName}`)
  }

  const handleDownload = (docId: string, docName: string) => {
    toast.info(`Downloading document: ${docName}`)
  }

  const handleDelete = (docId: string, docName: string) => {
    if (confirm(`Are you sure you want to delete "${docName}"?`)) {
      toast.success(`Document "${docName}" deleted`)
    }
  }
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
    <>
      <PageHeader 
        title={t.documents.title} 
        description={t.documents.subtitle}
      >
        <Button className="gap-2" onClick={handleUpload}>
          <Upload className="h-4 w-4" />
          {t.documents.upload}
        </Button>
      </PageHeader>
      <div className="p-6 lg:p-8 space-y-8">

      {/* Usage */}
      <Card className="glass">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  23 / 50 {t.documents.documentsUsed}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t.documents.monthlyQuota}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">54%</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{t.documents.used}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="space-y-4">
        {documents.map((doc) => (
          <Card key={doc.id} className="glass">
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
                      <Badge variant="outline" className="text-xs">
                        {doc.framework}
                      </Badge>
                      <span>•</span>
                      <span>{t.documents.uploaded} {doc.uploadedAt}</span>
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
                        {t.documents.compliance}
                      </p>
                    </div>
                  )}
                  <Badge
                    variant={doc.status === 'analyzed' ? 'success' : 'outline'}
                    className="text-xs"
                  >
                    {doc.status === 'analyzed' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    {doc.status === 'analyzed' ? t.documents.status.analyzed : t.documents.status.analyzing}
                  </Badge>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleView(doc.id, doc.name)}
                      title="View document"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDownload(doc.id, doc.name)}
                      title="Download document"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(doc.id, doc.name)}
                      title="Delete document"
                    >
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
    </>
  )
}

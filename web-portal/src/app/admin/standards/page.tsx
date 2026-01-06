'use client';

import { useState, useEffect } from 'react';
import { Plus, Upload, Link as LinkIcon, FileText, Trash2, RefreshCw, ExternalLink, CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface MarketplaceStandard {
  standard_id: string;
  name: string;
  description: string;
  category: string;
  jurisdiction?: string;
  version?: string;
  total_chunks: number;
  last_updated: string;
  official_url?: string;
  is_active: boolean;
}

interface CustomStandard {
  id: string;
  client_id: string;
  name: string;
  description: string;
  source_type: 'file' | 'url' | 'text';
  source: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_chunks: number;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
  error_message?: string;
}

export default function StandardsPage() {
  const [marketplaceStandards, setMarketplaceStandards] = useState<MarketplaceStandard[]>([]);
  const [customStandards, setCustomStandards] = useState<CustomStandard[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [sourceType, setSourceType] = useState<'file' | 'url' | 'text'>('file');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
    text: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadStandards();
  }, []);

  const loadStandards = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Load marketplace standards
      const marketplaceRes = await fetch(`${API_URL}/v1/admin/standards/marketplace`, { headers });
      if (marketplaceRes.ok) {
        const data = await marketplaceRes.json();
        setMarketplaceStandards(data.standards || []);
      }

      // Load custom standards
      const customRes = await fetch(`${API_URL}/v1/admin/standards/custom`, { headers });
      if (customRes.ok) {
        const data = await customRes.json();
        setCustomStandards(data.standards || []);
      }
    } catch (error) {
      console.error('Error loading standards:', error);
      toast.error('Erro ao carregar standards');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStandard = async () => {
    if (!formData.name || !formData.description) {
      toast.error('Nome e descrição são obrigatórios');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      let uploadedFilePath = '';

      // If file upload, upload first
      if (sourceType === 'file' && selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);

        const uploadRes = await fetch(`${API_URL}/v1/admin/standards/custom/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          throw new Error('Erro ao fazer upload do arquivo');
        }

        const uploadData = await uploadRes.json();
        uploadedFilePath = uploadData.file_path;
      }

      // Create standard
      const createPayload = {
        name: formData.name,
        description: formData.description,
        source_type: sourceType,
        source: sourceType === 'file' ? uploadedFilePath : sourceType === 'url' ? formData.url : formData.text,
        metadata: {},
      };

      const createRes = await fetch(`${API_URL}/v1/admin/standards/custom`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createPayload),
      });

      if (!createRes.ok) {
        throw new Error('Erro ao criar standard');
      }

      const createdStandard = await createRes.json();

      // Trigger ingestion
      const ingestRes = await fetch(`${API_URL}/v1/admin/standards/custom/${createdStandard.id}/ingest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!ingestRes.ok) {
        toast.warning('Standard criado, mas erro ao iniciar processamento');
      } else {
        toast.success('Standard criado e processamento iniciado!');
      }

      // Reset form
      setFormData({ name: '', description: '', url: '', text: '' });
      setSelectedFile(null);
      setCreateDialogOpen(false);

      // Reload standards
      await loadStandards();
    } catch (error) {
      console.error('Error creating standard:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao criar standard');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStandard = async (standardId: string) => {
    if (!confirm('Tem certeza que deseja deletar este standard?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/v1/admin/standards/custom/${standardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Erro ao deletar standard');
      }

      toast.success('Standard deletado com sucesso');
      await loadStandards();
    } catch (error) {
      console.error('Error deleting standard:', error);
      toast.error('Erro ao deletar standard');
    }
  };

  const handleRefreshStatus = async (standardId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/v1/admin/standards/custom/${standardId}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Erro ao atualizar status');
      }

      await loadStandards();
      toast.success('Status atualizado');
    } catch (error) {
      console.error('Error refreshing status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { icon: any; variant: 'default' | 'secondary' | 'destructive'; label: string; animate?: boolean; color?: string }> = {
      pending: { icon: Clock, variant: 'secondary', label: 'Pendente' },
      processing: { icon: RefreshCw, variant: 'default', label: 'Processando', animate: true },
      completed: { icon: CheckCircle2, variant: 'default', label: 'Completo', color: 'text-green-600' },
      failed: { icon: XCircle, variant: 'destructive', label: 'Falhou' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className={`h-3 w-3 ${config.animate ? 'animate-spin' : ''} ${config.color || ''}`} />
        {config.label}
      </Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    const categoryColors = {
      legal: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      security: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      quality: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      financial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };

    const color = categoryColors[category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800';

    return (
      <Badge variant="outline" className={color}>
        {category}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Standards</h1>
        <p className="text-muted-foreground">
          Gerencie standards do marketplace e standards customizados do seu cliente
        </p>
      </div>

      <Tabs defaultValue="marketplace" className="space-y-4">
        <TabsList>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="custom">Meus Standards</TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Standards do Marketplace</CardTitle>
              <CardDescription>
                Standards públicos disponíveis para todos os clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">Carregando standards...</p>
                </div>
              ) : marketplaceStandards.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">Nenhum standard disponível</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {marketplaceStandards.map((standard) => (
                    <Card key={standard.standard_id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <CardTitle className="text-base font-semibold">
                              {standard.name}
                            </CardTitle>
                            {standard.version && (
                              <Badge variant="outline" className="text-xs">
                                v{standard.version}
                              </Badge>
                            )}
                          </div>
                          {standard.is_active && (
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-1" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {standard.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {getCategoryBadge(standard.category)}
                          {standard.jurisdiction && (
                            <Badge variant="secondary">{standard.jurisdiction}</Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                          <span>{standard.total_chunks} chunks</span>
                          {standard.official_url && (
                            <a
                              href={standard.official_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:text-foreground transition-colors"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Oficial
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Standards Customizados</h3>
              <p className="text-sm text-muted-foreground">
                Standards privados do seu cliente
              </p>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Standard
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Standard Customizado</DialogTitle>
                  <DialogDescription>
                    Adicione um novo standard privado para seu cliente
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Estatuto da Empresa"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição *</Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva o propósito deste standard..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Fonte do Conteúdo</Label>
                    <Select value={sourceType} onValueChange={(v) => setSourceType(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="file">
                          <div className="flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            Upload de Arquivo
                          </div>
                        </SelectItem>
                        <SelectItem value="url">
                          <div className="flex items-center gap-2">
                            <LinkIcon className="h-4 w-4" />
                            URL
                          </div>
                        </SelectItem>
                        <SelectItem value="text">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Texto Direto
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {sourceType === 'file' && (
                    <div className="space-y-2">
                      <Label htmlFor="file">Arquivo</Label>
                      <Input
                        id="file"
                        type="file"
                        accept=".pdf,.txt,.md,.doc,.docx"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      />
                      {selectedFile && (
                        <p className="text-xs text-muted-foreground">
                          Selecionado: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </p>
                      )}
                    </div>
                  )}

                  {sourceType === 'url' && (
                    <div className="space-y-2">
                      <Label htmlFor="url">URL</Label>
                      <Input
                        id="url"
                        type="url"
                        placeholder="https://exemplo.com/documento.pdf"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      />
                    </div>
                  )}

                  {sourceType === 'text' && (
                    <div className="space-y-2">
                      <Label htmlFor="text">Conteúdo</Label>
                      <Textarea
                        id="text"
                        placeholder="Cole o conteúdo do standard aqui..."
                        value={formData.text}
                        onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                        rows={8}
                      />
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                    disabled={submitting}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateStandard} disabled={submitting}>
                    {submitting && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                    Criar e Processar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">Carregando standards...</p>
                </div>
              ) : customStandards.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Nenhum standard customizado</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Crie seu primeiro standard clicando em "Novo Standard"
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {customStandards.map((standard) => (
                    <Card key={standard.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start gap-3">
                              <div className="flex-1">
                                <h4 className="font-semibold">{standard.name}</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {standard.description}
                                </p>
                              </div>
                              {getStatusBadge(standard.status)}
                            </div>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                {standard.source_type === 'file' && <Upload className="h-3 w-3" />}
                                {standard.source_type === 'url' && <LinkIcon className="h-3 w-3" />}
                                {standard.source_type === 'text' && <FileText className="h-3 w-3" />}
                                {standard.source_type}
                              </span>
                              {standard.total_chunks > 0 && (
                                <span>{standard.total_chunks} chunks</span>
                              )}
                              <span>
                                Criado em {new Date(standard.created_at).toLocaleDateString('pt-BR')}
                              </span>
                            </div>

                            {standard.error_message && (
                              <div className="flex items-start gap-2 p-2 bg-destructive/10 rounded text-xs">
                                <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                                <span className="text-destructive">{standard.error_message}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRefreshStatus(standard.id)}
                              title="Atualizar status"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteStandard(standard.id)}
                              title="Deletar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

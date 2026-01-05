'use client'

import { useState } from 'react'
import { HelpCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface HelpDialogProps {
  title: string
  children: React.ReactNode
}

/**
 * HelpDialog - Reusable help button with modal
 * Add this to any page's PageHeader to provide contextual help
 */
export function HelpDialog({ title, children }: HelpDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <HelpCircle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
          <span className="sr-only">Ajuda</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Pre-defined help content for each admin page
 */
export const pageHelpContent = {
  overview: {
    title: "Ajuda - Overview",
    content: (
      <div className="space-y-4">
        <section>
          <h3 className="font-semibold text-lg">O que é esta página?</h3>
          <p className="text-muted-foreground">
            O Overview é o painel principal do n.process. Aqui você monitora a saúde 
            geral da plataforma em tempo real.
          </p>
        </section>
        
        <section>
          <h3 className="font-semibold text-lg">Métricas Exibidas</h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li><strong>API Calls (24h)</strong>: Total de requisições nas últimas 24 horas</li>
            <li><strong>Cost Today</strong>: Custo estimado do dia (FinOps)</li>
            <li><strong>Active API Keys</strong>: Chaves de API ativas no sistema</li>
            <li><strong>Uptime (30d)</strong>: Disponibilidade do serviço nos últimos 30 dias</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-lg">Ações Rápidas</h3>
          <p className="text-muted-foreground">
            Use os botões de ação rápida para criar API Keys, visualizar analytics, 
            gerar relatórios de custo ou verificar alertas do sistema.
          </p>
        </section>
      </div>
    )
  },

  apiKeys: {
    title: "Ajuda - API Keys",
    content: (
      <div className="space-y-4">
        <section>
          <h3 className="font-semibold text-lg">O que são API Keys?</h3>
          <p className="text-muted-foreground">
            API Keys são credenciais de acesso para consumir os endpoints do n.process. 
            Cada aplicação cliente deve ter sua própria chave.
          </p>
        </section>
        
        <section>
          <h3 className="font-semibold text-lg">Como criar uma API Key</h3>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Clique em "Create API Key"</li>
            <li>Defina um nome identificador (ex: "App Contratos - Prod")</li>
            <li>Configure o limite de requisições (rate limit)</li>
            <li>Copie a chave gerada (ela só será exibida uma vez!)</li>
          </ol>
        </section>

        <section>
          <h3 className="font-semibold text-lg">Boas Práticas</h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Use chaves diferentes para cada ambiente (dev/prod)</li>
            <li>Nunca exponha a chave em código frontend</li>
            <li>Revogue chaves comprometidas imediatamente</li>
          </ul>
        </section>
      </div>
    )
  },

  consumers: {
    title: "Ajuda - Consumers",
    content: (
      <div className="space-y-4">
        <section>
          <h3 className="font-semibold text-lg">O que são Consumers?</h3>
          <p className="text-muted-foreground">
            Consumers são as aplicações ou serviços que consomem a API do n.process. 
            Cada consumer tem suas próprias API Keys e métricas de uso.
          </p>
        </section>
        
        <section>
          <h3 className="font-semibold text-lg">Informações do Consumer</h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li><strong>Nome</strong>: Identificador da aplicação</li>
            <li><strong>API Keys</strong>: Chaves associadas a este consumer</li>
            <li><strong>Uso</strong>: Histórico de requisições e custos</li>
            <li><strong>Status</strong>: Ativo, Suspenso ou Bloqueado</li>
          </ul>
        </section>
      </div>
    )
  },

  finops: {
    title: "Ajuda - FinOps",
    content: (
      <div className="space-y-4">
        <section>
          <h3 className="font-semibold text-lg">O que é FinOps?</h3>
          <p className="text-muted-foreground">
            FinOps (Financial Operations) é a prática de gerenciar custos de cloud. 
            Esta página mostra o consumo de recursos e custos do n.process.
          </p>
        </section>
        
        <section>
          <h3 className="font-semibold text-lg">Métricas de Custo</h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li><strong>Vertex AI Embeddings</strong>: Custo de vetorização de texto</li>
            <li><strong>Gemini API</strong>: Custo de chamadas ao LLM</li>
            <li><strong>Firestore</strong>: Custo de leitura/escrita no banco</li>
            <li><strong>Cloud Run</strong>: Custo de execução da API</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-lg">Otimizações</h3>
          <p className="text-muted-foreground">
            O sistema usa Context Caching e Hash Check para reduzir custos. 
            Documentos já processados não são re-vetorizados.
          </p>
        </section>
      </div>
    )
  },

  settings: {
    title: "Ajuda - Settings",
    content: (
      <div className="space-y-4">
        <section>
          <h3 className="font-semibold text-lg">Configurações da Plataforma</h3>
          <p className="text-muted-foreground">
            Aqui você define configurações globais do n.process que afetam 
            todos os consumers e serviços.
          </p>
        </section>
        
        <section>
          <h3 className="font-semibold text-lg">Categorias</h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li><strong>General</strong>: Nome da plataforma, timezone, emails de contato</li>
            <li><strong>Limits</strong>: Rate limits globais, quotas de custo</li>
            <li><strong>Integrations</strong>: Webhooks, Slack, notificações</li>
            <li><strong>Security</strong>: Políticas de senha, MFA, logs de auditoria</li>
          </ul>
        </section>
      </div>
    )
  },

  developers: {
    title: "Ajuda - Developers",
    content: (
      <div className="space-y-4">
        <section>
          <h3 className="font-semibold text-lg">Portal do Desenvolvedor</h3>
          <p className="text-muted-foreground">
            Área dedicada a recursos técnicos para integração com o n.process.
          </p>
        </section>
        
        <section>
          <h3 className="font-semibold text-lg">Recursos Disponíveis</h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li><strong>Prompts</strong>: Templates de prompts para delegar tarefas a IAs</li>
            <li><strong>API Reference</strong>: Documentação OpenAPI/Swagger</li>
            <li><strong>SDKs</strong>: Bibliotecas cliente (Python, TypeScript)</li>
            <li><strong>Webhooks</strong>: Configuração de callbacks</li>
          </ul>
        </section>
      </div>
    )
  }
}

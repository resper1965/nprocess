#!/bin/bash

# Fase 1: Script para solicitar aumento de quotas
# Este script gera os comandos e links para solicitar quotas
# Usage: ./scripts/fase1-solicitar-quotas.sh

set -e

PROJECT_ID="nprocess-prod"

echo "📊 Quotas Necessárias para Produção"
echo "Projeto: $PROJECT_ID"
echo ""
echo "⚠️  NOTA: As solicitações de quota devem ser feitas via Console do GCP"
echo "   Link: https://console.cloud.google.com/iam-admin/quotas?project=$PROJECT_ID"
echo ""

echo "📋 Quotas a Solicitar:"
echo ""

echo "1. Cloud Run - CPU"
echo "   Métrica: cloud-run-cpu"
echo "   Limite Atual: [VERIFICAR]"
echo "   Limite Necessário: 200 CPUs"
echo "   Link: https://console.cloud.google.com/iam-admin/quotas?project=$PROJECT_ID&service=run.googleapis.com&metric=cloud-run-cpu"
echo ""

echo "2. Cloud Run - Memory"
echo "   Métrica: cloud-run-memory"
echo "   Limite Atual: [VERIFICAR]"
echo "   Limite Necessário: 200 GB"
echo "   Link: https://console.cloud.google.com/iam-admin/quotas?project=$PROJECT_ID&service=run.googleapis.com&metric=cloud-run-memory"
echo ""

echo "3. Cloud Run - Instances"
echo "   Métrica: cloud-run-instances"
echo "   Limite Atual: [VERIFICAR]"
echo "   Limite Necessário: 30 instâncias"
echo "   Link: https://console.cloud.google.com/iam-admin/quotas?project=$PROJECT_ID&service=run.googleapis.com&metric=cloud-run-instances"
echo ""

echo "4. Vertex AI - API Requests"
echo "   Métrica: aiplatform.googleapis.com/request_count"
echo "   Limite Atual: [VERIFICAR]"
echo "   Limite Necessário: 1000 requests/minuto"
echo "   Link: https://console.cloud.google.com/iam-admin/quotas?project=$PROJECT_ID&service=aiplatform.googleapis.com"
echo ""

echo "5. Cloud SQL - Connections"
echo "   Métrica: cloudsql.googleapis.com/database_instances"
echo "   Limite Atual: [VERIFICAR]"
echo "   Limite Necessário: 200 conexões"
echo "   Link: https://console.cloud.google.com/iam-admin/quotas?project=$PROJECT_ID&service=sqladmin.googleapis.com"
echo ""

echo "6. Firestore - Reads"
echo "   Métrica: firestore.googleapis.com/document_read_requests"
echo "   Limite Atual: [VERIFICAR]"
echo "   Limite Necessário: 10000 reads/dia"
echo "   Link: https://console.cloud.google.com/iam-admin/quotas?project=$PROJECT_ID&service=firestore.googleapis.com"
echo ""

echo "7. Firestore - Writes"
echo "   Métrica: firestore.googleapis.com/document_write_requests"
echo "   Limite Atual: [VERIFICAR]"
echo "   Limite Necessário: 5000 writes/dia"
echo "   Link: https://console.cloud.google.com/iam-admin/quotas?project=$PROJECT_ID&service=firestore.googleapis.com"
echo ""

echo "✅ Para solicitar aumentos:"
echo "   1. Acessar os links acima"
echo "   2. Clicar em 'EDIT QUOTAS'"
echo "   3. Preencher formulário com justificativa"
echo "   4. Aguardar aprovação (pode levar 1-2 dias úteis)"
echo ""

echo "📝 Justificativa Sugerida:"
echo "   'Solicitando aumento de quota para ambiente de produção do Process & Compliance Engine. "
echo "   O sistema requer recursos adicionais para suportar carga esperada de usuários e processamento "
echo "   de análises de compliance usando Vertex AI (Gemini).'"


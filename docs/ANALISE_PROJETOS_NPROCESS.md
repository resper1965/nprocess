# 📊 Análise de Projetos "nprocess*" no GCP

**Data**: 06 de Janeiro de 2026  
**Análise**: Projetos com "nprocess" no nome

---

## ✅ Projetos Encontrados

### 1. `nprocess-8e801` (Firebase)

- **Project ID**: `nprocess-8e801`
- **Nome**: `nprocess`
- **Project Number**: `43006907338`
- **Status**: `ACTIVE`
- **Tipo**: Projeto Firebase
- **Criado**: (data não disponível)

#### Uso Atual:
- ✅ **Client Portal** (Firebase Hosting)
- ✅ **Firebase Authentication**
- ✅ **Firestore Database**
- ✅ **Firebase Storage**

#### URLs:
- Hosting: https://nprocess-8e801-4711d.web.app
- Custom Domain: https://nprocess.ness.com.br

#### Status: ⚠️ **EM USO ATIVO - NÃO DELETAR**

---

### 2. `nprocess-prod` (GCP Production)

- **Project ID**: `nprocess-prod`
- **Nome**: `nProcess Production`
- **Project Number**: `905989981186`
- **Status**: `ACTIVE`
- **Tipo**: Projeto GCP de Produção
- **Criado**: 2025-12-27T19:27:34.553311Z

#### Uso Atual:
- ✅ **Cloud Run Services** (3 serviços ativos):
  - `nprocess-api-prod` - https://nprocess-api-prod-fur76izi3a-uc.a.run.app
  - `nprocess-admin-api-prod` - https://nprocess-admin-api-prod-fur76izi3a-uc.a.run.app
  - `nprocess-frontend-prod` - https://nprocess-frontend-prod-fur76izi3a-uc.a.run.app
- ✅ **Cloud SQL** (instâncias de banco de dados)
- ✅ **Secret Manager** (secrets de produção)
- ✅ **Cloud Storage** (buckets de documentos)
- ✅ **Firestore** (banco de dados NoSQL)

#### Status: ⚠️ **EM USO ATIVO - NÃO DELETAR**

---

## 📋 Conclusão

**Total de projetos encontrados**: 2  
**Projetos ativos**: 2  
**Projetos inativos**: 0  
**Projetos para deletar**: 0

### ⚠️ Importante

**NENHUM PROJETO DEVE SER DELETADO** pois ambos estão sendo usados ativamente:

1. **`nprocess-8e801`**: Projeto Firebase que hospeda o Client Portal
2. **`nprocess-prod`**: Projeto GCP que hospeda as APIs e serviços de backend

Deletar qualquer um desses projetos causaria:
- ❌ Interrupção completa dos serviços
- ❌ Perda de dados
- ❌ Perda de configurações
- ❌ Necessidade de recriar tudo do zero

---

## 🔍 Como Verificar Projetos

```bash
# Listar todos os projetos com "nprocess" no nome
gcloud projects list --format="table(projectId,name,projectNumber,lifecycleState)" | grep -i nprocess

# Ver detalhes de um projeto específico
gcloud projects describe nprocess-8e801
gcloud projects describe nprocess-prod

# Verificar recursos em um projeto
gcloud run services list --project=nprocess-prod
gcloud sql instances list --project=nprocess-prod
```

---

## 🗑️ Como Deletar um Projeto (SE NECESSÁRIO)

⚠️ **ATENÇÃO**: Deletar um projeto é **IRREVERSÍVEL** e remove **TODOS** os recursos!

```bash
# 1. Primeiro, desabilitar o projeto (30 dias de graça antes de deletar)
gcloud projects delete nprocess-prod --project=nprocess-prod

# 2. Para restaurar dentro de 30 dias
gcloud projects undelete nprocess-prod

# 3. Após 30 dias, o projeto é deletado permanentemente
```

---

**Última Atualização**: 06 de Janeiro de 2026

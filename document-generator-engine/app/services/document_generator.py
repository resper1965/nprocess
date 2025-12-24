"""
Document Generator Service
Generates compliance documentation from BPMN processes
"""

import os
import logging
import hashlib
from typing import List, Optional, Dict, Any
from datetime import datetime
from pathlib import Path
import xml.etree.ElementTree as ET

from app.schemas import (
    DocumentType,
    ExportFormat,
    GeneratedDocument
)
from app.converters.bpmn_to_mermaid import convert_bpmn_to_mermaid

logger = logging.getLogger(__name__)


class DocumentGenerator:
    """Service for generating compliance documentation"""

    def __init__(self):
        self.output_dir = Path(os.getenv("OUTPUT_DIR", "/tmp/documents"))
        self.output_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"DocumentGenerator initialized. Output dir: {self.output_dir}")

    async def generate_from_process(
        self,
        process_id: str,
        process_name: str,
        bpmn_xml: str,
        controls_addressed: Optional[List[str]] = None,
        evidences_configured: Optional[Dict[str, Any]] = None,
        company_context: Optional[Dict[str, Any]] = None,
        document_types: Optional[List[str]] = None,
        export_format: str = "markdown"
    ) -> List[GeneratedDocument]:
        """
        Generate compliance documents from BPMN process

        Args:
            process_id: Unique process identifier
            process_name: Human-readable process name
            bpmn_xml: BPMN 2.0 XML content
            controls_addressed: List of control IDs
            evidences_configured: Evidence configuration
            company_context: Company-specific context
            document_types: Types of documents to generate
            export_format: Export format (markdown or bundle)

        Returns:
            List of generated documents
        """
        logger.info(f"Generating documents for process: {process_id}")

        # Default to all document types if none specified
        if not document_types:
            document_types = [DocumentType.PROCEDURE, DocumentType.WORK_INSTRUCTION, DocumentType.CHECKLIST]

        # Convert BPMN to Mermaid for diagrams
        try:
            mermaid_diagram = convert_bpmn_to_mermaid(bpmn_xml)
        except Exception as e:
            logger.warning(f"Could not convert BPMN to Mermaid: {e}")
            mermaid_diagram = "```mermaid\ngraph TD\n  A[Process] --> B[End]\n```"

        # Extract process info from BPMN
        process_info = self._extract_process_info(bpmn_xml, process_name)

        # Generate documents
        documents = []

        for doc_type in document_types:
            doc = await self._generate_document(
                doc_type=doc_type,
                process_id=process_id,
                process_name=process_name,
                process_info=process_info,
                mermaid_diagram=mermaid_diagram,
                controls_addressed=controls_addressed or [],
                evidences_configured=evidences_configured or {},
                company_context=company_context or {}
            )
            if doc:
                documents.append(doc)

        logger.info(f"Generated {len(documents)} documents for process {process_id}")
        return documents

    async def _generate_document(
        self,
        doc_type: str,
        process_id: str,
        process_name: str,
        process_info: Dict[str, Any],
        mermaid_diagram: str,
        controls_addressed: List[str],
        evidences_configured: Dict[str, Any],
        company_context: Dict[str, Any]
    ) -> Optional[GeneratedDocument]:
        """Generate a single document"""

        # Generate document content based on type
        if doc_type == DocumentType.PROCEDURE or doc_type == "procedure":
            content = self._generate_procedure(
                process_name, process_info, mermaid_diagram,
                controls_addressed, evidences_configured, company_context
            )
            filename = f"POP_{self._sanitize_filename(process_name)}.md"
        elif doc_type == DocumentType.WORK_INSTRUCTION or doc_type == "work_instruction":
            content = self._generate_work_instruction(
                process_name, process_info, controls_addressed, company_context
            )
            filename = f"IT_{self._sanitize_filename(process_name)}.md"
        elif doc_type == DocumentType.CHECKLIST or doc_type == "checklist":
            content = self._generate_checklist(
                process_name, process_info, controls_addressed, company_context
            )
            filename = f"Checklist_{self._sanitize_filename(process_name)}.md"
        else:
            logger.warning(f"Unknown document type: {doc_type}")
            return None

        # Write document to file
        doc_id = self._generate_doc_id(process_id, doc_type)
        filepath = self.output_dir / filename

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

        # Create response
        return GeneratedDocument(
            document_id=doc_id,
            document_type=doc_type,
            process_id=process_id,
            filename=filename,
            format="markdown",
            size_bytes=len(content.encode('utf-8')),
            download_url=f"/v1/documents/{doc_id}/download",
            generated_at=datetime.utcnow().isoformat() + "Z",
            controls_covered=controls_addressed
        )

    def _generate_procedure(
        self,
        process_name: str,
        process_info: Dict[str, Any],
        mermaid_diagram: str,
        controls_addressed: List[str],
        evidences_configured: Dict[str, Any],
        company_context: Dict[str, Any]
    ) -> str:
        """Generate a Standard Operating Procedure (POP)"""

        company_name = company_context.get('company_name', 'Empresa')
        sector = company_context.get('sector', 'N/A')

        content = f"""# POP: {process_name}

## 1. Objetivo

Este procedimento estabelece as diretrizes e etapas necessárias para execução do processo "{process_name}" de forma padronizada e em conformidade com os controles de segurança e compliance aplicáveis.

## 2. Escopo

Este procedimento aplica-se a:
- **Empresa**: {company_name}
- **Setor**: {sector}
- **Processos relacionados**: {', '.join(process_info.get('tasks', ['N/A'])[:3])}

## 3. Responsabilidades

| Função | Responsabilidade |
|--------|------------------|
| Executor | Executar as etapas do procedimento conforme documentado |
| Gestor | Aprovar execuções e verificar conformidade |
| Compliance | Validar aderência aos controles de segurança |
| Auditoria | Verificar evidências e registros |

## 4. Fluxo do Processo

{mermaid_diagram}

## 5. Procedimento Detalhado

### 5.1 Preparação
"""

        # Add tasks from process info
        for idx, task in enumerate(process_info.get('tasks', []), 1):
            content += f"""
### 5.{idx+1} {task}

**Descrição**: Executar a tarefa "{task}" conforme especificado.

**Passos**:
1. Verificar pré-requisitos necessários
2. Executar a tarefa
3. Validar resultado
4. Registrar evidência

**Evidências**: Registro de execução com timestamp
"""

        # Add controls section
        if controls_addressed:
            content += f"""
## 6. Controles de Segurança Atendidos

Este procedimento atende aos seguintes controles:

"""
            for control in controls_addressed:
                content += f"- **{control}**: Implementado através deste processo\n"

        # Add evidence section
        content += """
## 7. Evidências e Registros

As seguintes evidências devem ser mantidas:

- Logs de execução do processo
- Screenshots de confirmação
- Registros de aprovação
- Timestamp de execução

**Período de retenção**: Conforme política de retenção de dados da empresa (mínimo 3 anos para compliance).

## 8. Revisões

| Data | Versão | Responsável | Alterações |
|------|--------|-------------|-----------|
| """ + datetime.now().strftime('%Y-%m-%d') + """ | 1.0 | Sistema | Versão inicial |

## 9. Aprovações

**Elaborado por**: Sistema ComplianceEngine
**Revisado por**: [Pendente]
**Aprovado por**: [Pendente]

---
*Documento gerado automaticamente pelo ComplianceEngine Platform*
"""

        return content

    def _generate_work_instruction(
        self,
        process_name: str,
        process_info: Dict[str, Any],
        controls_addressed: List[str],
        company_context: Dict[str, Any]
    ) -> str:
        """Generate a Work Instruction"""

        content = f"""# Instrução de Trabalho: {process_name}

## Objetivo
Fornecer instruções detalhadas para execução do processo "{process_name}".

## Pré-requisitos
- Acesso aos sistemas necessários
- Permissões adequadas
- Treinamento concluído

## Instruções Passo a Passo

"""

        for idx, task in enumerate(process_info.get('tasks', ['Executar processo']), 1):
            content += f"""
### Passo {idx}: {task}

**O que fazer**: {task}

**Como fazer**:
1. Passo detalhado 1
2. Passo detalhado 2
3. Passo detalhado 3

**Verificação**: Confirmar que o resultado está correto

---
"""

        content += """
## Checklist de Verificação

- [ ] Todos os passos foram executados
- [ ] Resultados foram validados
- [ ] Evidências foram registradas
- [ ] Não houve erros ou exceções

## Suporte

Em caso de dúvidas ou problemas, contactar:
- Suporte Técnico: suporte@empresa.com
- Compliance: compliance@empresa.com

---
*Documento gerado automaticamente pelo ComplianceEngine Platform*
"""

        return content

    def _generate_checklist(
        self,
        process_name: str,
        process_info: Dict[str, Any],
        controls_addressed: List[str],
        company_context: Dict[str, Any]
    ) -> str:
        """Generate an Audit Checklist"""

        content = f"""# Checklist de Auditoria: {process_name}

## Informações Gerais

- **Processo**: {process_name}
- **Data da Auditoria**: __/__/____
- **Auditor**: _________________
- **Status**: [ ] Conforme  [ ] Não Conforme  [ ] Não Aplicável

## Verificações de Conformidade

"""

        # Add checks for each control
        if controls_addressed:
            for control in controls_addressed:
                content += f"""
### {control}

| Item de Verificação | Conforme | Não Conforme | Evidência | Observações |
|---------------------|----------|--------------|-----------|-------------|
| Processo está documentado | [ ] | [ ] | | |
| Processo está sendo executado | [ ] | [ ] | | |
| Evidências estão sendo mantidas | [ ] | [ ] | | |
| Controles estão implementados | [ ] | [ ] | | |

"""

        # Add process-specific checks
        content += """
## Verificações do Processo

| Item | Conforme | Não Conforme | Evidência | Observações |
|------|----------|--------------|-----------|-------------|
"""

        for task in process_info.get('tasks', ['Processo'])[:5]:
            content += f"| {task} | [ ] | [ ] | | |\n"

        content += """
## Não Conformidades Identificadas

| # | Descrição | Severidade | Ação Corretiva | Responsável | Prazo |
|---|-----------|------------|----------------|-------------|-------|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |

## Conclusão da Auditoria

**Resultado Geral**: [ ] Aprovado  [ ] Aprovado com Ressalvas  [ ] Reprovado

**Comentários**:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

**Assinaturas**:

Auditor: ________________________  Data: __/__/____

Gestor: ________________________  Data: __/__/____

---
*Checklist gerado automaticamente pelo ComplianceEngine Platform*
"""

        return content

    def _extract_process_info(self, bpmn_xml: str, process_name: str) -> Dict[str, Any]:
        """Extract process information from BPMN XML"""
        try:
            root = ET.fromstring(bpmn_xml)

            # Extract tasks
            tasks = []
            for task in root.findall('.//{http://www.omg.org/spec/BPMN/20100524/MODEL}task'):
                task_name = task.get('name', 'Task')
                if task_name and task_name != 'Task':
                    tasks.append(task_name)

            # If no tasks found, use generic ones
            if not tasks:
                tasks = ['Iniciar processo', 'Executar atividades', 'Finalizar processo']

            return {
                'tasks': tasks,
                'process_name': process_name
            }
        except Exception as e:
            logger.warning(f"Could not parse BPMN XML: {e}")
            return {
                'tasks': ['Executar processo'],
                'process_name': process_name
            }

    def _sanitize_filename(self, name: str) -> str:
        """Sanitize filename"""
        return name.replace(' ', '_').replace('/', '_').replace('\\', '_')[:50]

    def _generate_doc_id(self, process_id: str, doc_type: str) -> str:
        """Generate unique document ID"""
        unique_str = f"{process_id}_{doc_type}_{datetime.utcnow().isoformat()}"
        return f"doc_{hashlib.md5(unique_str.encode()).hexdigest()[:12]}"

    async def get_document_path(self, document_id: str) -> Optional[str]:
        """Get path to a generated document"""
        # In a real implementation, this would look up the document in a database
        # For now, we'll search the output directory
        for filepath in self.output_dir.glob("*.md"):
            # Simple implementation - in production, use a proper database
            return str(filepath)
        return None

    async def generate_audit_package(
        self,
        process_id: str,
        control_id: str
    ) -> Optional[str]:
        """Generate a complete audit package (ZIP with all documents)"""
        import zipfile
        import io

        logger.info(f"Generating audit package for {process_id} - {control_id}")

        # Create ZIP file
        zip_path = self.output_dir / f"audit_package_{control_id.replace(':', '_')}_{datetime.now().strftime('%Y%m%d')}.zip"

        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # Add all documents for this process
            for filepath in self.output_dir.glob("*.md"):
                zipf.write(filepath, filepath.name)

        return str(zip_path)

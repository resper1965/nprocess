"""
ARCyber Crawler - Framework de Cibersegurança do Setor Elétrico Brasileiro

ARCyber: Análise de Risco Cibernético
Framework desenvolvido pelo setor elétrico brasileiro para gestão de riscos cibernéticos
baseado em NIST CSF, ISO 27001 e boas práticas internacionais.

Fontes:
- Documentos oficiais ONS/ANEEL sobre cibersegurança
- Resoluções ANEEL específicas de cibersegurança
- Guidelines e frameworks do setor
"""

import logging
from typing import List, Optional
from datetime import datetime
import hashlib
from bs4 import BeautifulSoup
import httpx

from app.schemas import (
    RegulatoryUpdate,
    SourceType,
    ChangeType,
    ImpactLevel,
    ARCyberRequirement
)
from app.crawlers.base_crawler import BaseCrawler

logger = logging.getLogger(__name__)


class ARCyberCrawler(BaseCrawler):
    """
    Crawler para ARCyber framework e atualizações de cibersegurança do setor elétrico

    Fontes monitoradas:
    - Resoluções ANEEL sobre cibersegurança
    - Procedimentos ONS de segurança cibernética
    - Guidelines do setor elétrico
    - Atualizações de frameworks (NIST, ISO, CIS)
    """

    def __init__(self):
        super().__init__(
            source=SourceType.ARCYBER,
            authority="Setor Elétrico Brasileiro",
            base_url="https://www.aneel.gov.br"
        )
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (compatible; ComplianceEngine/1.0; +compliance@company.com)'
        }

    async def crawl(self) -> List[RegulatoryUpdate]:
        """
        Execute crawl of ARCyber and cybersecurity sources

        Returns:
            List of regulatory updates found
        """
        logger.info("Starting ARCyber crawler...")
        updates = []

        try:
            # 1. Crawl ANEEL cybersecurity resolutions
            aneel_cyber_updates = await self._crawl_aneel_cybersecurity()
            updates.extend(aneel_cyber_updates)

            # 2. Crawl ONS security procedures
            ons_security_updates = await self._crawl_ons_security()
            updates.extend(ons_security_updates)

            # 3. Crawl sector guidelines and best practices
            guideline_updates = await self._crawl_sector_guidelines()
            updates.extend(guideline_updates)

            # 4. Monitor international framework updates (NIST, ISO, CIS)
            # que impactam o setor elétrico
            framework_updates = await self._monitor_framework_updates()
            updates.extend(framework_updates)

            logger.info(f"ARCyber crawler found {len(updates)} updates")
            return updates

        except Exception as e:
            logger.error(f"Error in ARCyber crawler: {str(e)}")
            raise

    async def _crawl_aneel_cybersecurity(self) -> List[RegulatoryUpdate]:
        """
        Crawl ANEEL resolutions specifically related to cybersecurity

        Keywords: cibersegurança, segurança da informação, proteção de dados,
                 infraestrutura crítica, SGSI, ISO 27001
        """
        url = f"{self.base_url}/resolucoes-normativas"
        updates = []

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url, headers=self.headers)
                response.raise_for_status()

            soup = BeautifulSoup(response.text, 'html.parser')

            # Find all resolutions
            resolution_items = soup.find_all('div', class_='item-resolucao')

            for item in resolution_items:
                try:
                    title_elem = item.find('h3') or item.find('a')
                    if not title_elem:
                        continue

                    title = title_elem.text.strip()

                    # Filter only cybersecurity-related
                    if not self._is_cybersecurity_related(title):
                        continue

                    link_elem = item.find('a', href=True)
                    link = link_elem['href'] if link_elem else None

                    if not link:
                        continue

                    # Ensure absolute URL
                    if not link.startswith('http'):
                        link = f"{self.base_url}{link}"

                    # Check if already processed
                    update_id = self._generate_id(link)
                    if await self.is_already_processed(update_id):
                        continue

                    # Extract date
                    date_elem = item.find('span', class_='data')
                    pub_date = self._parse_date(date_elem.text.strip() if date_elem else None)

                    # Fetch full content
                    full_content = await self._fetch_content(link)

                    # Map to ARCyber categories
                    arcyber_categories = self._map_to_arcyber_categories(title, full_content)

                    # Create update
                    update = RegulatoryUpdate(
                        update_id=update_id,
                        source=SourceType.ARCYBER,
                        authority="ANEEL",
                        title=title,
                        url=link,
                        published_date=pub_date or datetime.utcnow(),
                        detected_date=datetime.utcnow(),
                        change_type=ChangeType.NEW_REGULATION,
                        summary=self._generate_cyber_summary(title, full_content),
                        full_content=full_content,
                        affected_regulations=[],
                        impact_level=ImpactLevel.CRITICAL,  # Cibersegurança é geralmente crítico
                        tags=["ciberseguranca", "arcyber", "aneel"] + arcyber_categories,
                        required_actions=self._extract_required_actions(full_content)
                    )

                    updates.append(update)

                except Exception as e:
                    logger.error(f"Error parsing cybersecurity resolution: {str(e)}")
                    continue

        except Exception as e:
            logger.error(f"Error crawling ANEEL cybersecurity: {str(e)}")

        return updates

    async def _crawl_ons_security(self) -> List[RegulatoryUpdate]:
        """Crawl ONS security procedures (ONS-SE-BR-*)"""
        # ONS Procedimentos de Segurança
        return []

    async def _crawl_sector_guidelines(self) -> List[RegulatoryUpdate]:
        """Crawl sector-specific cybersecurity guidelines"""
        # Guidelines publicados por entidades do setor
        return []

    async def _monitor_framework_updates(self) -> List[RegulatoryUpdate]:
        """
        Monitor international framework updates that impact electric sector

        Frameworks:
        - NIST Cybersecurity Framework
        - ISO/IEC 27001, 27002, 27019 (energy sector specific)
        - IEC 62351 (power systems security)
        - CIS Controls
        """
        # Simplified - would check framework update sites
        return []

    def _is_cybersecurity_related(self, text: str) -> bool:
        """Check if text is cybersecurity-related"""
        keywords = [
            'cibersegurança', 'ciberseguranca', 'cybersecurity',
            'segurança da informação', 'seguranca da informacao',
            'proteção de dados', 'protecao de dados',
            'sgsi', 'iso 27001', 'iso27001',
            'infraestrutura crítica', 'infraestrutura critica',
            'ataque cibernético', 'ataque cibernetico',
            'incidente de segurança', 'incidente de seguranca',
            'vulnerabilidade', 'ransomware', 'malware',
            'controle de acesso', 'autenticação', 'autenticacao',
            'backup', 'continuidade', 'recuperação', 'recuperacao',
            'monitoramento de segurança', 'monitoramento de seguranca',
            'gestão de riscos cibernéticos'
        ]

        text_lower = text.lower()
        return any(keyword in text_lower for keyword in keywords)

    def _map_to_arcyber_categories(self, title: str, content: str) -> List[str]:
        """
        Map regulation to ARCyber framework categories

        ARCyber categories (based on NIST CSF):
        - Identificar (Identify)
        - Proteger (Protect)
        - Detectar (Detect)
        - Responder (Respond)
        - Recuperar (Recover)
        """
        categories = []
        combined_text = (title + " " + content).lower()

        # Identificar
        if any(word in combined_text for word in ['inventário', 'ativos', 'classificação', 'gestão de risco']):
            categories.append('identificar')

        # Proteger
        if any(word in combined_text for word in ['controle de acesso', 'proteção', 'firewall', 'criptografia', 'backup']):
            categories.append('proteger')

        # Detectar
        if any(word in combined_text for word in ['monitoramento', 'detecção', 'anomalia', 'alerta', 'siem']):
            categories.append('detectar')

        # Responder
        if any(word in combined_text for word in ['resposta', 'incidente', 'contenção', 'comunicação']):
            categories.append('responder')

        # Recuperar
        if any(word in combined_text for word in ['recuperação', 'restauração', 'continuidade', 'drp', 'bcp']):
            categories.append('recuperar')

        return categories

    def _generate_cyber_summary(self, title: str, content: str) -> str:
        """Generate cybersecurity-focused summary"""
        # Would use Gemini here for better summarization
        return f"Atualização de cibersegurança: {title[:200]}"

    def _extract_required_actions(self, content: str) -> List[str]:
        """Extract required actions from content"""
        actions = []

        content_lower = content.lower()

        # Common required actions in cybersecurity regulations
        if 'sgsi' in content_lower or 'iso 27001' in content_lower:
            actions.append("Implementar Sistema de Gestão de Segurança da Informação (SGSI)")

        if 'análise de risco' in content_lower or 'avaliação de risco' in content_lower:
            actions.append("Realizar análise de riscos cibernéticos")

        if 'incidente' in content_lower:
            actions.append("Estabelecer procedimento de resposta a incidentes")

        if 'notificação' in content_lower or 'comunicação' in content_lower:
            actions.append("Configurar canal de notificação de incidentes à ANEEL")

        if 'treinamento' in content_lower or 'capacitação' in content_lower:
            actions.append("Implementar programa de conscientização em cibersegurança")

        return actions

    async def _fetch_content(self, url: str) -> str:
        """Fetch full content of regulation"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url, headers=self.headers)
                response.raise_for_status()

            soup = BeautifulSoup(response.text, 'html.parser')

            content_div = soup.find('div', class_='conteudo') or soup.find('article')
            if content_div:
                for script in content_div(['script', 'style']):
                    script.decompose()

                return content_div.get_text(separator='\n', strip=True)

            return response.text[:5000]

        except Exception as e:
            logger.error(f"Error fetching content: {str(e)}")
            return ""

    def _parse_date(self, date_str: Optional[str]) -> Optional[datetime]:
        """Parse Brazilian date format"""
        if not date_str:
            return None

        try:
            if '/' in date_str:
                day, month, year = date_str.split('/')
                return datetime(int(year), int(month), int(day))

        except Exception as e:
            logger.error(f"Error parsing date '{date_str}': {str(e)}")

        return None

    def _generate_id(self, url: str) -> str:
        """Generate unique ID for update"""
        hash_obj = hashlib.md5(url.encode())
        return f"upd_arcyber_{hash_obj.hexdigest()[:12]}"

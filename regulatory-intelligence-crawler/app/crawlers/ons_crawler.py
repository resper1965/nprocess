"""
ONS Crawler - Operador Nacional do Sistema Elétrico
Monitora Procedimentos de Rede (PdR), submódulos e instruções operacionais
"""

import logging
from typing import List, Optional
from datetime import datetime
import hashlib
import re
from bs4 import BeautifulSoup
import httpx

from app.schemas import (
    RegulatoryUpdate,
    SourceType,
    ChangeType,
    ImpactLevel,
    ONSProcedure
)
from app.crawlers.base_crawler import BaseCrawler

logger = logging.getLogger(__name__)


class ONSCrawler(BaseCrawler):
    """
    Crawler para ONS (Operador Nacional do Sistema Elétrico)

    Fontes monitoradas:
    - http://www.ons.org.br/paginas/sobre-o-ons/procedimentos-de-rede
    - http://www.ons.org.br/paginas/sobre-o-ons/legislacao-e-regulamentacao
    - http://www.ons.org.br/paginas/noticias
    """

    def __init__(self):
        super().__init__(
            source=SourceType.ONS,
            authority="ONS",
            base_url="http://www.ons.org.br"
        )
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (compatible; ComplianceEngine/1.0; +compliance@company.com)'
        }

    async def crawl(self) -> List[RegulatoryUpdate]:
        """
        Execute crawl of ONS sources

        Returns:
            List of regulatory updates found
        """
        logger.info("Starting ONS crawler...")
        updates = []

        try:
            # 1. Crawl Procedimentos de Rede
            procedure_updates = await self._crawl_procedures()
            updates.extend(procedure_updates)

            # 2. Crawl Submódulos
            submodule_updates = await self._crawl_submodules()
            updates.extend(submodule_updates)

            # 3. Crawl Instruções Operacionais
            instruction_updates = await self._crawl_operational_instructions()
            updates.extend(instruction_updates)

            # 4. Crawl Notícias (filtrar por alterações regulatórias)
            news_updates = await self._crawl_news()
            updates.extend(news_updates)

            logger.info(f"ONS crawler found {len(updates)} updates")
            return updates

        except Exception as e:
            logger.error(f"Error in ONS crawler: {str(e)}")
            raise

    async def _crawl_procedures(self) -> List[RegulatoryUpdate]:
        """
        Crawl Procedimentos de Rede (PdR)

        Procedimentos de Rede são documentos técnicos que estabelecem:
        - Critérios e requisitos técnicos
        - Responsabilidades
        - Condições e instalações da Rede Básica
        """
        url = f"{self.base_url}/paginas/sobre-o-ons/procedimentos-de-rede"
        updates = []

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url, headers=self.headers)
                response.raise_for_status()

            soup = BeautifulSoup(response.text, 'html.parser')

            # Find procedure entries
            # Procedimentos geralmente estão organizados por módulos
            procedure_items = soup.find_all('div', class_='procedimento-item') or \
                            soup.find_all('tr', class_='procedimento')

            for item in procedure_items[:30]:  # Últimos 30
                try:
                    # Extract procedure metadata
                    code_elem = item.find('td', class_='codigo') or item.find('span', class_='codigo')
                    title_elem = item.find('td', class_='titulo') or item.find('a')
                    version_elem = item.find('td', class_='versao')
                    date_elem = item.find('td', class_='data')

                    if not code_elem or not title_elem:
                        continue

                    code = code_elem.text.strip()
                    title = title_elem.text.strip()
                    version = version_elem.text.strip() if version_elem else "N/A"
                    date_str = date_elem.text.strip() if date_elem else None

                    # Get PDF link
                    link_elem = item.find('a', href=True)
                    link = link_elem['href'] if link_elem else None

                    if not link:
                        continue

                    # Ensure absolute URL
                    if not link.startswith('http'):
                        link = f"{self.base_url}{link}"

                    # Parse date
                    pub_date = self._parse_date(date_str)

                    # Check if already processed
                    update_id = self._generate_id(link)
                    if await self.is_already_processed(update_id):
                        continue

                    # Determine category from code
                    category = self._determine_procedure_category(code)

                    # Create update
                    update = RegulatoryUpdate(
                        update_id=update_id,
                        source=SourceType.ONS,
                        authority="ONS",
                        title=f"{code} - {title}",
                        url=link,
                        published_date=pub_date or datetime.utcnow(),
                        detected_date=datetime.utcnow(),
                        change_type=ChangeType.NEW_REGULATION if 'Nova versão' in version else ChangeType.AMENDMENT,
                        summary=f"Procedimento de Rede {code} versão {version} - {title}",
                        full_content="",  # PDF content extraction seria feito aqui
                        affected_regulations=[],
                        impact_level=self._assess_procedure_impact(category),
                        tags=["procedimento_rede", "ons", category],
                        attachments=[{
                            "type": "pdf",
                            "url": link,
                            "description": f"Procedimento {code} versão {version}"
                        }]
                    )

                    updates.append(update)

                except Exception as e:
                    logger.error(f"Error parsing procedure item: {str(e)}")
                    continue

        except Exception as e:
            logger.error(f"Error crawling ONS procedures: {str(e)}")

        return updates

    async def _crawl_submodules(self) -> List[RegulatoryUpdate]:
        """
        Crawl Submódulos dos Procedimentos de Rede

        Submódulos são subdivisões dos procedimentos principais
        """
        # Similar structure to procedures
        return []

    async def _crawl_operational_instructions(self) -> List[RegulatoryUpdate]:
        """Crawl Instruções Operacionais (IO)"""
        # Instruções operacionais são documentos mais específicos
        return []

    async def _crawl_news(self) -> List[RegulatoryUpdate]:
        """Crawl news section for regulatory announcements"""
        url = f"{self.base_url}/paginas/noticias"
        updates = []

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url, headers=self.headers)
                response.raise_for_status()

            soup = BeautifulSoup(response.text, 'html.parser')

            # Filter news items for regulatory keywords
            news_items = soup.find_all('article', class_='noticia')

            for item in news_items[:10]:
                title_elem = item.find('h2') or item.find('h3')
                if not title_elem:
                    continue

                title = title_elem.text.strip()

                # Filter only regulatory-related news
                if not self._is_regulatory_news(title):
                    continue

                # Extract link, date, summary...
                # Similar parsing logic

        except Exception as e:
            logger.error(f"Error crawling ONS news: {str(e)}")

        return updates

    def _determine_procedure_category(self, code: str) -> str:
        """
        Determine procedure category from code

        Examples:
        - ONS-PO-BR-01: Planejamento da Operação
        - ONS-RE-BR-01: Requisitos de Equipamentos
        - ONS-SE-BR-01: Segurança
        """
        code_upper = code.upper()

        if 'PO' in code_upper:
            return 'planejamento_operacao'
        elif 'RE' in code_upper:
            return 'requisitos_equipamentos'
        elif 'SE' in code_upper:
            return 'seguranca'
        elif 'MD' in code_upper:
            return 'medicao'
        elif 'CM' in code_upper:
            return 'comunicacao'
        else:
            return 'geral'

    def _assess_procedure_impact(self, category: str) -> ImpactLevel:
        """Assess impact level based on procedure category"""
        high_impact_categories = ['seguranca', 'requisitos_equipamentos']
        medium_impact_categories = ['planejamento_operacao', 'medicao']

        if category in high_impact_categories:
            return ImpactLevel.HIGH
        elif category in medium_impact_categories:
            return ImpactLevel.MEDIUM
        else:
            return ImpactLevel.LOW

    def _is_regulatory_news(self, title: str) -> bool:
        """Check if news is regulatory-related"""
        keywords = [
            'procedimento', 'submódulo', 'resolução', 'regulação',
            'alteração', 'atualização', 'nova versão', 'revisão',
            'aprovação', 'consulta pública'
        ]
        title_lower = title.lower()
        return any(keyword in title_lower for keyword in keywords)

    def _parse_date(self, date_str: Optional[str]) -> Optional[datetime]:
        """Parse Brazilian date format"""
        if not date_str:
            return None

        try:
            # Try DD/MM/YYYY
            if '/' in date_str:
                parts = date_str.split('/')
                if len(parts) == 3:
                    day, month, year = parts
                    return datetime(int(year), int(month), int(day))

        except Exception as e:
            logger.error(f"Error parsing date '{date_str}': {str(e)}")

        return None

    def _generate_id(self, url: str) -> str:
        """Generate unique ID for update"""
        hash_obj = hashlib.md5(url.encode())
        return f"upd_ons_{hash_obj.hexdigest()[:12]}"

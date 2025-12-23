"""
ANEEL Crawler - Agência Nacional de Energia Elétrica
Monitora resoluções normativas, homologatórias e autorizativas
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
    ANEELResolution
)
from app.crawlers.base_crawler import BaseCrawler

logger = logging.getLogger(__name__)


class ANEELCrawler(BaseCrawler):
    """
    Crawler para ANEEL (Agência Nacional de Energia Elétrica)

    Fontes monitoradas:
    - https://www.aneel.gov.br/resolucoes
    - https://www.aneel.gov.br/legislacao
    - https://www.aneel.gov.br/sala-de-imprensa
    """

    def __init__(self):
        super().__init__(
            source=SourceType.ANEEL,
            authority="ANEEL",
            base_url="https://www.aneel.gov.br"
        )
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (compatible; ComplianceEngine/1.0; +compliance@company.com)'
        }

    async def crawl(self) -> List[RegulatoryUpdate]:
        """
        Execute crawl of ANEEL sources

        Returns:
            List of regulatory updates found
        """
        logger.info("Starting ANEEL crawler...")
        updates = []

        try:
            # 1. Crawl Resoluções Normativas (mais importantes)
            normative_updates = await self._crawl_normative_resolutions()
            updates.extend(normative_updates)

            # 2. Crawl Resoluções Homologatórias
            homologatory_updates = await self._crawl_homologatory_resolutions()
            updates.extend(homologatory_updates)

            # 3. Crawl Notas Técnicas
            technical_notes = await self._crawl_technical_notes()
            updates.extend(technical_notes)

            # 4. Crawl Sala de Imprensa (notícias sobre regulação)
            news_updates = await self._crawl_news()
            updates.extend(news_updates)

            logger.info(f"ANEEL crawler found {len(updates)} updates")
            return updates

        except Exception as e:
            logger.error(f"Error in ANEEL crawler: {str(e)}")
            raise

    async def _crawl_normative_resolutions(self) -> List[RegulatoryUpdate]:
        """Crawl Resoluções Normativas"""
        url = f"{self.base_url}/resolucoes-normativas"
        updates = []

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url, headers=self.headers)
                response.raise_for_status()

            soup = BeautifulSoup(response.text, 'html.parser')

            # Find resolution entries
            # Nota: Seletores CSS podem precisar ajuste conforme estrutura real do site
            resolution_items = soup.find_all('div', class_='item-resolucao')

            for item in resolution_items[:20]:  # Últimas 20
                try:
                    # Extract metadata
                    title_elem = item.find('h3') or item.find('a')
                    if not title_elem:
                        continue

                    title = title_elem.text.strip()
                    link_elem = item.find('a', href=True)
                    link = link_elem['href'] if link_elem else None

                    if not link:
                        continue

                    # Ensure absolute URL
                    if not link.startswith('http'):
                        link = f"{self.base_url}{link}"

                    # Extract date
                    date_text = item.find('span', class_='data')
                    pub_date = self._parse_date(date_text.text.strip() if date_text else None)

                    # Check if already processed
                    update_id = self._generate_id(link)
                    if await self.is_already_processed(update_id):
                        continue

                    # Parse resolution number and type
                    resolution_meta = self._parse_resolution_title(title)

                    # Fetch full content
                    full_content = await self._fetch_resolution_content(link)

                    # Create update
                    update = RegulatoryUpdate(
                        update_id=update_id,
                        source=SourceType.ANEEL,
                        authority="ANEEL",
                        title=title,
                        url=link,
                        published_date=pub_date or datetime.utcnow(),
                        detected_date=datetime.utcnow(),
                        change_type=ChangeType.NEW_REGULATION,
                        summary=f"Resolução Normativa {resolution_meta.get('number', 'N/A')} - {resolution_meta.get('subject', title)}",
                        full_content=full_content,
                        affected_regulations=[],
                        impact_level=ImpactLevel.HIGH,  # Será refinado por IA
                        tags=["resolucao_normativa", "aneel", resolution_meta.get('subject_tag', '')]
                    )

                    updates.append(update)

                except Exception as e:
                    logger.error(f"Error parsing resolution item: {str(e)}")
                    continue

        except Exception as e:
            logger.error(f"Error crawling normative resolutions: {str(e)}")

        return updates

    async def _crawl_homologatory_resolutions(self) -> List[RegulatoryUpdate]:
        """Crawl Resoluções Homologatórias"""
        # Similar structure to normative resolutions
        # Implementação simplificada
        return []

    async def _crawl_technical_notes(self) -> List[RegulatoryUpdate]:
        """Crawl Notas Técnicas"""
        url = f"{self.base_url}/notas-tecnicas"
        updates = []

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url, headers=self.headers)
                response.raise_for_status()

            soup = BeautifulSoup(response.text, 'html.parser')

            # Similar parsing logic
            # Notas técnicas têm menor impacto regulatório geralmente

        except Exception as e:
            logger.error(f"Error crawling technical notes: {str(e)}")

        return updates

    async def _crawl_news(self) -> List[RegulatoryUpdate]:
        """Crawl sala de imprensa for regulatory news"""
        url = f"{self.base_url}/sala-de-imprensa"
        updates = []

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url, headers=self.headers)
                response.raise_for_status()

            soup = BeautifulSoup(response.text, 'html.parser')

            # Parse news items
            # Filter for regulatory-related news only

        except Exception as e:
            logger.error(f"Error crawling news: {str(e)}")

        return updates

    async def _fetch_resolution_content(self, url: str) -> str:
        """Fetch full content of resolution"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url, headers=self.headers)
                response.raise_for_status()

            soup = BeautifulSoup(response.text, 'html.parser')

            # Extract main content
            content_div = soup.find('div', class_='conteudo') or soup.find('article')
            if content_div:
                # Remove scripts and styles
                for script in content_div(['script', 'style']):
                    script.decompose()

                return content_div.get_text(separator='\n', strip=True)

            return response.text[:5000]  # First 5000 chars if no content div

        except Exception as e:
            logger.error(f"Error fetching resolution content: {str(e)}")
            return ""

    def _parse_resolution_title(self, title: str) -> dict:
        """
        Parse resolution title to extract metadata

        Example: "Resolução Normativa nº 1.050/2024 - Estabelece requisitos de cibersegurança"
        """
        metadata = {
            'number': None,
            'year': None,
            'type': 'normativa',
            'subject': title,
            'subject_tag': ''
        }

        # Extract resolution number and year
        match = re.search(r'n[ºo°]?\s*(\d[\d.,]*)/(\d{4})', title, re.IGNORECASE)
        if match:
            metadata['number'] = match.group(1).replace('.', '')
            metadata['year'] = int(match.group(2))

        # Extract resolution type
        if 'homologatória' in title.lower():
            metadata['type'] = 'homologatoria'
        elif 'autorizativa' in title.lower():
            metadata['type'] = 'autorizativa'

        # Extract subject
        if ' - ' in title:
            metadata['subject'] = title.split(' - ', 1)[1].strip()

        # Tag by subject
        subject_lower = metadata['subject'].lower()
        if any(word in subject_lower for word in ['ciber', 'segurança da informação', 'security']):
            metadata['subject_tag'] = 'ciberseguranca'
        elif any(word in subject_lower for word in ['tarifa', 'reajuste', 'revisão tarifária']):
            metadata['subject_tag'] = 'tarifario'
        elif any(word in subject_lower for word in ['qualidade', 'continuidade', 'DEC', 'FEC']):
            metadata['subject_tag'] = 'qualidade'
        elif any(word in subject_lower for word in ['medição', 'medidor', 'smart grid']):
            metadata['subject_tag'] = 'medicao'

        return metadata

    def _parse_date(self, date_str: Optional[str]) -> Optional[datetime]:
        """Parse Brazilian date format"""
        if not date_str:
            return None

        try:
            # Try DD/MM/YYYY
            if '/' in date_str:
                day, month, year = date_str.split('/')
                return datetime(int(year), int(month), int(day))

            # Try DD-MM-YYYY
            if '-' in date_str:
                day, month, year = date_str.split('-')
                return datetime(int(year), int(month), int(day))

        except Exception as e:
            logger.error(f"Error parsing date '{date_str}': {str(e)}")

        return None

    def _generate_id(self, url: str) -> str:
        """Generate unique ID for update"""
        hash_obj = hashlib.md5(url.encode())
        return f"upd_aneel_{hash_obj.hexdigest()[:12]}"

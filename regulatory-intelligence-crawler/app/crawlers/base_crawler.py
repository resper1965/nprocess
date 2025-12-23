"""
Base Crawler class
All regulatory crawlers inherit from this
"""

import logging
from abc import ABC, abstractmethod
from typing import List, Optional
from datetime import datetime

from app.schemas import RegulatoryUpdate, SourceType

logger = logging.getLogger(__name__)


class BaseCrawler(ABC):
    """Base class for all regulatory crawlers"""

    def __init__(self, source: SourceType, authority: str, base_url: str):
        self.source = source
        self.authority = authority
        self.base_url = base_url
        self.processed_ids = set()  # In-memory cache (TODO: move to Redis)

    @abstractmethod
    async def crawl(self) -> List[RegulatoryUpdate]:
        """
        Execute crawl and return list of regulatory updates

        Returns:
            List of RegulatoryUpdate objects
        """
        pass

    async def is_already_processed(self, update_id: str) -> bool:
        """
        Check if update was already processed

        Args:
            update_id: Unique identifier for the update

        Returns:
            True if already processed, False otherwise
        """
        # TODO: Check in database/Redis instead of memory
        return update_id in self.processed_ids

    def mark_as_processed(self, update_id: str):
        """Mark update as processed"""
        self.processed_ids.add(update_id)

    async def validate_update(self, update: RegulatoryUpdate) -> bool:
        """
        Validate that update has required fields

        Args:
            update: RegulatoryUpdate object

        Returns:
            True if valid, False otherwise
        """
        try:
            # Required fields
            if not update.title or not update.url:
                return False

            if not update.summary or len(update.summary) < 10:
                return False

            return True

        except Exception as e:
            logger.error(f"Error validating update: {str(e)}")
            return False

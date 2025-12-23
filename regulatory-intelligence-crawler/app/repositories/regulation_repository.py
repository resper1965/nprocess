"""
Regulation Repository
Data access layer for regulatory updates
"""

import logging
from typing import List, Optional
from datetime import datetime

try:
    from google.cloud import firestore
except ImportError:
    firestore = None

from app.schemas import RegulatoryUpdate

logger = logging.getLogger(__name__)


class RegulationRepository:
    """
    Repository for regulatory updates

    Storage: Firestore
    Collection: regulatory_updates
    """

    def __init__(self):
        if firestore:
            try:
                self.db = firestore.AsyncClient()
                self.collection = self.db.collection('regulatory_updates')
                logger.info("Firestore repository initialized")
            except Exception as e:
                logger.error(f"Error initializing Firestore: {str(e)}")
                self.db = None
                self.collection = None
        else:
            logger.warning("Firestore SDK not available")
            self.db = None
            self.collection = None

        # In-memory fallback
        self.memory_store: List[RegulatoryUpdate] = []

    async def save_update(self, update: RegulatoryUpdate) -> str:
        """
        Save regulatory update

        Args:
            update: RegulatoryUpdate object

        Returns:
            update_id
        """
        if self.collection:
            try:
                doc_ref = self.collection.document(update.update_id)
                await doc_ref.set(update.dict())
                logger.info(f"Saved update {update.update_id} to Firestore")
                return update.update_id
            except Exception as e:
                logger.error(f"Error saving to Firestore: {str(e)}")

        # Fallback to memory
        self.memory_store.append(update)
        logger.info(f"Saved update {update.update_id} to memory")
        return update.update_id

    async def get_update(self, update_id: str) -> Optional[RegulatoryUpdate]:
        """Get update by ID"""
        if self.collection:
            try:
                doc = await self.collection.document(update_id).get()
                if doc.exists:
                    return RegulatoryUpdate(**doc.to_dict())
            except Exception as e:
                logger.error(f"Error fetching from Firestore: {str(e)}")

        # Fallback to memory
        for update in self.memory_store:
            if update.update_id == update_id:
                return update

        return None

    async def list_updates(
        self,
        source: Optional[str] = None,
        impact_level: Optional[str] = None,
        since_date: Optional[str] = None,
        limit: int = 50
    ) -> List[RegulatoryUpdate]:
        """
        List regulatory updates with filters

        Args:
            source: Filter by source (aneel, ons, arcyber)
            impact_level: Filter by impact level
            since_date: Filter updates since this date
            limit: Maximum results

        Returns:
            List of regulatory updates
        """
        if self.collection:
            try:
                query = self.collection

                # Apply filters
                if source:
                    query = query.where('source', '==', source)

                if impact_level:
                    query = query.where('impact_level', '==', impact_level)

                if since_date:
                    since_dt = datetime.fromisoformat(since_date)
                    query = query.where('detected_date', '>=', since_dt)

                # Order and limit
                query = query.order_by('detected_date', direction=firestore.Query.DESCENDING)
                query = query.limit(limit)

                # Execute query
                docs = query.stream()

                updates = []
                async for doc in docs:
                    updates.append(RegulatoryUpdate(**doc.to_dict()))

                return updates

            except Exception as e:
                logger.error(f"Error querying Firestore: {str(e)}")

        # Fallback to memory
        filtered = self.memory_store

        if source:
            filtered = [u for u in filtered if u.source.value == source]

        if impact_level:
            filtered = [u for u in filtered if u.impact_level.value == impact_level]

        if since_date:
            since_dt = datetime.fromisoformat(since_date)
            filtered = [u for u in filtered if u.detected_date >= since_dt]

        # Sort by date descending
        filtered.sort(key=lambda x: x.detected_date, reverse=True)

        return filtered[:limit]

    async def exists(self, update_id: str) -> bool:
        """Check if update exists"""
        update = await self.get_update(update_id)
        return update is not None

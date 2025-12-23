"""
Crawler Orchestrator
Manages multiple crawlers and scheduling
"""

import logging
from typing import List, Optional
from datetime import datetime
import asyncio

from app.crawlers import ANEELCrawler, ONSCrawler, ARCyberCrawler
from app.schemas import RegulatoryUpdate, CrawlerStatus, SourceType, CrawlerConfig

logger = logging.getLogger(__name__)


class CrawlerOrchestrator:
    """
    Orchestrates multiple regulatory crawlers

    Responsibilities:
    - Manage crawler instances
    - Schedule periodic crawls
    - Aggregate results
    - Track status
    """

    def __init__(self):
        self.crawlers = {
            SourceType.ANEEL: ANEELCrawler(),
            SourceType.ONS: ONSCrawler(),
            SourceType.ARCYBER: ARCyberCrawler(),
        }

        self.status = {
            source: {
                "status": "idle",
                "last_run": None,
                "last_success": None,
                "updates_found_last_run": 0,
                "total_updates_found": 0,
                "error_message": None
            }
            for source in self.crawlers.keys()
        }

        self.scheduler_task = None
        self.running = False

    async def run_crawlers(
        self,
        sources: Optional[List[str]] = None
    ) -> List[RegulatoryUpdate]:
        """
        Run crawlers for specified sources

        Args:
            sources: List of source names to crawl. If None, crawls all.

        Returns:
            Aggregated list of regulatory updates
        """
        all_updates = []

        # Determine which crawlers to run
        if sources:
            crawlers_to_run = {
                source: crawler
                for source, crawler in self.crawlers.items()
                if source.value in sources
            }
        else:
            crawlers_to_run = self.crawlers

        logger.info(f"Running {len(crawlers_to_run)} crawlers...")

        # Run crawlers in parallel
        tasks = []
        for source, crawler in crawlers_to_run.items():
            tasks.append(self._run_single_crawler(source, crawler))

        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Aggregate results
        for result in results:
            if isinstance(result, list):
                all_updates.extend(result)
            elif isinstance(result, Exception):
                logger.error(f"Crawler error: {str(result)}")

        logger.info(f"Total updates found: {len(all_updates)}")
        return all_updates

    async def _run_single_crawler(
        self,
        source: SourceType,
        crawler
    ) -> List[RegulatoryUpdate]:
        """Run a single crawler and update status"""
        try:
            # Update status: running
            self.status[source]["status"] = "running"
            self.status[source]["last_run"] = datetime.utcnow()
            self.status[source]["error_message"] = None

            logger.info(f"Starting crawler: {source.value}")

            # Run crawler
            updates = await crawler.crawl()

            # Update status: success
            self.status[source]["status"] = "idle"
            self.status[source]["last_success"] = datetime.utcnow()
            self.status[source]["updates_found_last_run"] = len(updates)
            self.status[source]["total_updates_found"] += len(updates)

            logger.info(f"Crawler {source.value} found {len(updates)} updates")

            return updates

        except Exception as e:
            # Update status: error
            self.status[source]["status"] = "error"
            self.status[source]["error_message"] = str(e)

            logger.error(f"Error in crawler {source.value}: {str(e)}")
            raise

    async def get_status(self) -> List[CrawlerStatus]:
        """Get status of all crawlers"""
        status_list = []

        for source, status_data in self.status.items():
            status_list.append(
                CrawlerStatus(
                    source=source,
                    status=status_data["status"],
                    last_run=status_data["last_run"],
                    last_success=status_data["last_success"],
                    updates_found_last_run=status_data["updates_found_last_run"],
                    total_updates_found=status_data["total_updates_found"],
                    error_message=status_data["error_message"]
                )
            )

        return status_list

    async def add_source(self, config: CrawlerConfig):
        """Add new crawler source (for extensibility)"""
        # TODO: Implement dynamic crawler loading
        logger.info(f"Adding new source: {config.source_id}")
        pass

    async def start_scheduler(self):
        """Start background scheduler for periodic crawls"""
        self.running = True
        self.scheduler_task = asyncio.create_task(self._scheduler_loop())
        logger.info("Crawler scheduler started")

    async def stop_scheduler(self):
        """Stop background scheduler"""
        self.running = False
        if self.scheduler_task:
            self.scheduler_task.cancel()
            try:
                await self.scheduler_task
            except asyncio.CancelledError:
                pass
        logger.info("Crawler scheduler stopped")

    async def _scheduler_loop(self):
        """Background scheduler loop"""
        while self.running:
            try:
                # Wait 24 hours between runs (daily crawl)
                await asyncio.sleep(24 * 60 * 60)

                # Run all crawlers
                logger.info("Scheduled crawl starting...")
                await self.run_crawlers()

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in scheduler loop: {str(e)}")
                # Wait 1 hour before retrying on error
                await asyncio.sleep(60 * 60)

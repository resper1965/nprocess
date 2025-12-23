"""
Regulatory Intelligence Crawler API
Monitora automaticamente sites regulatórios do setor elétrico brasileiro
(ANEEL, ONS, ARCyber) em busca de atualizações de normas e procedimentos.
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import List, Optional
import logging

from app.services.crawler_orchestrator import CrawlerOrchestrator
from app.services.gemini_analyzer import GeminiAnalyzer
from app.services.notification_service import NotificationService
from app.repositories.regulation_repository import RegulationRepository
from app.schemas import (
    RegulatoryUpdate,
    CrawlerStatus,
    AnalysisRequest,
    NotificationRequest,
    CrawlerConfig
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle management"""
    logger.info("Starting Regulatory Intelligence Crawler API...")

    # Initialize services
    app.state.orchestrator = CrawlerOrchestrator()
    app.state.analyzer = GeminiAnalyzer()
    app.state.notifier = NotificationService()
    app.state.repository = RegulationRepository()

    # Start background scheduler (daily crawls)
    await app.state.orchestrator.start_scheduler()

    yield

    # Shutdown
    logger.info("Shutting down Regulatory Intelligence Crawler API...")
    await app.state.orchestrator.stop_scheduler()


app = FastAPI(
    title="Regulatory Intelligence Crawler API",
    description="Monitoramento automático de atualizações regulatórias do setor elétrico brasileiro",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "regulatory-intelligence-crawler",
        "version": "1.0.0"
    }


@app.post("/v1/crawlers/run", response_model=List[RegulatoryUpdate])
async def trigger_crawl(
    background_tasks: BackgroundTasks,
    sources: Optional[List[str]] = None
):
    """
    Trigger manual crawl of regulatory sources.

    Args:
        sources: List of sources to crawl. Options: ['aneel', 'ons', 'arcyber']
                If None, crawls all sources.

    Returns:
        List of regulatory updates found
    """
    try:
        orchestrator: CrawlerOrchestrator = app.state.orchestrator

        # Run crawlers
        updates = await orchestrator.run_crawlers(sources=sources)

        # Analyze with Gemini in background
        background_tasks.add_task(
            _analyze_and_notify,
            updates
        )

        return updates

    except Exception as e:
        logger.error(f"Error triggering crawl: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/v1/crawlers/status", response_model=List[CrawlerStatus])
async def get_crawler_status():
    """Get status of all crawlers"""
    orchestrator: CrawlerOrchestrator = app.state.orchestrator
    return await orchestrator.get_status()


@app.get("/v1/updates", response_model=List[RegulatoryUpdate])
async def list_updates(
    source: Optional[str] = None,
    impact_level: Optional[str] = None,
    since_date: Optional[str] = None,
    limit: int = 50
):
    """
    List regulatory updates.

    Args:
        source: Filter by source (aneel, ons, arcyber)
        impact_level: Filter by impact (critical, high, medium, low)
        since_date: Filter updates since this date (ISO format)
        limit: Maximum number of results
    """
    repository: RegulationRepository = app.state.repository

    return await repository.list_updates(
        source=source,
        impact_level=impact_level,
        since_date=since_date,
        limit=limit
    )


@app.get("/v1/updates/{update_id}", response_model=RegulatoryUpdate)
async def get_update(update_id: str):
    """Get specific regulatory update by ID"""
    repository: RegulationRepository = app.state.repository

    update = await repository.get_update(update_id)
    if not update:
        raise HTTPException(status_code=404, detail="Update not found")

    return update


@app.post("/v1/updates/{update_id}/analyze")
async def analyze_impact(update_id: str, request: AnalysisRequest):
    """
    Analyze impact of a regulatory update on company's processes.

    Args:
        update_id: ID of the regulatory update
        request: Analysis request with company context
    """
    repository: RegulationRepository = app.state.repository
    analyzer: GeminiAnalyzer = app.state.analyzer

    # Get update
    update = await repository.get_update(update_id)
    if not update:
        raise HTTPException(status_code=404, detail="Update not found")

    # Analyze impact
    impact = await analyzer.analyze_impact(
        update=update,
        company_context=request.company_context,
        existing_processes=request.existing_processes
    )

    return impact


@app.post("/v1/notifications/send")
async def send_notification(request: NotificationRequest):
    """Send notification about regulatory update"""
    notifier: NotificationService = app.state.notifier

    await notifier.send_notification(
        update_id=request.update_id,
        channels=request.channels,
        recipients=request.recipients,
        priority=request.priority
    )

    return {"status": "sent"}


@app.post("/v1/config/sources")
async def configure_source(config: CrawlerConfig):
    """Configure or add new regulatory source"""
    orchestrator: CrawlerOrchestrator = app.state.orchestrator

    await orchestrator.add_source(config)

    return {"status": "configured", "source": config.source_id}


# Background task helpers
async def _analyze_and_notify(updates: List[RegulatoryUpdate]):
    """Analyze updates and send notifications in background"""
    analyzer: GeminiAnalyzer = app.state.analyzer
    notifier: NotificationService = app.state.notifier

    for update in updates:
        try:
            # Quick analysis
            analysis = await analyzer.quick_analyze(update)

            # Notify if critical or high impact
            if analysis.impact_level in ['critical', 'high']:
                await notifier.send_alert(update, analysis)

        except Exception as e:
            logger.error(f"Error analyzing update {update.update_id}: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)

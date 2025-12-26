"""
Compliance dashboard endpoints for n.process.
"""
import logging
from typing import List

from fastapi import APIRouter, HTTPException, status, Depends

from app.schemas_dashboard import (
    ComplianceDashboard,
    DomainComplianceStats,
    DomainDashboardRequest,
    ProcessComplianceStatus,
)
from app.services.dashboard_service import get_dashboard_service
from app.middleware.auth import validate_api_key


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/compliance", tags=["Compliance Dashboard"])


# ============================================================================
# Dashboard Endpoints
# ============================================================================

@router.get(
    "/dashboard",
    response_model=ComplianceDashboard,
    summary="Get compliance dashboard",
    description="Get overall compliance dashboard with statistics by domain"
)
async def get_dashboard(
    months: int = 12,
    api_key = Depends(validate_api_key)
):
    """
    Get overall compliance dashboard.
    
    Args:
        months: Number of months for trends (default: 12)
        api_key: Validated API key (optional)
        
    Returns:
        ComplianceDashboard
    """
    try:
        dashboard_service = get_dashboard_service()
        
        dashboard = await dashboard_service.get_dashboard(months=months)
        
        return dashboard
        
    except Exception as e:
        logger.error(f"Error getting dashboard: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get compliance dashboard"
        )


@router.get(
    "/domains/{domain}",
    response_model=DomainComplianceStats,
    summary="Get domain dashboard",
    description="Get compliance dashboard for a specific regulatory domain"
)
async def get_domain_dashboard(
    domain: str,
    months: int = 12,
    api_key = Depends(validate_api_key)
):
    """
    Get compliance dashboard for a specific domain.
    
    Args:
        domain: Regulatory domain (e.g., 'LGPD', 'GDPR', 'SOX')
        months: Number of months for trends (default: 12)
        api_key: Validated API key (optional)
        
    Returns:
        DomainComplianceStats
    """
    try:
        dashboard_service = get_dashboard_service()
        
        domain_stats = await dashboard_service.get_domain_dashboard(
            domain=domain,
            months=months
        )
        
        return domain_stats
        
    except Exception as e:
        logger.error(f"Error getting domain dashboard: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get domain dashboard"
        )


@router.get(
    "/domains/{domain}/processes",
    response_model=List[ProcessComplianceStatus],
    summary="Get domain processes",
    description="Get compliance status of all processes in a domain"
)
async def get_domain_processes(
    domain: str,
    limit: int = 50,
    api_key = Depends(validate_api_key)
):
    """
    Get compliance status of all processes in a domain.
    
    Args:
        domain: Regulatory domain
        limit: Maximum number of results
        api_key: Validated API key (optional)
        
    Returns:
        List of ProcessComplianceStatus
    """
    try:
        dashboard_service = get_dashboard_service()
        
        statuses = await dashboard_service.get_domain_processes(
            domain=domain,
            limit=limit
        )
        
        return statuses
        
    except Exception as e:
        logger.error(f"Error getting domain processes: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get domain processes"
        )


@router.get(
    "/domains/{domain}/trends",
    response_model=List[dict],
    summary="Get domain trends",
    description="Get compliance trends for a domain over time"
)
async def get_domain_trends(
    domain: str,
    months: int = 12,
    api_key = Depends(validate_api_key)
):
    """
    Get compliance trends for a domain.
    
    Args:
        domain: Regulatory domain
        months: Number of months for trends
        api_key: Validated API key (optional)
        
    Returns:
        List of trend data points
    """
    try:
        dashboard_service = get_dashboard_service()
        
        domain_stats = await dashboard_service.get_domain_dashboard(
            domain=domain,
            months=months
        )
        
        # Convert trends to dict for JSON serialization
        trends = [
            {
                "date": t.date.isoformat(),
                "score": t.score,
                "process_count": t.process_count,
                "compliant_count": t.compliant_count,
                "non_compliant_count": t.non_compliant_count,
            }
            for t in domain_stats.trends
        ]
        
        return trends
        
    except Exception as e:
        logger.error(f"Error getting domain trends: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get domain trends"
        )


@router.get(
    "/domains/{domain}/report",
    summary="Get domain report",
    description="Get detailed compliance report for a domain (PDF export - placeholder)"
)
async def get_domain_report(
    domain: str,
    api_key = Depends(validate_api_key)
):
    """
    Get detailed compliance report for a domain.
    
    Note: PDF generation not yet implemented - returns JSON summary.
    
    Args:
        domain: Regulatory domain
        api_key: Validated API key (optional)
        
    Returns:
        Report data (JSON for now, PDF in future)
    """
    try:
        dashboard_service = get_dashboard_service()
        
        domain_stats = await dashboard_service.get_domain_dashboard(domain=domain)
        processes = await dashboard_service.get_domain_processes(domain=domain, limit=100)
        
        return {
            "domain": domain,
            "summary": {
                "total_processes": domain_stats.total_processes,
                "compliant_processes": domain_stats.compliant_processes,
                "non_compliant_processes": domain_stats.non_compliant_processes,
                "average_score": domain_stats.average_score,
            },
            "processes": [
                {
                    "process_id": p.process_id,
                    "process_name": p.process_name,
                    "score": p.current_score,
                    "status": p.status,
                    "gaps_count": p.gaps_count,
                }
                for p in processes
            ],
            "alerts": [
                {
                    "process_id": a.process_id,
                    "process_name": a.process_name,
                    "severity": a.severity,
                    "message": a.message,
                    "score": a.score,
                }
                for a in domain_stats.alerts
            ],
            "note": "PDF export not yet implemented - this is a JSON summary",
        }
        
    except Exception as e:
        logger.error(f"Error getting domain report: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get domain report"
        )


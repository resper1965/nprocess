"""
Compliance dashboard service for n.process.
"""
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from collections import defaultdict

from google.cloud import firestore

from app.schemas_dashboard import (
    ComplianceDashboard,
    DomainComplianceStats,
    ComplianceTrend,
    ComplianceAlert,
    ProcessComplianceStatus,
)


logger = logging.getLogger(__name__)


# ============================================================================
# Constants
# ============================================================================

PROCESSES_COLLECTION = "processes"
ANALYSES_COLLECTION = "compliance_analyses"


# ============================================================================
# Dashboard Service
# ============================================================================

class DashboardService:
    """Service for compliance dashboards."""
    
    def __init__(self, project_id: Optional[str] = None):
        """
        Initialize dashboard service.
        
        Args:
            project_id: GCP project ID
        """
        try:
            if project_id:
                self.db = firestore.Client(project=project_id)
            else:
                self.db = firestore.Client()
            
            logger.info("DashboardService initialized")
        except Exception as e:
            logger.error(f"Error initializing DashboardService: {e}")
            raise
    
    async def get_dashboard(
        self,
        months: int = 12
    ) -> ComplianceDashboard:
        """
        Get overall compliance dashboard.
        
        Args:
            months: Number of months for trends
            
        Returns:
            ComplianceDashboard
        """
        try:
            # Get all processes
            processes = self.db.collection(PROCESSES_COLLECTION).stream()
            
            process_list = []
            for doc in processes:
                data = doc.to_dict()
                data["id"] = doc.id
                process_list.append(data)
            
            # Get all analyses
            analyses = self.db.collection(ANALYSES_COLLECTION).stream()
            
            analysis_list = []
            for doc in analyses:
                data = doc.to_dict()
                data["id"] = doc.id
                analysis_list.append(data)
            
            # Group by domain
            domain_stats = await self._calculate_domain_stats(
                process_list,
                analysis_list,
                months
            )
            
            # Calculate overall stats
            total_processes = len(process_list)
            compliant_count = 0
            non_compliant_count = 0
            total_score = 0.0
            score_count = 0
            
            for domain_stat in domain_stats:
                compliant_count += domain_stat.compliant_processes
                non_compliant_count += domain_stat.non_compliant_processes
                if domain_stat.average_score > 0:
                    total_score += domain_stat.average_score
                    score_count += 1
            
            overall_score = total_score / score_count if score_count > 0 else 0.0
            
            # Get recent alerts
            recent_alerts = await self._get_recent_alerts(analysis_list, limit=10)
            
            # Calculate overall trends
            trends = await self._calculate_trends(analysis_list, months)
            
            return ComplianceDashboard(
                overall_score=overall_score,
                total_processes=total_processes,
                compliant_processes=compliant_count,
                non_compliant_processes=non_compliant_count,
                domains=domain_stats,
                recent_alerts=recent_alerts,
                trends=trends,
                generated_at=datetime.utcnow(),
            )
            
        except Exception as e:
            logger.error(f"Error getting dashboard: {e}")
            raise
    
    async def get_domain_dashboard(
        self,
        domain: str,
        months: int = 12
    ) -> DomainComplianceStats:
        """
        Get compliance dashboard for a specific domain.
        
        Args:
            domain: Regulatory domain
            months: Number of months for trends
            
        Returns:
            DomainComplianceStats
        """
        try:
            # Get processes in this domain
            processes_query = (
                self.db.collection(PROCESSES_COLLECTION)
                .where("domain", "==", domain)
            )
            
            process_list = []
            for doc in processes_query.stream():
                data = doc.to_dict()
                data["id"] = doc.id
                process_list.append(data)
            
            # Get analyses for this domain
            analyses_query = (
                self.db.collection(ANALYSES_COLLECTION)
                .where("domain", "==", domain)
            )
            
            analysis_list = []
            for doc in analyses_query.stream():
                data = doc.to_dict()
                data["id"] = doc.id
                analysis_list.append(data)
            
            # Calculate stats
            total_processes = len(process_list)
            
            # Get scores from analyses
            scores = []
            compliant_count = 0
            non_compliant_count = 0
            
            for analysis in analysis_list:
                score = analysis.get("overall_score", 0)
                if score is not None:
                    scores.append(score)
                    if score >= 80:  # Threshold for compliant
                        compliant_count += 1
                    else:
                        non_compliant_count += 1
            
            average_score = sum(scores) / len(scores) if scores else 0.0
            min_score = min(scores) if scores else 0.0
            max_score = max(scores) if scores else 0.0
            
            # Calculate trends
            trends = await self._calculate_trends(analysis_list, months)
            
            # Get alerts
            alerts = await self._get_recent_alerts(analysis_list, limit=20)
            
            return DomainComplianceStats(
                domain=domain,
                total_processes=total_processes,
                compliant_processes=compliant_count,
                non_compliant_processes=non_compliant_count,
                average_score=average_score,
                min_score=min_score,
                max_score=max_score,
                trends=trends,
                alerts=alerts,
            )
            
        except Exception as e:
            logger.error(f"Error getting domain dashboard: {e}")
            raise
    
    async def get_domain_processes(
        self,
        domain: str,
        limit: int = 50
    ) -> List[ProcessComplianceStatus]:
        """
        Get compliance status of all processes in a domain.
        
        Args:
            domain: Regulatory domain
            limit: Maximum number of results
            
        Returns:
            List of ProcessComplianceStatus
        """
        try:
            # Get processes in this domain
            processes_query = (
                self.db.collection(PROCESSES_COLLECTION)
                .where("domain", "==", domain)
                .limit(limit)
            )
            
            process_list = []
            for doc in processes_query.stream():
                data = doc.to_dict()
                data["id"] = doc.id
                process_list.append(data)
            
            # Get latest analysis for each process
            statuses = []
            for process in process_list:
                process_id = process["id"]
                
                # Get latest analysis
                analysis_query = (
                    self.db.collection(ANALYSES_COLLECTION)
                    .where("process_id", "==", process_id)
                    .where("domain", "==", domain)
                    .order_by("analyzed_at", direction=firestore.Query.DESCENDING)
                    .limit(1)
                )
                
                analyses = list(analysis_query.stream())
                
                if analyses:
                    analysis = analyses[0].to_dict()
                    score = analysis.get("overall_score", 0)
                    gaps = analysis.get("gaps", [])
                    suggestions = analysis.get("suggestions", [])
                    analyzed_at = analysis.get("analyzed_at")
                    
                    status = "compliant" if score >= 80 else "non_compliant"
                    if 60 <= score < 80:
                        status = "needs_review"
                else:
                    score = 0.0
                    status = "not_analyzed"
                    gaps = []
                    suggestions = []
                    analyzed_at = None
                
                statuses.append(ProcessComplianceStatus(
                    process_id=process_id,
                    process_name=process.get("name", ""),
                    domain=domain,
                    current_score=score,
                    status=status,
                    last_analyzed_at=analyzed_at,
                    gaps_count=len(gaps) if isinstance(gaps, list) else 0,
                    suggestions_count=len(suggestions) if isinstance(suggestions, list) else 0,
                ))
            
            # Sort by score (lowest first - most critical)
            statuses.sort(key=lambda x: x.current_score)
            
            return statuses
            
        except Exception as e:
            logger.error(f"Error getting domain processes: {e}")
            raise
    
    async def _calculate_domain_stats(
        self,
        processes: List[Dict[str, Any]],
        analyses: List[Dict[str, Any]],
        months: int
    ) -> List[DomainComplianceStats]:
        """Calculate statistics by domain."""
        # Group processes by domain
        domain_processes = defaultdict(list)
        for process in processes:
            domain = process.get("domain", "unknown")
            domain_processes[domain].append(process)
        
        # Group analyses by domain
        domain_analyses = defaultdict(list)
        for analysis in analyses:
            domain = analysis.get("domain", "unknown")
            domain_analyses[domain].append(analysis)
        
        # Calculate stats for each domain
        domain_stats = []
        for domain in set(list(domain_processes.keys()) + list(domain_analyses.keys())):
            domain_procs = domain_processes.get(domain, [])
            domain_anal = domain_analyses.get(domain, [])
            
            # Get scores
            scores = [a.get("overall_score", 0) for a in domain_anal if a.get("overall_score") is not None]
            
            compliant_count = sum(1 for s in scores if s >= 80)
            non_compliant_count = len(scores) - compliant_count
            
            average_score = sum(scores) / len(scores) if scores else 0.0
            min_score = min(scores) if scores else 0.0
            max_score = max(scores) if scores else 0.0
            
            # Calculate trends
            trends = await self._calculate_trends(domain_anal, months)
            
            # Get alerts
            alerts = await self._get_recent_alerts(domain_anal, limit=10)
            
            domain_stats.append(DomainComplianceStats(
                domain=domain,
                total_processes=len(domain_procs),
                compliant_processes=compliant_count,
                non_compliant_processes=non_compliant_count,
                average_score=average_score,
                min_score=min_score,
                max_score=max_score,
                trends=trends,
                alerts=alerts,
            ))
        
        return domain_stats
    
    async def _calculate_trends(
        self,
        analyses: List[Dict[str, Any]],
        months: int
    ) -> List[ComplianceTrend]:
        """Calculate compliance trends over time."""
        # Group analyses by month
        monthly_data = defaultdict(lambda: {"scores": [], "processes": set()})
        
        cutoff_date = datetime.utcnow() - timedelta(days=months * 30)
        
        for analysis in analyses:
            analyzed_at = analysis.get("analyzed_at")
            if not analyzed_at:
                continue
            
            # Convert to datetime if string
            if isinstance(analyzed_at, str):
                try:
                    analyzed_at = datetime.fromisoformat(analyzed_at.replace('Z', '+00:00'))
                except:
                    continue
            
            if analyzed_at < cutoff_date:
                continue
            
            # Group by month
            month_key = analyzed_at.strftime("%Y-%m")
            score = analysis.get("overall_score", 0)
            process_id = analysis.get("process_id")
            
            if score is not None and process_id:
                monthly_data[month_key]["scores"].append(score)
                monthly_data[month_key]["processes"].add(process_id)
        
        # Build trends
        trends = []
        for month_key in sorted(monthly_data.keys()):
            data = monthly_data[month_key]
            scores = data["scores"]
            processes = data["processes"]
            
            if scores:
                avg_score = sum(scores) / len(scores)
                compliant = sum(1 for s in scores if s >= 80)
                non_compliant = len(scores) - compliant
                
                # Parse month key to datetime
                year, month = map(int, month_key.split("-"))
                date = datetime(year, month, 1)
                
                trends.append(ComplianceTrend(
                    date=date,
                    score=avg_score,
                    process_count=len(processes),
                    compliant_count=compliant,
                    non_compliant_count=non_compliant,
                ))
        
        return trends
    
    async def _get_recent_alerts(
        self,
        analyses: List[Dict[str, Any]],
        limit: int = 10
    ) -> List[ComplianceAlert]:
        """Get recent compliance alerts."""
        alerts = []
        
        for analysis in analyses:
            score = analysis.get("overall_score", 100)
            process_id = analysis.get("process_id", "")
            domain = analysis.get("domain", "")
            gaps = analysis.get("gaps", [])
            
            # Create alerts for low scores or critical gaps
            if score < 60:
                severity = "critical"
            elif score < 70:
                severity = "high"
            elif score < 80:
                severity = "medium"
            else:
                continue  # Skip if score is good
            
            # Get process name
            from app.services.db_service import get_db_service
            db_service = get_db_service()
            process = await db_service.get_process(process_id)
            process_name = process.get("name", "Unknown") if process else "Unknown"
            
            alerts.append(ComplianceAlert(
                id=analysis.get("id", ""),
                process_id=process_id,
                process_name=process_name,
                domain=domain,
                severity=severity,
                message=f"Compliance score {score:.1f}% - {len(gaps)} gaps identified",
                score=score,
                created_at=analysis.get("analyzed_at", datetime.utcnow()),
            ))
        
        # Sort by severity and score
        severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        alerts.sort(key=lambda x: (severity_order.get(x.severity, 99), x.score))
        
        return alerts[:limit]


# ============================================================================
# Singleton Instance
# ============================================================================

_dashboard_service_instance: Optional[DashboardService] = None


def get_dashboard_service() -> DashboardService:
    """Return singleton instance of DashboardService."""
    global _dashboard_service_instance
    if _dashboard_service_instance is None:
        _dashboard_service_instance = DashboardService()
    return _dashboard_service_instance


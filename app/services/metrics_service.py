"""
Metrics service for Cloud Monitoring integration.
"""
import logging
from typing import Dict, Optional
from datetime import datetime

# Try to import Cloud Monitoring
try:
    from google.cloud import monitoring_v3
    from google.cloud.monitoring_v3 import MetricServiceClient
    MONITORING_AVAILABLE = True
except ImportError:
    MONITORING_AVAILABLE = False

logger = logging.getLogger(__name__)


class MetricsService:
    """
    Service for sending custom metrics to Cloud Monitoring.
    """
    
    def __init__(self, project_id: Optional[str] = None):
        self.project_id = project_id
        self.client = None
        
        if MONITORING_AVAILABLE:
            try:
                self.client = MetricServiceClient()
                if not self.project_id:
                    # Try to get from environment
                    import os
                    self.project_id = os.getenv("GOOGLE_CLOUD_PROJECT") or os.getenv("GCP_PROJECT_ID")
                
                if self.project_id:
                    self.project_name = f"projects/{self.project_id}"
                    logger.info(f"Cloud Monitoring initialized for project: {self.project_id}")
                else:
                    logger.warning("Cloud Monitoring available but project_id not set")
                    self.client = None
            except Exception as e:
                logger.warning(f"Failed to initialize Cloud Monitoring: {e}")
                self.client = None
        else:
            logger.info("Cloud Monitoring not available")
    
    def record_request(
        self,
        endpoint: str,
        method: str,
        status_code: int,
        duration_ms: float,
        api_key_id: Optional[str] = None
    ):
        """
        Record a request metric.
        
        Args:
            endpoint: API endpoint path
            method: HTTP method
            status_code: HTTP status code
            duration_ms: Request duration in milliseconds
            api_key_id: Optional API key ID
        """
        if not self.client:
            return
        
        try:
            series = monitoring_v3.TimeSeries()
            series.metric.type = "custom.googleapis.com/compliance_engine/requests"
            series.resource.type = "global"
            
            # Add labels
            series.metric.labels["endpoint"] = endpoint
            series.metric.labels["method"] = method
            series.metric.labels["status_code"] = str(status_code)
            if api_key_id:
                series.metric.labels["api_key_id"] = api_key_id
            
            # Create data point
            point = monitoring_v3.Point()
            point.value.double_value = duration_ms
            point.interval.end_time.seconds = int(datetime.utcnow().timestamp())
            
            series.points = [point]
            
            # Write to Cloud Monitoring
            self.client.create_time_series(
                name=self.project_name,
                time_series=[series]
            )
            
        except Exception as e:
            logger.error(f"Error recording metric: {e}")
    
    def record_error(
        self,
        endpoint: str,
        method: str,
        error_type: str,
        api_key_id: Optional[str] = None
    ):
        """
        Record an error metric.
        
        Args:
            endpoint: API endpoint path
            method: HTTP method
            error_type: Type of error
            api_key_id: Optional API key ID
        """
        if not self.client:
            return
        
        try:
            series = monitoring_v3.TimeSeries()
            series.metric.type = "custom.googleapis.com/compliance_engine/errors"
            series.resource.type = "global"
            
            # Add labels
            series.metric.labels["endpoint"] = endpoint
            series.metric.labels["method"] = method
            series.metric.labels["error_type"] = error_type
            if api_key_id:
                series.metric.labels["api_key_id"] = api_key_id
            
            # Create data point
            point = monitoring_v3.Point()
            point.value.int64_value = 1
            point.interval.end_time.seconds = int(datetime.utcnow().timestamp())
            
            series.points = [point]
            
            # Write to Cloud Monitoring
            self.client.create_time_series(
                name=self.project_name,
                time_series=[series]
            )
            
        except Exception as e:
            logger.error(f"Error recording error metric: {e}")


# Singleton instance
_metrics_service: Optional[MetricsService] = None


def get_metrics_service(project_id: Optional[str] = None) -> MetricsService:
    """Get or create metrics service instance."""
    global _metrics_service
    if _metrics_service is None:
        _metrics_service = MetricsService(project_id=project_id)
    return _metrics_service



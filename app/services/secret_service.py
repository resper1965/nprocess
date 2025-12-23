"""
Secret management service using Google Cloud Secret Manager.
Falls back to environment variables if Secret Manager is not available.
"""
import logging
import os
from typing import Optional

# Try to import Secret Manager
try:
    from google.cloud import secretmanager
    SECRET_MANAGER_AVAILABLE = True
except ImportError:
    SECRET_MANAGER_AVAILABLE = False

logger = logging.getLogger(__name__)


class SecretService:
    """
    Service for managing secrets using Google Cloud Secret Manager.
    Falls back to environment variables for local development.
    """
    
    def __init__(self, project_id: Optional[str] = None):
        """
        Initialize Secret Service.
        
        Args:
            project_id: GCP Project ID (defaults to GOOGLE_CLOUD_PROJECT env var)
        """
        self.project_id = project_id or os.getenv("GOOGLE_CLOUD_PROJECT") or os.getenv("GCP_PROJECT_ID")
        self.client = None
        self.use_secret_manager = False
        
        if SECRET_MANAGER_AVAILABLE and self.project_id:
            try:
                self.client = secretmanager.SecretManagerServiceClient()
                self.use_secret_manager = True
                logger.info(f"Secret Manager initialized for project: {self.project_id}")
            except Exception as e:
                logger.warning(f"Failed to initialize Secret Manager: {e}. Using environment variables.")
                self.use_secret_manager = False
        else:
            logger.info("Secret Manager not available or project_id not set. Using environment variables.")
            self.use_secret_manager = False
    
    def get_secret(self, secret_name: str, default: Optional[str] = None) -> Optional[str]:
        """
        Get secret value from Secret Manager or environment variable.
        
        Args:
            secret_name: Name of the secret (e.g., 'api-key-vertex-ai')
            default: Default value if secret not found
            
        Returns:
            Secret value or default
        """
        if self.use_secret_manager:
            try:
                name = f"projects/{self.project_id}/secrets/{secret_name}/versions/latest"
                response = self.client.access_secret_version(request={"name": name})
                secret_value = response.payload.data.decode("UTF-8")
                logger.debug(f"Retrieved secret: {secret_name} from Secret Manager")
                return secret_value
            except Exception as e:
                logger.warning(f"Failed to get secret {secret_name} from Secret Manager: {e}")
                # Fallback to environment variable
                return os.getenv(secret_name.upper().replace("-", "_"), default)
        else:
            # Use environment variable
            env_var = secret_name.upper().replace("-", "_")
            value = os.getenv(env_var, default)
            if value:
                logger.debug(f"Retrieved secret: {secret_name} from environment variable {env_var}")
            return value
    
    def get_secret_or_raise(self, secret_name: str) -> str:
        """
        Get secret value, raising exception if not found.
        
        Args:
            secret_name: Name of the secret
            
        Returns:
            Secret value
            
        Raises:
            ValueError: If secret not found
        """
        value = self.get_secret(secret_name)
        if not value:
            raise ValueError(f"Secret '{secret_name}' not found in Secret Manager or environment variables")
        return value
    
    def create_secret(self, secret_name: str, secret_value: str) -> bool:
        """
        Create or update secret in Secret Manager.
        
        Args:
            secret_name: Name of the secret
            secret_value: Value to store
            
        Returns:
            True if successful
        """
        if not self.use_secret_manager:
            logger.warning("Secret Manager not available. Cannot create secret.")
            return False
        
        try:
            # Check if secret exists
            parent = f"projects/{self.project_id}"
            secret_path = f"{parent}/secrets/{secret_name}"
            
            try:
                # Try to get existing secret
                self.client.get_secret(request={"name": secret_path})
                # Secret exists - add new version
                parent_secret = secret_path
            except Exception:
                # Secret doesn't exist - create it
                secret = self.client.create_secret(
                    request={
                        "parent": parent,
                        "secret_id": secret_name,
                        "secret": {"replication": {"automatic": {}}},
                    }
                )
                parent_secret = secret.name
            
            # Add secret version
            self.client.add_secret_version(
                request={
                    "parent": parent_secret,
                    "payload": {"data": secret_value.encode("UTF-8")},
                }
            )
            
            logger.info(f"Created/updated secret: {secret_name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to create secret {secret_name}: {e}")
            return False


# Singleton instance
_secret_service: Optional[SecretService] = None


def get_secret_service(project_id: Optional[str] = None) -> SecretService:
    """Get or create secret service instance."""
    global _secret_service
    if _secret_service is None:
        _secret_service = SecretService(project_id=project_id)
    return _secret_service


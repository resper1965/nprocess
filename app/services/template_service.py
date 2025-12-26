"""
Process template service for n.process.
"""
import logging
import re
from datetime import datetime
from typing import Dict, List, Optional, Any

from google.cloud import firestore

from app.schemas_templates import (
    ProcessTemplateCreate,
    ProcessTemplateUpdate,
    ProcessTemplate,
    ProcessTemplateInstantiate,
    ProcessTemplatePreview,
    TemplateVariable,
)


logger = logging.getLogger(__name__)


# ============================================================================
# Constants
# ============================================================================

PROCESS_TEMPLATES_COLLECTION = "process_templates"
VARIABLE_PATTERN = re.compile(r'\{\{(\w+)\}\}')


# ============================================================================
# Template Service
# ============================================================================

class TemplateService:
    """Service for managing process templates."""
    
    def __init__(self, project_id: Optional[str] = None):
        """
        Initialize template service.
        
        Args:
            project_id: GCP project ID
        """
        try:
            if project_id:
                self.db = firestore.Client(project=project_id)
            else:
                self.db = firestore.Client()
            
            logger.info("TemplateService initialized")
        except Exception as e:
            logger.error(f"Error initializing TemplateService: {e}")
            raise
    
    def _extract_variables(self, template_data: Dict[str, Any]) -> List[str]:
        """
        Extract variable names from template data.
        
        Args:
            template_data: Template data with variables
            
        Returns:
            List of variable names found
        """
        variables = set()
        
        def extract_from_value(value: Any) -> None:
            """Recursively extract variables from nested structures."""
            if isinstance(value, str):
                # Find all {{variable}} patterns
                matches = VARIABLE_PATTERN.findall(value)
                variables.update(matches)
            elif isinstance(value, dict):
                for v in value.values():
                    extract_from_value(v)
            elif isinstance(value, list):
                for item in value:
                    extract_from_value(item)
        
        extract_from_value(template_data)
        return sorted(list(variables))
    
    def _substitute_variables(
        self,
        template_data: Dict[str, Any],
        variables: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Substitute variables in template data.
        
        Args:
            template_data: Template data with variables
            variables: Variable values
            
        Returns:
            Instantiated data with variables substituted
        """
        def substitute_value(value: Any) -> Any:
            """Recursively substitute variables in nested structures."""
            if isinstance(value, str):
                # Substitute all {{variable}} patterns
                result = value
                for var_name, var_value in variables.items():
                    pattern = f'{{{{{var_name}}}}}'
                    result = result.replace(pattern, str(var_value))
                return result
            elif isinstance(value, dict):
                return {k: substitute_value(v) for k, v in value.items()}
            elif isinstance(value, list):
                return [substitute_value(item) for item in value]
            else:
                return value
        
        return substitute_value(template_data)
    
    async def create_template(
        self,
        api_key_id: str,
        request: ProcessTemplateCreate
    ) -> ProcessTemplate:
        """
        Create a new process template.
        
        Args:
            api_key_id: API key ID of the creator
            request: Template creation request
            
        Returns:
            ProcessTemplate
        """
        try:
            # Extract variables from template_data if not provided
            if not request.variables:
                variable_names = self._extract_variables(request.template_data)
                request.variables = [
                    TemplateVariable(
                        name=name,
                        type="string",
                        required=True
                    )
                    for name in variable_names
                ]
            
            # Prepare template data
            now = datetime.utcnow()
            template_data = {
                "name": request.name,
                "description": request.description,
                "category": request.category,
                "tags": request.tags,
                "template_data": request.template_data,
                "variables": [v.model_dump() for v in request.variables],
                "public": request.public,
                "created_by": api_key_id,
                "created_at": now,
                "updated_at": now,
                "usage_count": 0,
            }
            
            # Store in Firestore
            doc_ref = self.db.collection(PROCESS_TEMPLATES_COLLECTION).document()
            doc_ref.set(template_data)
            
            template_id = doc_ref.id
            
            logger.info(f"Template created: {template_id} by {api_key_id}")
            
            return ProcessTemplate(
                id=template_id,
                name=request.name,
                description=request.description,
                category=request.category,
                tags=request.tags,
                template_data=request.template_data,
                variables=request.variables,
                public=request.public,
                created_by=api_key_id,
                created_at=now,
                updated_at=now,
                usage_count=0,
            )
            
        except Exception as e:
            logger.error(f"Error creating template: {e}")
            raise
    
    async def list_templates(
        self,
        category: Optional[str] = None,
        public_only: bool = False,
        api_key_id: Optional[str] = None,
        limit: int = 50,
        page: int = 1
    ) -> List[ProcessTemplate]:
        """
        List process templates.
        
        Args:
            category: Filter by category
            public_only: Only return public templates
            api_key_id: Filter by creator (if provided)
            limit: Maximum number of results
            page: Page number (1-based)
            
        Returns:
            List of ProcessTemplate
        """
        try:
            query = self.db.collection(PROCESS_TEMPLATES_COLLECTION)
            
            if category:
                query = query.where("category", "==", category)
            
            if public_only:
                query = query.where("public", "==", True)
            elif api_key_id:
                # Include public templates OR templates created by this API key
                # Firestore doesn't support OR directly, so we'll filter in Python
                pass
            
            query = query.order_by("usage_count", direction=firestore.Query.DESCENDING)
            query = query.order_by("created_at", direction=firestore.Query.DESCENDING)
            
            # Apply pagination
            offset = (page - 1) * limit
            query = query.offset(offset).limit(limit)
            
            docs = query.stream()
            
            templates = []
            for doc in docs:
                data = doc.to_dict()
                
                # Filter by creator if needed (after query)
                if api_key_id and not data.get("public") and data.get("created_by") != api_key_id:
                    continue
                
                template = ProcessTemplate(
                    id=doc.id,
                    name=data["name"],
                    description=data["description"],
                    category=data["category"],
                    tags=data.get("tags", []),
                    template_data=data["template_data"],
                    variables=[
                        TemplateVariable(**v) for v in data.get("variables", [])
                    ],
                    public=data.get("public", False),
                    created_by=data["created_by"],
                    created_at=data["created_at"],
                    updated_at=data.get("updated_at", data["created_at"]),
                    usage_count=data.get("usage_count", 0),
                )
                templates.append(template)
            
            logger.info(f"Retrieved {len(templates)} templates")
            return templates
            
        except Exception as e:
            logger.error(f"Error listing templates: {e}")
            raise
    
    async def get_template(self, template_id: str) -> Optional[ProcessTemplate]:
        """
        Get a template by ID.
        
        Args:
            template_id: Template ID
            
        Returns:
            ProcessTemplate or None if not found
        """
        try:
            doc_ref = self.db.collection(PROCESS_TEMPLATES_COLLECTION).document(template_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                return None
            
            data = doc.to_dict()
            
            return ProcessTemplate(
                id=doc.id,
                name=data["name"],
                description=data["description"],
                category=data["category"],
                tags=data.get("tags", []),
                template_data=data["template_data"],
                variables=[
                    TemplateVariable(**v) for v in data.get("variables", [])
                ],
                public=data.get("public", False),
                created_by=data["created_by"],
                created_at=data["created_at"],
                updated_at=data.get("updated_at", data["created_at"]),
                usage_count=data.get("usage_count", 0),
            )
            
        except Exception as e:
            logger.error(f"Error getting template: {e}")
            raise
    
    async def update_template(
        self,
        template_id: str,
        request: ProcessTemplateUpdate
    ) -> bool:
        """
        Update a template.
        
        Args:
            template_id: Template ID
            request: Update request
            
        Returns:
            True if updated successfully
        """
        try:
            doc_ref = self.db.collection(PROCESS_TEMPLATES_COLLECTION).document(template_id)
            
            if not doc_ref.get().exists:
                logger.warning(f"Template not found: {template_id}")
                return False
            
            update_data = {
                "updated_at": firestore.SERVER_TIMESTAMP,
            }
            
            if request.name is not None:
                update_data["name"] = request.name
            if request.description is not None:
                update_data["description"] = request.description
            if request.category is not None:
                update_data["category"] = request.category
            if request.tags is not None:
                update_data["tags"] = request.tags
            if request.template_data is not None:
                update_data["template_data"] = request.template_data
                # Re-extract variables if template_data changed
                if not request.variables:
                    variable_names = self._extract_variables(request.template_data)
                    update_data["variables"] = [
                        {"name": name, "type": "string", "required": True}
                        for name in variable_names
                    ]
            if request.variables is not None:
                update_data["variables"] = [v.model_dump() for v in request.variables]
            if request.public is not None:
                update_data["public"] = request.public
            
            doc_ref.update(update_data)
            
            logger.info(f"Template updated: {template_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating template: {e}")
            raise
    
    async def delete_template(self, template_id: str) -> bool:
        """
        Delete a template.
        
        Args:
            template_id: Template ID
            
        Returns:
            True if deleted successfully
        """
        try:
            doc_ref = self.db.collection(PROCESS_TEMPLATES_COLLECTION).document(template_id)
            
            if not doc_ref.get().exists:
                logger.warning(f"Template not found: {template_id}")
                return False
            
            doc_ref.delete()
            
            logger.info(f"Template deleted: {template_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting template: {e}")
            raise
    
    async def instantiate_template(
        self,
        template_id: str,
        request: ProcessTemplateInstantiate
    ) -> Dict[str, Any]:
        """
        Instantiate a template into a process.
        
        Args:
            template_id: Template ID
            request: Instantiation request with variables
            
        Returns:
            Instantiated process data
        """
        try:
            # Get template
            template = await self.get_template(template_id)
            if not template:
                raise ValueError(f"Template not found: {template_id}")
            
            # Validate required variables
            required_vars = {v.name for v in template.variables if v.required}
            provided_vars = set(request.variables.keys())
            missing_vars = required_vars - provided_vars
            
            if missing_vars:
                raise ValueError(
                    f"Missing required variables: {', '.join(missing_vars)}"
                )
            
            # Substitute variables
            instantiated_data = self._substitute_variables(
                template.template_data,
                request.variables
            )
            
            # Override name if provided
            if request.process_name:
                instantiated_data["name"] = request.process_name
            
            # Increment usage count
            doc_ref = self.db.collection(PROCESS_TEMPLATES_COLLECTION).document(template_id)
            doc_ref.update({
                "usage_count": firestore.Increment(1)
            })
            
            logger.info(f"Template {template_id} instantiated")
            
            return instantiated_data
            
        except Exception as e:
            logger.error(f"Error instantiating template: {e}")
            raise
    
    async def preview_template(
        self,
        template_id: str,
        variables: Dict[str, Any]
    ) -> ProcessTemplatePreview:
        """
        Preview instantiated template without saving.
        
        Args:
            template_id: Template ID
            variables: Variable values
            
        Returns:
            ProcessTemplatePreview
        """
        try:
            # Get template
            template = await self.get_template(template_id)
            if not template:
                raise ValueError(f"Template not found: {template_id}")
            
            # Check for missing required variables
            required_vars = {v.name for v in template.variables if v.required}
            provided_vars = set(variables.keys())
            missing_vars = list(required_vars - provided_vars)
            
            # Substitute variables (use defaults for missing optional ones)
            all_variables = variables.copy()
            for var in template.variables:
                if var.name not in all_variables and var.default_value:
                    all_variables[var.name] = var.default_value
            
            instantiated_data = self._substitute_variables(
                template.template_data,
                all_variables
            )
            
            return ProcessTemplatePreview(
                template_id=template_id,
                template_name=template.name,
                instantiated_data=instantiated_data,
                missing_variables=missing_vars,
                preview_only=True
            )
            
        except Exception as e:
            logger.error(f"Error previewing template: {e}")
            raise


# ============================================================================
# Singleton Instance
# ============================================================================

_template_service_instance: Optional[TemplateService] = None


def get_template_service() -> TemplateService:
    """Return singleton instance of TemplateService."""
    global _template_service_instance
    if _template_service_instance is None:
        _template_service_instance = TemplateService()
    return _template_service_instance


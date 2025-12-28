import pytest
from fastapi import HTTPException
from unittest.mock import patch, MagicMock
from app.middleware.auth import require_admin, validate_api_key

@pytest.mark.asyncio
async def test_require_admin_success():
    # Mock firebase verification
    with patch("app.services.firebase_service.verify_firebase_token") as mock_verify:
        mock_verify.return_value = {"uid": "admin1", "role": "admin"}
        
        credentials = MagicMock()
        credentials.credentials = "valid_token"
        
        user = await require_admin(credentials=credentials)
        assert user["role"] == "admin"

@pytest.mark.asyncio
async def test_require_admin_forbidden():
    with patch("app.services.firebase_service.verify_firebase_token") as mock_verify:
        mock_verify.return_value = {"uid": "user1", "role": "user"}
        
        credentials = MagicMock()
        credentials.credentials = "valid_token"
        
        with pytest.raises(HTTPException) as exc:
            await require_admin(credentials=credentials)
        assert exc.value.status_code == 403

@pytest.mark.asyncio
async def test_validate_api_key_internal():
    # Test service-to-service key
    with patch.dict("os.environ", {"NPROCESS_API_KEY": "secret"}):
        is_valid = await validate_api_key(credentials=None, x_api_key="secret")
        assert is_valid is True

@pytest.mark.asyncio
async def test_validate_api_key_invalid():
    with patch.dict("os.environ", {"NPROCESS_API_KEY": "secret"}):
        is_valid = await validate_api_key(credentials=None, x_api_key="wrong")
        assert is_valid is False

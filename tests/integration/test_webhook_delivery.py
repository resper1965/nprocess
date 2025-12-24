"""Integration tests for webhook delivery."""
import pytest
from unittest.mock import AsyncMock, patch
import httpx


@pytest.mark.asyncio
async def test_webhook_delivery_success():
    """Test successful webhook delivery."""
    from app.services.webhook_service import WebhookService

    with patch("httpx.AsyncClient.post") as mock_post:
        mock_response = httpx.Response(200, json={"status": "ok"})
        mock_post.return_value = mock_response

        service = WebhookService()
        result = await service.deliver_webhook(
            webhook_url="https://example.com/webhook",
            event_type="process.created",
            payload={"process_id": "proc123"},
            secret="test_secret"
        )

        assert result["success"] is True
        mock_post.assert_called_once()


@pytest.mark.asyncio
async def test_webhook_delivery_retry():
    """Test webhook delivery with retry."""
    from app.services.webhook_service import WebhookService

    with patch("httpx.AsyncClient.post") as mock_post:
        # First call fails, second succeeds
        mock_post.side_effect = [
            httpx.RequestError("Connection error"),
            httpx.Response(200, json={"status": "ok"})
        ]

        service = WebhookService()
        result = await service.deliver_webhook(
            webhook_url="https://example.com/webhook",
            event_type="process.created",
            payload={"process_id": "proc123"},
            secret="test_secret",
            max_retries=3
        )

        assert result["success"] is True
        assert mock_post.call_count == 2


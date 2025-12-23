"""
Notification Service
Sends alerts about regulatory updates via multiple channels
"""

import logging
from typing import List, Dict, Any
from datetime import datetime

from app.schemas import RegulatoryUpdate, ImpactAnalysis, NotificationChannel

logger = logging.getLogger(__name__)


class NotificationService:
    """
    Sends notifications about regulatory updates

    Channels supported:
    - Email
    - Slack
    - Webhook
    - Dashboard alerts
    """

    def __init__(self):
        # TODO: Initialize email, Slack clients
        logger.info("Notification Service initialized")

    async def send_notification(
        self,
        update_id: str,
        channels: List[NotificationChannel],
        recipients: List[str],
        priority: str = "normal"
    ):
        """
        Send notification to specified channels

        Args:
            update_id: ID of the regulatory update
            channels: List of notification channels
            recipients: List of recipient emails/slack IDs
            priority: normal, high, urgent
        """
        logger.info(f"Sending notification for update {update_id} via {channels}")

        for channel in channels:
            try:
                if channel == NotificationChannel.EMAIL:
                    await self._send_email(update_id, recipients, priority)

                elif channel == NotificationChannel.SLACK:
                    await self._send_slack(update_id, recipients, priority)

                elif channel == NotificationChannel.WEBHOOK:
                    await self._send_webhook(update_id, recipients, priority)

                elif channel == NotificationChannel.DASHBOARD:
                    await self._create_dashboard_alert(update_id, priority)

            except Exception as e:
                logger.error(f"Error sending notification via {channel}: {str(e)}")

    async def send_alert(self, update: RegulatoryUpdate, analysis: Dict[str, Any]):
        """
        Send alert for critical/high impact update

        Args:
            update: Regulatory update
            analysis: Analysis result from Gemini
        """
        # Determine priority
        impact_level = analysis.get("impact_level", "medium")
        priority = "urgent" if impact_level == "critical" else "high"

        # Default recipients (TODO: get from config)
        recipients = [
            "compliance@company.com",
            "ciso@company.com",
            "legal@company.com"
        ]

        subject = f"🚨 Nova Regulação {impact_level.upper()}: {update.title}"

        body = f"""
Nova atualização regulatória detectada:

**Fonte:** {update.source.value.upper()} ({update.authority})
**Título:** {update.title}
**Data de Publicação:** {update.published_date.strftime('%d/%m/%Y')}
**Nível de Impacto:** {impact_level.upper()}

**Resumo:**
{analysis.get('executive_summary', update.summary)}

**Ações Requeridas:**
{self._format_actions(analysis.get('required_actions', []))}

**Prazo de Vigência:** {update.effective_date.strftime('%d/%m/%Y') if update.effective_date else 'A definir'}

**Link:** {update.url}

---
Para análise detalhada de impacto na sua empresa, acesse o Compliance Engine Dashboard.
        """

        # Send via email (primary channel)
        await self._send_email_body(recipients, subject, body, priority)

        # Send to Slack (secondary)
        await self._send_slack_message(subject, body, priority)

        logger.info(f"Alert sent for {update.update_id}")

    async def _send_email(
        self,
        update_id: str,
        recipients: List[str],
        priority: str
    ):
        """Send email notification"""
        # TODO: Implement with SendGrid/Mailgun/SES
        logger.info(f"EMAIL: Would send to {recipients} for {update_id}")

    async def _send_email_body(
        self,
        recipients: List[str],
        subject: str,
        body: str,
        priority: str
    ):
        """Send email with custom subject and body"""
        # TODO: Implement with SendGrid/Mailgun/SES
        logger.info(f"EMAIL: {subject} to {recipients}")

    async def _send_slack(
        self,
        update_id: str,
        channels: List[str],
        priority: str
    ):
        """Send Slack notification"""
        # TODO: Implement with Slack SDK
        logger.info(f"SLACK: Would send to {channels} for {update_id}")

    async def _send_slack_message(
        self,
        title: str,
        message: str,
        priority: str
    ):
        """Send Slack message"""
        # TODO: Implement with Slack SDK
        logger.info(f"SLACK: {title}")

    async def _send_webhook(
        self,
        update_id: str,
        webhook_urls: List[str],
        priority: str
    ):
        """Send webhook notification"""
        # TODO: Implement HTTP POST to webhook URLs
        logger.info(f"WEBHOOK: Would send to {webhook_urls} for {update_id}")

    async def _create_dashboard_alert(
        self,
        update_id: str,
        priority: str
    ):
        """Create alert in dashboard"""
        # TODO: Create alert record in Firestore
        logger.info(f"DASHBOARD: Would create alert for {update_id}")

    def _format_actions(self, actions: List[str]) -> str:
        """Format action list for notification"""
        if not actions:
            return "Nenhuma ação específica identificada ainda."

        formatted = []
        for i, action in enumerate(actions, 1):
            formatted.append(f"{i}. {action}")

        return '\n'.join(formatted)

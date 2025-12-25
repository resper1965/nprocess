import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  admin.initializeApp();
}

import * as crypto from 'crypto';

/**
 * Firebase Function para entregar webhooks
 * Triggered quando um novo delivery é criado no Firestore
 */
export const deliverWebhook = functions.firestore.onDocumentCreated(
  {
    document: 'webhooks/{webhookId}/deliveries/{deliveryId}',
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const delivery = snap.data();
    const webhookId = event.params.webhookId;
    
    const webhookRef = admin.firestore()
      .collection('webhooks')
      .doc(webhookId);
    
    const webhookDoc = await webhookRef.get();
    
    if (!webhookDoc.exists) {
      console.error(`Webhook ${webhookId} não encontrado`);
      return;
    }
    
    const webhook = webhookDoc.data();
    
    if (!webhook || !webhook.active) {
      console.log(`Webhook ${webhookId} está inativo, pulando delivery`);
      return;
    }

    // Assinar payload com HMAC SHA256
    const payloadString = JSON.stringify(delivery.payload);
    const signature = crypto
      .createHmac('sha256', webhook.secret)
      .update(payloadString)
      .digest('hex');

    // Entregar webhook
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': delivery.event_type,
          'X-Webhook-Delivery-Id': event.params.deliveryId,
          'User-Agent': 'nProcess-Webhook/1.0'
        },
        body: payloadString,
        signal: AbortSignal.timeout(30000) // 30s timeout
      });

      // Atualizar status do delivery
      await snap.ref.update({
        status: response.ok ? 'delivered' : 'failed',
        delivered_at: admin.firestore.FieldValue.serverTimestamp(),
        response_status: response.status,
        response_headers: Object.fromEntries(response.headers.entries()),
        retry_count: admin.firestore.FieldValue.increment(1)
      });

      if (response.ok) {
        console.log(`Webhook ${webhookId} entregue com sucesso`);
      } else {
        console.warn(`Webhook ${webhookId} falhou com status ${response.status}`);
      }
    } catch (error: any) {
      console.error(`Erro ao entregar webhook ${webhookId}:`, error);
      
      await snap.ref.update({
        status: 'failed',
        error: error.message,
        retry_count: admin.firestore.FieldValue.increment(1)
      });
    }
  });


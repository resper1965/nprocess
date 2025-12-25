import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Firestore trigger para quando um processo é criado
 * Dispara webhooks e outras ações automáticas
 */
export const onProcessCreated = functions.firestore
  .document('processes/{processId}')
  .onCreate(async (snap, context) => {
    const process = snap.data();
    const processId = context.params.processId;
    
    console.log(`Processo criado: ${processId}`);

    // Buscar webhooks que escutam o evento 'process.created'
    const webhooksSnapshot = await admin.firestore()
      .collection('webhooks')
      .where('active', '==', true)
      .where('events', 'array-contains', 'process.created')
      .get();

    if (webhooksSnapshot.empty) {
      console.log('Nenhum webhook configurado para process.created');
      return;
    }

    // Criar deliveries para cada webhook
    const batch = admin.firestore().batch();
    let deliveryCount = 0;

    webhooksSnapshot.forEach((webhookDoc) => {
      const webhookId = webhookDoc.id;
      const deliveryRef = admin.firestore()
        .collection('webhooks')
        .doc(webhookId)
        .collection('deliveries')
        .doc();

      batch.set(deliveryRef, {
        event_type: 'process.created',
        payload: {
          process_id: processId,
          process_name: process.name,
          created_by: process.created_by,
          created_at: process.created_at,
          domain: process.domain
        },
        status: 'pending',
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });

      deliveryCount++;
    });

    if (deliveryCount > 0) {
      await batch.commit();
      console.log(`Criados ${deliveryCount} deliveries para webhooks`);
    }
  });


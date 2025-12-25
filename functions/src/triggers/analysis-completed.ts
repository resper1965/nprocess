import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Firestore trigger para quando uma análise de compliance é concluída
 * Dispara webhooks e notificações
 */
export const onAnalysisCompleted = functions.firestore.onDocumentCreated(
  {
    document: 'compliance_analyses/{analysisId}',
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const analysis = snap.data();
    const analysisId = event.params.analysisId;
    
    console.log(`Análise concluída: ${analysisId}`);

    // Buscar webhooks que escutam o evento 'analysis.completed'
    const webhooksSnapshot = await admin.firestore()
      .collection('webhooks')
      .where('active', '==', true)
      .where('events', 'array-contains', 'analysis.completed')
      .get();

    // Criar deliveries para webhooks
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
        event_type: 'analysis.completed',
        payload: {
          analysis_id: analysisId,
          process_id: analysis.process_id,
          domain: analysis.domain,
          overall_score: analysis.overall_score,
          analyzed_at: analysis.analyzed_at
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

    // Enviar notificação push (se FCM configurado)
    if (analysis.created_by) {
      try {
        const userDoc = await admin.firestore()
          .collection('users')
          .doc(analysis.created_by)
          .get();

        const fcmToken = userDoc.data()?.fcmToken;
        
        if (fcmToken) {
          await admin.messaging().send({
            token: fcmToken,
            notification: {
              title: 'Análise de Compliance Concluída',
              body: `Processo ${analysis.process_id} analisado com score ${analysis.overall_score}%`
            },
            data: {
              type: 'analysis.completed',
              analysisId: analysisId,
              processId: analysis.process_id,
              score: analysis.overall_score.toString()
            }
          });
          console.log(`Notificação push enviada para usuário ${analysis.created_by}`);
        }
      } catch (error: any) {
        console.warn(`Erro ao enviar notificação push: ${error.message}`);
      }
    }
  });


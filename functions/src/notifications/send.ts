import * as admin from 'firebase-admin';

/**
 * Função helper para enviar notificações push via FCM
 */
export async function sendComplianceNotification(
  userId: string,
  processId: string,
  score: number
): Promise<void> {
  try {
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(userId)
      .get();

    if (!userDoc.exists) {
      console.warn(`Usuário ${userId} não encontrado`);
      return;
    }

    const userData = userDoc.data();
    const fcmToken = userData?.fcmToken;

    if (!fcmToken) {
      console.log(`Usuário ${userId} não tem FCM token registrado`);
      return;
    }

    await admin.messaging().send({
      token: fcmToken,
      notification: {
        title: 'Análise de Compliance Concluída',
        body: `Processo ${processId} analisado com score ${score}%`
      },
      data: {
        type: 'compliance_analysis',
        processId: processId,
        score: score.toString()
      },
      android: {
        priority: 'high'
      },
      apns: {
        headers: {
          'apns-priority': '10'
        }
      }
    });

    console.log(`Notificação enviada para usuário ${userId}`);
  } catch (error: any) {
    console.error(`Erro ao enviar notificação: ${error.message}`);
    throw error;
  }
}


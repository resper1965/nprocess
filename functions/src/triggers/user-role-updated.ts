import * as functions from 'firebase-functions';
import { adminAuth } from '../admin';

/**
 * Firestore trigger para quando o role de um usuário é atualizado
 * Sincroniza o role para custom claims no Firebase Auth
 *
 * Custom claims são incluídas no JWT token, permitindo acesso rápido
 * nas Security Rules sem custo de leitura do Firestore
 */
export const syncUserRoleToClaims = functions.firestore
  .document('users/{userId}')
  .onWrite(async (change, context) => {
    const userId = context.params.userId;

    // Se o documento foi deletado, remove custom claims
    if (!change.after.exists) {
      try {
        await adminAuth.setCustomUserClaims(userId, null);
        console.log(`Custom claims removidas para usuário deletado: ${userId}`);
      } catch (error: any) {
        console.error(`Erro ao remover custom claims: ${error.message}`);
      }
      return;
    }

    const newData = change.after.data();
    const oldData = change.before.exists ? change.before.data() : null;

    // Verificar se o role mudou
    const newRole = newData?.role;
    const oldRole = oldData?.role;

    if (newRole === oldRole) {
      // Role não mudou, nada a fazer
      return;
    }

    // Validar role
    const validRoles = ['user', 'admin', 'super_admin'];
    if (newRole && !validRoles.includes(newRole)) {
      console.warn(`Role inválida detectada para usuário ${userId}: ${newRole}`);
      return;
    }

    try {
      // Sincronizar role para custom claims
      await adminAuth.setCustomUserClaims(userId, {
        role: newRole || 'user',
      });

      console.log(`✅ Custom claims atualizadas para usuário ${userId}:`);
      console.log(`   Role anterior: ${oldRole || 'none'}`);
      console.log(`   Role nova: ${newRole || 'user'}`);

      // Atualizar campo de metadata no Firestore
      if (newData) {
        await change.after.ref.update({
          customClaimsUpdatedAt: new Date(),
        });
      }
    } catch (error: any) {
      console.error(`❌ Erro ao atualizar custom claims para ${userId}:`, error.message);

      // Se o usuário não existe no Auth, criar log de erro
      if (error.code === 'auth/user-not-found') {
        console.warn(`Usuário ${userId} existe no Firestore mas não no Auth`);
      }
    }
  });

/**
 * Cloud Function HTTP para forçar sincronização de custom claims
 * Útil para migração ou correção de dados
 */
export const syncAllUserClaims = functions.https.onRequest(async (req, res) => {
  // Verificar autenticação (apenas admin)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Não autorizado' });
    return;
  }

  try {
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Verificar se o usuário é admin
    if (decodedToken.role !== 'admin' && decodedToken.role !== 'super_admin') {
      res.status(403).json({ error: 'Acesso negado - requer permissão de admin' });
      return;
    }

    // Buscar todos os usuários do Firestore
    const { default: admin } = await import('../admin');
    const usersSnapshot = await admin.firestore().collection('users').get();

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Sincronizar cada usuário
    for (const doc of usersSnapshot.docs) {
      try {
        const userData = doc.data();
        const role = userData.role || 'user';

        await adminAuth.setCustomUserClaims(doc.id, { role });

        // Atualizar metadata
        await doc.ref.update({
          customClaimsUpdatedAt: new Date(),
        });

        successCount++;
      } catch (error: any) {
        errorCount++;
        errors.push(`${doc.id}: ${error.message}`);
        console.error(`Erro ao sincronizar ${doc.id}:`, error.message);
      }
    }

    res.json({
      success: true,
      message: 'Sincronização de custom claims concluída',
      stats: {
        total: usersSnapshot.size,
        success: successCount,
        errors: errorCount,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Erro ao sincronizar custom claims:', error);
    res.status(500).json({
      error: 'Erro ao sincronizar custom claims',
      message: error.message,
    });
  }
});

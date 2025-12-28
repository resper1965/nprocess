/**
 * Script para definir usuário como super_admin usando Firebase Admin SDK
 * 
 * Uso:
 *   node scripts/set-super-admin-firebase.js
 * 
 * Requisitos:
 *   - GOOGLE_APPLICATION_CREDENTIALS configurado
 *   - firebase-admin instalado: npm install firebase-admin
 */

const admin = require('firebase-admin');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  // Usa Application Default Credentials (ADC)
  // No GCP: usa service account automaticamente
  // Localmente: usa GOOGLE_APPLICATION_CREDENTIALS env var
  admin.initializeApp();
}

const USER_UID = 'V1CfZSmqLyYQtp2C3yqBgcSUq9h2';

async function setSuperAdmin() {
  try {
    console.log(`🔧 Definindo usuário ${USER_UID} como super_admin...`);

    // Set custom claim - padrão do Firebase Admin SDK
    // The new custom claims will propagate to the user's ID token the
    // next time a new one is issued.
    await admin.auth().setCustomUserClaims(USER_UID, { role: 'super_admin' });
    console.log('✅ Custom claim definido no Firebase Auth');

    // Atualizar Firestore como backup
    const db = admin.firestore();
    await db.collection('users').doc(USER_UID).set({
      role: 'super_admin',
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log('✅ Role atualizado no Firestore');

    // Verificar usuário
    const user = await admin.auth().getUser(USER_UID);
    console.log('\n📋 Informações do usuário:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Display Name: ${user.displayName || 'N/A'}`);
    console.log(`   Custom Claims:`, user.customClaims);
    
    const userDoc = await db.collection('users').doc(USER_UID).get();
    if (userDoc.exists) {
      console.log(`   Firestore Role: ${userDoc.data().role}`);
    }

    console.log('\n✅ Usuário definido como super_admin com sucesso!');
    console.log('⚠️  IMPORTANTE: O usuário precisa fazer logout e login novamente');
    console.log('   para obter o novo token com os custom claims atualizados.');
    
  } catch (error) {
    console.error('❌ Erro ao definir super_admin:', error);
    if (error.code === 'auth/user-not-found') {
      console.error(`   Usuário ${USER_UID} não encontrado no Firebase Auth`);
    }
    process.exit(1);
  }
}

setSuperAdmin();


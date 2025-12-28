/**
 * Script para definir usuário como super_admin
 * Uso: node scripts/set-super-admin.js
 */

const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

const db = getFirestore();
const auth = admin.auth();

const USER_UID = 'V1CfZSmqLyYQtp2C3yqBgcSUq9h2';
const ROLE = 'super_admin';

async function setSuperAdmin() {
  try {
    console.log(`🔧 Definindo usuário ${USER_UID} como ${ROLE}...`);

    // 1. Definir custom claim no Firebase Auth
    await auth.setCustomUserClaims(USER_UID, { role: ROLE });
    console.log('✅ Custom claim definido no Firebase Auth');

    // 2. Atualizar role no Firestore
    await db.collection('users').doc(USER_UID).set({
      role: ROLE,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log('✅ Role atualizado no Firestore');

    // 3. Verificar usuário
    const user = await auth.getUser(USER_UID);
    console.log('\n📋 Informações do usuário:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Display Name: ${user.displayName || 'N/A'}`);
    console.log(`   Custom Claims:`, user.customClaims);
    
    const userDoc = await db.collection('users').doc(USER_UID).get();
    if (userDoc.exists) {
      console.log(`   Firestore Role: ${userDoc.data().role}`);
    }

    console.log('\n✅ Usuário definido como super_admin com sucesso!');
    console.log('⚠️  O usuário precisa fazer logout e login novamente para obter o novo token.');
    
  } catch (error) {
    console.error('❌ Erro ao definir super_admin:', error);
    process.exit(1);
  }
}

setSuperAdmin();


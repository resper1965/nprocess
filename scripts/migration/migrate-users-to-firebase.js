#!/usr/bin/env node
/**
 * Script para migrar usuários do PostgreSQL para Firebase Authentication
 * 
 * Uso:
 *   node scripts/migration/migrate-users-to-firebase.js
 * 
 * Requisitos:
 *   - Firebase Admin SDK configurado
 *   - PostgreSQL acessível
 *   - Variáveis de ambiente: DATABASE_URL, GOOGLE_APPLICATION_CREDENTIALS
 */

const admin = require('firebase-admin');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Inicializar Firebase Admin
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
  path.join(__dirname, '../../firebase-adminsdk.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Firebase Admin SDK credentials não encontradas!');
  console.error('   Configure GOOGLE_APPLICATION_CREDENTIALS ou coloque firebase-adminsdk.json na raiz');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath)
});

// Conectar ao PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    'postgresql://compliance:compliance_pass_2024@localhost:5432/compliance_engine'
});

const firestore = admin.firestore();

async function migrateUsers() {
  console.log('🔄 Iniciando migração de usuários...\n');

  try {
    // 1. Buscar usuários do PostgreSQL
    console.log('📊 Buscando usuários do PostgreSQL...');
    const result = await pool.query(`
      SELECT user_id, email, name, password_hash, role, is_active, 
             created_at, updated_at, last_login
      FROM users
      WHERE is_active = true
      ORDER BY created_at
    `);

    console.log(`✅ Encontrados ${result.rows.length} usuários ativos\n`);

    if (result.rows.length === 0) {
      console.log('⚠️  Nenhum usuário para migrar');
      return;
    }

    // 2. Preparar dados para importação
    const usersToImport = [];
    const userProfiles = [];

    for (const user of result.rows) {
      // Para Firebase Auth, precisamos criar usuários sem senha inicialmente
      // e depois solicitar reset de senha
      usersToImport.push({
        uid: user.user_id,
        email: user.email,
        displayName: user.name,
        emailVerified: false,
        disabled: !user.is_active,
        customClaims: {
          role: user.role,
          migrated_from: 'postgresql'
        }
      });

      // Perfil no Firestore
      userProfiles.push({
        userId: user.user_id,
        data: {
          email: user.email,
          name: user.name,
          role: user.role,
          is_active: user.is_active,
          created_at: admin.firestore.Timestamp.fromDate(new Date(user.created_at)),
          updated_at: admin.firestore.Timestamp.fromDate(new Date(user.updated_at)),
          last_login: user.last_login ? 
            admin.firestore.Timestamp.fromDate(new Date(user.last_login)) : null,
          migrated_from: 'postgresql',
          migrated_at: admin.firestore.FieldValue.serverTimestamp()
        }
      });
    }

    // 3. Importar para Firebase Auth (em batches de 1000)
    console.log('🔐 Importando usuários para Firebase Auth...');
    let imported = 0;
    for (let i = 0; i < usersToImport.length; i += 1000) {
      const batch = usersToImport.slice(i, i + 1000);
      try {
        await admin.auth().importUsers(batch, {
          hash: {
            algorithm: 'BCRYPT',
            // Nota: Se tiver os hashes originais do bcrypt, pode importá-los
            // Caso contrário, usuários precisarão resetar senha
          }
        });
        imported += batch.length;
        console.log(`   ✅ Importados ${imported}/${usersToImport.length} usuários`);
      } catch (error) {
        console.error(`   ❌ Erro ao importar batch ${i}-${i + batch.length}:`, error.message);
      }
    }

    // 4. Criar perfis no Firestore
    console.log('\n📝 Criando perfis no Firestore...');
    const batch = firestore.batch();
    let profileCount = 0;

    for (const profile of userProfiles) {
      const userRef = firestore.collection('users').doc(profile.userId);
      batch.set(userRef, profile.data);
      profileCount++;

      if (profileCount % 500 === 0) {
        await batch.commit();
        console.log(`   ✅ Criados ${profileCount}/${userProfiles.length} perfis`);
      }
    }

    if (profileCount % 500 !== 0) {
      await batch.commit();
    }

    console.log(`✅ Criados ${profileCount} perfis no Firestore\n`);

    // 5. Resumo
    console.log('📊 Resumo da migração:');
    console.log(`   - Usuários importados: ${imported}`);
    console.log(`   - Perfis criados: ${profileCount}`);
    console.log('\n⚠️  IMPORTANTE:');
    console.log('   - Usuários precisarão resetar suas senhas');
    console.log('   - Envie email de boas-vindas com link de reset');
    console.log('   - Verifique se todos os usuários foram migrados corretamente');

  } catch (error) {
    console.error('❌ Erro durante migração:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Executar migração
migrateUsers()
  .then(() => {
    console.log('\n✅ Migração concluída com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migração falhou:', error);
    process.exit(1);
  });


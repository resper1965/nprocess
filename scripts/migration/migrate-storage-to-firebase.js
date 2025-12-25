#!/usr/bin/env node
/**
 * Script para migrar arquivos do Cloud Storage para Firebase Storage
 * 
 * Uso:
 *   node scripts/migration/migrate-storage-to-firebase.js
 * 
 * Requisitos:
 *   - Firebase Admin SDK configurado
 *   - Google Cloud Storage SDK
 *   - Variáveis de ambiente: GOOGLE_APPLICATION_CREDENTIALS
 */

const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const path = require('path');

// Inicializar Firebase Admin
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
  path.join(__dirname, '../../firebase-adminsdk.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Firebase Admin SDK credentials não encontradas!');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath)
});

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'nprocess';
const SOURCE_BUCKET = process.env.SOURCE_BUCKET || `${PROJECT_ID}-backups`;
const DEST_BUCKET = admin.storage().bucket(`${PROJECT_ID}.appspot.com`);

const gcs = new Storage({ projectId: PROJECT_ID });

async function migrateStorage() {
  console.log('🔄 Iniciando migração de arquivos...\n');
  console.log(`📦 Bucket origem: ${SOURCE_BUCKET}`);
  console.log(`📦 Bucket destino: ${DEST_BUCKET.name}\n`);

  try {
    // 1. Listar arquivos no Cloud Storage
    console.log('📊 Listando arquivos no Cloud Storage...');
    const sourceBucket = gcs.bucket(SOURCE_BUCKET);
    
    // Listar todos os arquivos
    const [files] = await sourceBucket.getFiles();
    console.log(`✅ Encontrados ${files.length} arquivos\n`);

    if (files.length === 0) {
      console.log('⚠️  Nenhum arquivo para migrar');
      return;
    }

    // 2. Copiar para Firebase Storage
    console.log('📦 Copiando arquivos para Firebase Storage...');
    let copied = 0;
    let failed = 0;

    for (const file of files) {
      try {
        const destination = DEST_BUCKET.file(file.name);
        
        // Copiar arquivo
        await file.copy(destination);
        
        // Copiar metadata
        const [metadata] = await file.getMetadata();
        await destination.setMetadata({
          contentType: metadata.contentType,
          metadata: metadata.metadata || {}
        });

        copied++;
        if (copied % 10 === 0) {
          console.log(`   ✅ Copiados ${copied}/${files.length} arquivos`);
        }
      } catch (error) {
        failed++;
        console.error(`   ❌ Erro ao copiar ${file.name}:`, error.message);
      }
    }

    // 3. Resumo
    console.log('\n📊 Resumo da migração:');
    console.log(`   - Arquivos copiados: ${copied}`);
    console.log(`   - Arquivos com erro: ${failed}`);
    console.log(`   - Total: ${files.length}`);

    if (failed > 0) {
      console.log('\n⚠️  Alguns arquivos falharam. Verifique os logs acima.');
    }

  } catch (error) {
    console.error('❌ Erro durante migração:', error);
    throw error;
  }
}

// Executar migração
migrateStorage()
  .then(() => {
    console.log('\n✅ Migração concluída com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migração falhou:', error);
    process.exit(1);
  });


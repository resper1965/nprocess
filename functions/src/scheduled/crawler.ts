import * as functions from 'firebase-functions/v2';

// Initialize Firebase Admin
import * as admin from 'firebase-admin';
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Scheduled function para executar crawler diário de regulamentações
 * Executa todos os dias às 2h da manhã (horário de Brasília)
 */
export const dailyCrawler = functions.scheduler.onSchedule(
  '0 2 * * *',
  {
    timeZone: 'America/Sao_Paulo',
  },
  async (event) => {
    console.log('Iniciando crawler diário de regulamentações...');
    
    const REGULATORY_API_URL = process.env.REGULATORY_API_URL || 
      'https://regulatory-api-5wqihg7s7a-uc.a.run.app';
    const API_KEY = process.env.REGULATORY_API_KEY || '';

    try {
      const response = await fetch(`${REGULATORY_API_URL}/v1/crawlers/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          sources: ['aneel', 'ons', 'arcyber'] // Todos os sources
        })
      });

      if (!response.ok) {
        throw new Error(`Crawler API retornou status ${response.status}`);
      }

      const result = await response.json();
      console.log(`Crawler concluído: ${result.length} atualizações encontradas`);
      return;
    } catch (error: any) {
      console.error('Erro ao executar crawler:', error);
      throw error;
    }
  }
);


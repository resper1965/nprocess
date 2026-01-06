/**
 * Firebase Authentication error handling
 * Maps Firebase error codes to user-friendly messages in Portuguese
 */

import { FirebaseError } from 'firebase/app';

export interface AuthErrorInfo {
  code: string;
  message: string;
  userMessage: string;
}

/**
 * Firebase Auth error codes and their user-friendly messages
 */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // Email/Password errors
  'auth/email-already-in-use': 'Este email já está em uso. Tente fazer login ou use outro email.',
  'auth/invalid-email': 'Email inválido. Verifique o formato do email.',
  'auth/operation-not-allowed': 'Operação não permitida. Entre em contato com o suporte.',
  'auth/weak-password': 'Senha fraca. Use pelo menos 6 caracteres com letras e números.',
  'auth/user-disabled': 'Esta conta foi desabilitada. Entre em contato com o suporte.',
  'auth/user-not-found': 'Usuário não encontrado. Verifique o email ou crie uma nova conta.',
  'auth/wrong-password': 'Senha incorreta. Tente novamente ou redefina sua senha.',

  // Token/Session errors
  'auth/invalid-credential': 'Credenciais inválidas. Verifique seu email e senha.',
  'auth/expired-action-code': 'Este link expirou. Solicite um novo link.',
  'auth/invalid-action-code': 'Link inválido ou já utilizado. Solicite um novo link.',
  'auth/user-token-expired': 'Sua sessão expirou. Faça login novamente.',
  'auth/invalid-user-token': 'Sessão inválida. Faça login novamente.',
  'auth/requires-recent-login': 'Esta operação requer login recente. Faça login novamente.',

  // Account management
  'auth/account-exists-with-different-credential': 'Já existe uma conta com este email usando outro método de login.',
  'auth/credential-already-in-use': 'Estas credenciais já estão vinculadas a outra conta.',
  'auth/email-change-needs-verification': 'Verifique seu novo email antes de alterá-lo.',
  'auth/multi-factor-auth-required': 'Autenticação de dois fatores necessária.',

  // Network/Server errors
  'auth/network-request-failed': 'Erro de conexão. Verifique sua internet e tente novamente.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  'auth/internal-error': 'Erro interno do servidor. Tente novamente mais tarde.',
  'auth/timeout': 'Operação expirou. Tente novamente.',

  // Popup/Redirect errors
  'auth/popup-blocked': 'Pop-up bloqueado pelo navegador. Permita pop-ups para este site.',
  'auth/popup-closed-by-user': 'Pop-up fechado antes de completar o login.',
  'auth/cancelled-popup-request': 'Apenas um pop-up pode estar aberto por vez.',
  'auth/redirect-cancelled-by-user': 'Login cancelado pelo usuário.',
  'auth/redirect-operation-pending': 'Operação de login já em andamento.',

  // Provider errors
  'auth/invalid-oauth-provider': 'Provedor OAuth inválido.',
  'auth/invalid-oauth-client-id': 'ID do cliente OAuth inválido.',
  'auth/unauthorized-domain': 'Domínio não autorizado. Configure o domínio no Firebase Console.',

  // Phone Auth errors
  'auth/invalid-phone-number': 'Número de telefone inválido.',
  'auth/missing-phone-number': 'Número de telefone não fornecido.',
  'auth/quota-exceeded': 'Cota de SMS excedida. Tente novamente mais tarde.',
  'auth/missing-verification-code': 'Código de verificação não fornecido.',
  'auth/invalid-verification-code': 'Código de verificação inválido.',
  'auth/missing-verification-id': 'ID de verificação não fornecido.',
  'auth/invalid-verification-id': 'ID de verificação inválido.',

  // MFA errors
  'auth/invalid-multi-factor-session': 'Sessão de autenticação multifator inválida.',
  'auth/missing-multi-factor-info': 'Informações de autenticação multifator não fornecidas.',
  'auth/missing-multi-factor-session': 'Sessão de autenticação multifator não fornecida.',
  'auth/maximum-second-factor-count-exceeded': 'Número máximo de segundo fator excedido.',
  'auth/second-factor-already-in-use': 'Segundo fator já em uso.',
  'auth/unsupported-first-factor': 'Primeiro fator não suportado.',
  'auth/unsupported-persistence-type': 'Tipo de persistência não suportado.',
  'auth/unsupported-tenant-operation': 'Operação não suportada para este tenant.',
  'auth/unverified-email': 'Email não verificado. Verifique seu email antes de continuar.',
};

/**
 * Get user-friendly error message from Firebase error code
 */
export function getAuthErrorMessage(code: string): string {
  return AUTH_ERROR_MESSAGES[code] || 'Ocorreu um erro inesperado. Tente novamente.';
}

/**
 * Parse Firebase error and return structured error info
 */
export function parseFirebaseError(error: unknown): AuthErrorInfo {
  // Check if it's a Firebase error
  if (error instanceof FirebaseError) {
    return {
      code: error.code,
      message: error.message,
      userMessage: getAuthErrorMessage(error.code),
    };
  }

  // Check if it's a standard Error
  if (error instanceof Error) {
    return {
      code: 'unknown',
      message: error.message,
      userMessage: 'Ocorreu um erro inesperado. Tente novamente.',
    };
  }

  // Fallback for unknown error types
  return {
    code: 'unknown',
    message: String(error),
    userMessage: 'Ocorreu um erro inesperado. Tente novamente.',
  };
}

/**
 * Custom error class for authentication errors
 */
export class AuthenticationError extends Error {
  code: string;
  userMessage: string;

  constructor(errorInfo: AuthErrorInfo) {
    super(errorInfo.message);
    this.name = 'AuthenticationError';
    this.code = errorInfo.code;
    this.userMessage = errorInfo.userMessage;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthenticationError);
    }
  }
}

/**
 * Wrapper function to handle Firebase auth operations with proper error handling
 * @example
 * const result = await handleAuthOperation(
 *   () => signInWithEmailAndPassword(auth, email, password),
 *   'Erro ao fazer login'
 * );
 */
export async function handleAuthOperation<T>(
  operation: () => Promise<T>,
  contextMessage?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const errorInfo = parseFirebaseError(error);

    console.error(`${contextMessage || 'Auth operation failed'}:`, {
      code: errorInfo.code,
      message: errorInfo.message,
    });

    throw new AuthenticationError(errorInfo);
  }
}

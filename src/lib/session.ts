// src/lib/session.ts
'use client';

const SESSION_KEY = 'pw:session-id';

/**
 * Obtém ou cria um sessionId único para o usuário
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = localStorage.getItem(SESSION_KEY);

  if (!sessionId) {
    // Gera um ID único usando crypto.randomUUID (ou fallback)
    sessionId = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    localStorage.setItem(SESSION_KEY, sessionId);
  }

  return sessionId;
}

/**
 * Headers padrão para requests autenticados
 */
export function getAuthHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-session-id': getSessionId(),
  };
}

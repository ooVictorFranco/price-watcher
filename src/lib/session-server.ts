// src/lib/session-server.ts
import { prisma } from '@/lib/prisma';

/**
 * Obtém ou cria um usuário no banco de dados baseado no sessionId
 * Usado apenas em rotas API (server-side)
 */
export async function getOrCreateUser(sessionId: string) {
  if (!sessionId) {
    throw new Error('sessionId é obrigatório');
  }

  // Tenta encontrar usuário existente
  let user = await prisma.user.findUnique({
    where: { sessionId },
  });

  // Se não existir, cria um novo
  if (!user) {
    user = await prisma.user.create({
      data: { sessionId },
    });
    console.log(`[Session] Created new user for sessionId: ${sessionId}`);
  }

  return user;
}

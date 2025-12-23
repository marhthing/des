// System logging utilities
// logEvent, logError, etc.

import prisma from './db';

export async function logEvent(type: string, message: string) {
  await prisma.systemLog.create({
    data: { type, message },
  });
}

export async function logError(type: string, message: string) {
  await prisma.systemLog.create({
    data: { type, message },
  });
}

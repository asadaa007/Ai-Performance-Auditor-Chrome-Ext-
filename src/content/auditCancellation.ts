const controllers = new Map<string, AbortController>();

export function registerAuditCancellation(auditId: string): AbortSignal {
  const existing = controllers.get(auditId);
  if (existing) {
    existing.abort();
  }

  const controller = new AbortController();
  controllers.set(auditId, controller);
  return controller.signal;
}

export function releaseAuditCancellation(auditId: string): void {
  controllers.delete(auditId);
}

export function cancelAudit(auditId: string): void {
  controllers.get(auditId)?.abort();
  controllers.delete(auditId);
}

export function cancelAllAudits(): void {
  for (const controller of controllers.values()) {
    controller.abort();
  }
  controllers.clear();
}

export function getReportAuditId(): string | null {
  const params = new URLSearchParams(window.location.search);
  const auditId = params.get('auditId')?.trim();
  return auditId || null;
}

import { accessibilityAudits } from '@features/enterprise-audit/audits/accessibility-audits';
import { bestPracticesAudits } from '@features/enterprise-audit/audits/best-practices-audits';
import { networkAudits } from '@features/enterprise-audit/audits/network-audits';
import { performanceAudits } from '@features/enterprise-audit/audits/performance-audits';
import { securityAudits } from '@features/enterprise-audit/audits/security-audits';
import { seoAudits } from '@features/enterprise-audit/audits/seo-audits';
import { UNSUPPORTED_LIGHTHOUSE_AUDITS } from '@features/enterprise-audit/inventory/unsupported-audits';
import type { AuditDefinition, RunnableAudit } from '@features/enterprise-audit/types/audit';

export const RUNNABLE_AUDITS: RunnableAudit[] = [
  ...performanceAudits,
  ...accessibilityAudits,
  ...seoAudits,
  ...bestPracticesAudits,
  ...securityAudits,
  ...networkAudits,
];

export const ALL_AUDIT_DEFINITIONS: AuditDefinition[] = [
  ...RUNNABLE_AUDITS,
  ...UNSUPPORTED_LIGHTHOUSE_AUDITS,
];

export function getAuditDefinition(id: string): AuditDefinition | undefined {
  return ALL_AUDIT_DEFINITIONS.find((audit) => audit.id === id);
}

export function getRunnableAudit(id: string): RunnableAudit | undefined {
  return RUNNABLE_AUDITS.find((audit) => audit.id === id);
}

export const AUDIT_INVENTORY_STATS = {
  totalReviewed: ALL_AUDIT_DEFINITIONS.length,
  runnable: RUNNABLE_AUDITS.length,
  unsupported: UNSUPPORTED_LIGHTHOUSE_AUDITS.length,
  groupA: ALL_AUDIT_DEFINITIONS.filter((a) => a.group === 'A').length,
  groupB: ALL_AUDIT_DEFINITIONS.filter((a) => a.group === 'B').length,
  groupC: ALL_AUDIT_DEFINITIONS.filter((a) => a.group === 'C').length,
};

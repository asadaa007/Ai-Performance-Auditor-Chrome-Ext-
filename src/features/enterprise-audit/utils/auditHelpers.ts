import type {
  AuditDefinition,
  AuditExecutionResult,
  AuditExecutionStatus,
  RunnableAudit,
} from '@features/enterprise-audit/types/audit';

export function defineAudit<T extends RunnableAudit>(audit: T): T {
  return audit;
}

export function createUnsupportedResult(
  definition: AuditDefinition,
  executionTimeMs = 0,
): AuditExecutionResult {
  return {
    id: definition.id,
    lighthouseId: definition.lighthouseId,
    category: definition.category,
    subcategory: definition.subcategory,
    title: definition.title,
    description: definition.description,
    severity: definition.severity,
    weight: definition.weight,
    group: definition.group,
    supportLevel: 'unsupported',
    status: 'unsupported',
    pass: false,
    confidence: 'high',
    currentValue: null,
    expectedValue: null,
    threshold: null,
    unsupportedReason:
      definition.unsupportedReason ??
      'Unsupported in Extension Environment: required browser capability is unavailable.',
    missingCapability: definition.missingCapability ?? 'Unknown',
    futureImplementation:
      definition.futureImplementation ??
      'Requires Chrome DevTools Protocol, Lighthouse runner, or privileged tracing APIs.',
    limitations: definition.limitations ?? [],
    documentationRef: definition.documentationRef,
    relatedResources: definition.relatedResources,
    fixStrategy: definition.fixStrategy,
    evidence: {},
    executionTimeMs,
  };
}

export function finalizeAuditResult(
  definition: RunnableAudit,
  partial: Omit<
    AuditExecutionResult,
    | 'id'
    | 'lighthouseId'
    | 'category'
    | 'subcategory'
    | 'title'
    | 'description'
    | 'severity'
    | 'weight'
    | 'group'
    | 'supportLevel'
    | 'documentationRef'
    | 'relatedResources'
    | 'fixStrategy'
    | 'limitations'
    | 'executionTimeMs'
  >,
  executionTimeMs: number,
): AuditExecutionResult {
  const status: AuditExecutionStatus =
    partial.status === 'unsupported'
      ? 'unsupported'
      : partial.pass
        ? 'pass'
        : partial.status === 'skipped'
          ? 'skipped'
          : 'fail';

  return {
    id: definition.id,
    lighthouseId: definition.lighthouseId,
    category: definition.category,
    subcategory: definition.subcategory,
    title: definition.title,
    description: definition.description,
    severity: definition.severity,
    weight: definition.weight,
    group: definition.group,
    supportLevel: definition.supportLevel,
    documentationRef: definition.documentationRef,
    relatedResources: definition.relatedResources,
    fixStrategy: definition.fixStrategy,
    limitations: definition.limitations ?? [],
    executionTimeMs,
    ...partial,
    status,
  };
}

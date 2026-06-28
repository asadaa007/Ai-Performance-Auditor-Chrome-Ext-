export type AuditErrorCode =
  | 'AUDIT_TIMEOUT'
  | 'CONTENT_SCRIPT_UNAVAILABLE'
  | 'PERMISSION_DENIED'
  | 'MESSAGE_VALIDATION'
  | 'UNEXPECTED_COLLECTOR'
  | 'TAB_NOT_FOUND'
  | 'AUDIT_IN_PROGRESS'
  | 'PAGE_NAVIGATED'
  | 'AUDIT_CANCELLED'
  | 'UNKNOWN';

export interface SerializedAuditError {
  code: AuditErrorCode;
  name: string;
  message: string;
  details?: Record<string, unknown>;
}

export class AuditError extends Error {
  readonly code: AuditErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(code: AuditErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'AuditError';
    this.code = code;
    this.details = details;
  }

  serialize(): SerializedAuditError {
    return {
      code: this.code,
      name: this.name,
      message: this.message,
      details: this.details,
    };
  }
}

export class AuditTimeoutError extends AuditError {
  constructor(message = 'Audit collection timed out.', details?: Record<string, unknown>) {
    super('AUDIT_TIMEOUT', message, details);
    this.name = 'AuditTimeoutError';
  }
}

export class ContentScriptUnavailableError extends AuditError {
  constructor(
    message = 'Content script is not available on this page.',
    details?: Record<string, unknown>,
  ) {
    super('CONTENT_SCRIPT_UNAVAILABLE', message, details);
    this.name = 'ContentScriptUnavailableError';
  }
}

export class PermissionDeniedError extends AuditError {
  constructor(
    message = 'Permission denied for the requested operation.',
    details?: Record<string, unknown>,
  ) {
    super('PERMISSION_DENIED', message, details);
    this.name = 'PermissionDeniedError';
  }
}

export class MessageValidationError extends AuditError {
  constructor(message = 'Invalid message envelope or payload.', details?: Record<string, unknown>) {
    super('MESSAGE_VALIDATION', message, details);
    this.name = 'MessageValidationError';
  }
}

export class UnexpectedCollectorError extends AuditError {
  constructor(
    message = 'An unexpected collector error occurred.',
    details?: Record<string, unknown>,
  ) {
    super('UNEXPECTED_COLLECTOR', message, details);
    this.name = 'UnexpectedCollectorError';
  }
}

export class TabNotFoundError extends AuditError {
  constructor(message = 'Active tab could not be resolved.', details?: Record<string, unknown>) {
    super('TAB_NOT_FOUND', message, details);
    this.name = 'TabNotFoundError';
  }
}

export class PageNavigatedError extends AuditError {
  constructor(
    message = 'Audit invalidated because the page navigated.',
    details?: Record<string, unknown>,
  ) {
    super('PAGE_NAVIGATED', message, details);
    this.name = 'PageNavigatedError';
  }
}

export class AuditCancelledError extends AuditError {
  constructor(message = 'Audit was cancelled.', details?: Record<string, unknown>) {
    super('AUDIT_CANCELLED', message, details);
    this.name = 'AuditCancelledError';
  }
}

export function serializeError(error: unknown): SerializedAuditError {
  if (error instanceof AuditError) {
    return error.serialize();
  }

  if (error instanceof Error) {
    return {
      code: 'UNKNOWN',
      name: error.name,
      message: error.message,
    };
  }

  return {
    code: 'UNKNOWN',
    name: 'Error',
    message: String(error),
  };
}

export function isErrorResponse(value: unknown): value is { error: SerializedAuditError } {
  return Boolean(value && typeof value === 'object' && 'error' in value);
}

export function auditErrorFromSerialized(error: SerializedAuditError): AuditError {
  switch (error.code) {
    case 'AUDIT_TIMEOUT':
      return new AuditTimeoutError(error.message, error.details);
    case 'CONTENT_SCRIPT_UNAVAILABLE':
      return new ContentScriptUnavailableError(error.message, error.details);
    case 'PERMISSION_DENIED':
      return new PermissionDeniedError(error.message, error.details);
    case 'MESSAGE_VALIDATION':
      return new MessageValidationError(error.message, error.details);
    case 'UNEXPECTED_COLLECTOR':
      return new UnexpectedCollectorError(error.message, error.details);
    case 'TAB_NOT_FOUND':
      return new TabNotFoundError(error.message, error.details);
    case 'PAGE_NAVIGATED':
      return new PageNavigatedError(error.message, error.details);
    case 'AUDIT_CANCELLED':
      return new AuditCancelledError(error.message, error.details);
    default:
      return new AuditError(error.code, error.message, error.details);
  }
}

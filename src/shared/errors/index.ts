export type { AuditErrorCode, SerializedAuditError } from './audit-errors';

export {
  AuditCancelledError,
  AuditError,
  AuditTimeoutError,
  auditErrorFromSerialized,
  ContentScriptUnavailableError,
  isErrorResponse,
  MessageValidationError,
  PageNavigatedError,
  PermissionDeniedError,
  serializeError,
  TabNotFoundError,
  UnexpectedCollectorError,
} from './audit-errors';

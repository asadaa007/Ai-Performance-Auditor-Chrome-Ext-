/** Maximum time to wait for a full audit from the content script. */
export const AUDIT_TIMEOUT_MS = 60_000;

/** Audits older than this are removed from session storage. */
export const AUDIT_EXPIRY_MS = 30 * 60 * 1000;

export const SESSION_STORAGE_KEY = 'ai_performance_auditor_tab_audits';

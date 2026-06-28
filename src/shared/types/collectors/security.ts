export type HeaderPresence = 'present' | 'absent' | 'unknown';

export interface SecurityResult {
  isHttps: boolean;
  pageProtocol: string;
  mixedContentUrls: string[];
  mixedContentCount: number;
  hasCspMeta: boolean;
  cspMetaContent: string | null;
  responseHeaders: {
    strictTransportSecurity: HeaderPresence;
    xFrameOptions: HeaderPresence;
    xContentTypeOptions: HeaderPresence;
    referrerPolicy: HeaderPresence;
    contentSecurityPolicy: HeaderPresence;
    crossOriginOpenerPolicy: HeaderPresence;
    crossOriginEmbedderPolicy: HeaderPresence;
    crossOriginResourcePolicy: HeaderPresence;
    permissionsPolicy: HeaderPresence;
  };
  headerFetchSucceeded: boolean;
  headerFetchError: string | null;
  cookieCount: number;
  visibleInsecureCookieFlags: number;
  crossOriginIsolated: boolean;
}

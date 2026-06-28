import type { Collector } from '@content/collectors/types';
import { createEmptySecurityResult } from '@content/collectors/defaults';
import type { HeaderPresence, SecurityResult } from '@shared/types';

function readHeader(headers: Headers, name: string): HeaderPresence {
  return headers.get(name) ? 'present' : 'absent';
}

export class SecurityCollector implements Collector<SecurityResult> {
  readonly name = 'security';

  async collect(): Promise<SecurityResult> {
    const empty = createEmptySecurityResult();
    if (typeof window === 'undefined') {
      return empty;
    }

    const pageProtocol = window.location.protocol;
    const isHttps = pageProtocol === 'https:';
    const mixedContentUrls: string[] = [];

    if (isHttps) {
      for (const element of Array.from(
        document.querySelectorAll('img[src], script[src], link[href], iframe[src], video[src]'),
      )) {
        const url =
          element.getAttribute('src') ??
          element.getAttribute('href') ??
          element.getAttribute('data');
        if (url?.startsWith('http://')) {
          mixedContentUrls.push(url);
        }
      }
    }

    const cspMeta = document.querySelector(
      'meta[http-equiv="Content-Security-Policy"]',
    ) as HTMLMetaElement | null;

    let responseHeaders = empty.responseHeaders;
    let headerFetchSucceeded = false;
    let headerFetchError: string | null = null;

    try {
      const response = await fetch(window.location.href, {
        method: 'HEAD',
        credentials: 'include',
        cache: 'no-store',
      });
      headerFetchSucceeded = true;
      responseHeaders = {
        strictTransportSecurity: readHeader(response.headers, 'strict-transport-security'),
        xFrameOptions: readHeader(response.headers, 'x-frame-options'),
        xContentTypeOptions: readHeader(response.headers, 'x-content-type-options'),
        referrerPolicy: readHeader(response.headers, 'referrer-policy'),
        contentSecurityPolicy: readHeader(response.headers, 'content-security-policy'),
        crossOriginOpenerPolicy: readHeader(response.headers, 'cross-origin-opener-policy'),
        crossOriginEmbedderPolicy: readHeader(response.headers, 'cross-origin-embedder-policy'),
        crossOriginResourcePolicy: readHeader(response.headers, 'cross-origin-resource-policy'),
        permissionsPolicy: readHeader(response.headers, 'permissions-policy'),
      };
    } catch (error) {
      headerFetchError = error instanceof Error ? error.message : String(error);
    }

    const cookiePairs = document.cookie ? document.cookie.split(';') : [];
    let visibleInsecureCookieFlags = 0;
    for (const pair of cookiePairs) {
      const lower = pair.toLowerCase();
      if (!lower.includes('secure')) {
        visibleInsecureCookieFlags += 1;
      }
    }

    return {
      isHttps,
      pageProtocol,
      mixedContentUrls: mixedContentUrls.slice(0, 50),
      mixedContentCount: mixedContentUrls.length,
      hasCspMeta: Boolean(cspMeta?.content),
      cspMetaContent: cspMeta?.content ?? null,
      responseHeaders,
      headerFetchSucceeded,
      headerFetchError,
      cookieCount: cookiePairs.filter((pair) => pair.trim()).length,
      visibleInsecureCookieFlags,
      crossOriginIsolated: window.crossOriginIsolated ?? false,
    };
  }
}

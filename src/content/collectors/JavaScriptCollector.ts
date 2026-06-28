import type { Collector } from '@content/collectors/types';
import { createEmptyJavaScriptResult } from '@content/collectors/defaults';
import { isThirdPartyUrl } from '@content/utils/url';
import type { JavaScriptResult, ScriptEntry } from '@shared/types';

export class JavaScriptCollector implements Collector<JavaScriptResult> {
  readonly name = 'javascript';

  async collect(): Promise<JavaScriptResult> {
    const empty = createEmptyJavaScriptResult();

    if (typeof document === 'undefined') {
      return empty;
    }

    const pageOrigin = window.location.origin;
    const scriptElements = Array.from(document.querySelectorAll('script'));

    const scripts: ScriptEntry[] = scriptElements.map((script) => {
      const src = script.src || null;
      const isExternal = Boolean(src);
      const isThirdParty = src ? isThirdPartyUrl(src, pageOrigin) : false;
      const inlineContent = script.textContent ?? '';

      return {
        src,
        type: isExternal ? 'external' : 'inline',
        isModule: script.type === 'module',
        async: script.async,
        defer: script.defer,
        isThirdParty,
        byteSize: isExternal ? null : new Blob([inlineContent]).size,
      };
    });

    return {
      totalScripts: scripts.length,
      inlineScripts: scripts.filter((script) => script.type === 'inline').length,
      externalScripts: scripts.filter((script) => script.type === 'external').length,
      moduleScripts: scripts.filter((script) => script.isModule).length,
      asyncScripts: scripts.filter((script) => script.async).length,
      deferScripts: scripts.filter((script) => script.defer).length,
      thirdPartyScripts: scripts.filter((script) => script.isThirdParty).length,
      scripts,
    };
  }
}

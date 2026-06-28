import { allResourceUrls, technologyDetector } from '@features/fix-planner/TechnologyDetector';
import type { FrameworkProfile } from '@features/fix-planner/types';
import type { AuditResult } from '@shared/types';

const PRIMARY_ORDER = [
  'nextjs',
  'nuxt',
  'remix',
  'gatsby',
  'astro',
  'shopify',
  'wordpress',
  'webflow',
  'wix',
  'angular',
  'svelte',
  'vue',
  'react',
  'plain-html',
];

const CMS_IDS = new Set(['wordpress', 'shopify', 'webflow', 'wix']);
const UI_LIBRARY_IDS = new Set(['react', 'vue', 'angular', 'svelte']);
const CSS_FRAMEWORK_IDS = new Set(['tailwind', 'bootstrap']);

export class FrameworkDetector {
  detect(audit: AuditResult): FrameworkProfile {
    const detections = technologyDetector.detectAll(audit);
    const byId = new Map(detections.map((item) => [item.id, item]));

    const primary = PRIMARY_ORDER.find((id) => byId.has(id)) ?? detections[0]?.id ?? 'plain-html';
    const primaryDetection = byId.get(primary);

    const secondaryTechnologies = detections
      .filter((item) => item.id !== primary)
      .map((item) => item.name);

    const buildTool =
      ['vite', 'webpack', 'nextjs', 'nuxt', 'gatsby', 'remix', 'astro']
        .map((id) => byId.get(id))
        .find(Boolean)?.name ?? null;

    const cms = [...CMS_IDS].map((id) => byId.get(id)).find(Boolean)?.name ?? null;

    const uiLibrary = [...UI_LIBRARY_IDS].map((id) => byId.get(id)).find(Boolean)?.name ?? null;

    const cssFramework =
      [...CSS_FRAMEWORK_IDS].map((id) => byId.get(id)).find(Boolean)?.name ?? null;

    const analyticsProviders = audit.thirdParty.detections
      .filter((item) => item.category === 'analytics' || item.category === 'tag-manager')
      .map((item) => item.provider);

    const hostingHints = this.inferHosting(audit);

    const confidence =
      primaryDetection?.confidence ??
      (detections.length > 0 ? detections[0].confidence * 0.5 : 0.4);

    return {
      primaryFramework: primaryDetection?.name ?? 'Plain HTML',
      secondaryTechnologies,
      buildTool,
      cms,
      uiLibrary,
      cssFramework,
      analyticsProviders: [...new Set(analyticsProviders)],
      hostingHints,
      confidence: Math.min(1, Math.round(confidence * 100) / 100),
    };
  }

  private inferHosting(audit: AuditResult): string[] {
    const hints: string[] = [];
    const urls = [
      audit.meta.url,
      ...allResourceUrls(audit),
      ...audit.javascript.scripts.map((script) => script.src ?? ''),
    ];

    const patterns: Array<[RegExp, string]> = [
      [/cloudflare/i, 'Cloudflare'],
      [/cloudfront\.net/i, 'Amazon CloudFront'],
      [/akamai/i, 'Akamai'],
      [/fastly/i, 'Fastly'],
      [/vercel\.app|vercel\.com/i, 'Vercel'],
      [/netlify/i, 'Netlify'],
      [/pages\.dev/i, 'Cloudflare Pages'],
      [/firebaseapp\.com/i, 'Firebase Hosting'],
      [/azureedge\.net/i, 'Azure CDN'],
      [/googleusercontent\.com/i, 'Google CDN'],
    ];

    for (const [pattern, label] of patterns) {
      if (urls.some((url) => pattern.test(url))) {
        hints.push(label);
      }
    }

    return [...new Set(hints)];
  }
}

export const frameworkDetector = new FrameworkDetector();

import type { AuditResult } from '@shared/types';

export interface TechnologyDetection {
  id: string;
  name: string;
  confidence: number;
  evidence: string[];
}

type Detector = (audit: AuditResult) => TechnologyDetection | null;

function matchScripts(audit: AuditResult, pattern: RegExp): string[] {
  return audit.javascript.scripts
    .map((script) => script.src)
    .filter((src): src is string => Boolean(src && pattern.test(src)));
}

export function allResourceUrls(audit: AuditResult): string[] {
  const { resources } = audit;
  return [
    ...resources.jsFiles,
    ...resources.cssFiles,
    ...resources.images,
    ...resources.fonts,
    ...resources.fetchXhr,
    ...resources.slowResources,
  ].map((entry) => entry.name);
}

function matchResources(audit: AuditResult, pattern: RegExp): string[] {
  return allResourceUrls(audit).filter((name) => pattern.test(name));
}

function matchMeta(audit: AuditResult, pattern: RegExp): string[] {
  const hits: string[] = [];
  const generator = audit.metaTags.otherMeta.generator;
  if (generator && pattern.test(generator)) {
    hits.push(`meta generator: ${generator}`);
  }
  return hits;
}

const DETECTORS: Detector[] = [
  (audit) => {
    const evidence = [
      ...matchScripts(audit, /react(?:\.production|\.development)?(?:\.min)?\.js|_next\/static/i),
      ...matchResources(audit, /react/i),
    ];
    if (audit.dom.elementCounts['div'] && evidence.length > 0) {
      return { id: 'react', name: 'React', confidence: 0.85, evidence };
    }
    return evidence.length > 0 ? { id: 'react', name: 'React', confidence: 0.7, evidence } : null;
  },
  (audit) => {
    const evidence = [
      ...matchScripts(audit, /_next\/static|__NEXT_DATA__|next\/dist/i),
      ...matchResources(audit, /_next\//i),
    ];
    return evidence.length > 0
      ? { id: 'nextjs', name: 'Next.js', confidence: 0.9, evidence: evidence.slice(0, 4) }
      : null;
  },
  (audit) => {
    const evidence = matchScripts(audit, /vue(?:\.runtime)?(?:\.min)?\.js|@vue\//i);
    return evidence.length > 0
      ? { id: 'vue', name: 'Vue', confidence: 0.85, evidence: evidence.slice(0, 4) }
      : null;
  },
  (audit) => {
    const evidence = matchScripts(audit, /_nuxt\/|nuxt\.js/i);
    return evidence.length > 0
      ? { id: 'nuxt', name: 'Nuxt', confidence: 0.88, evidence: evidence.slice(0, 4) }
      : null;
  },
  (audit) => {
    const evidence = matchScripts(audit, /angular(?:\.min)?\.js|@angular\//i);
    return evidence.length > 0
      ? { id: 'angular', name: 'Angular', confidence: 0.85, evidence: evidence.slice(0, 4) }
      : null;
  },
  (audit) => {
    const evidence = matchScripts(audit, /svelte(?:\.min)?\.js|_app\/immutable/i);
    return evidence.length > 0
      ? { id: 'svelte', name: 'Svelte', confidence: 0.82, evidence: evidence.slice(0, 4) }
      : null;
  },
  (audit) => {
    const evidence = matchScripts(audit, /astro|_astro\//i);
    return evidence.length > 0
      ? { id: 'astro', name: 'Astro', confidence: 0.84, evidence: evidence.slice(0, 4) }
      : null;
  },
  (audit) => {
    const evidence = [
      ...matchScripts(audit, /wp-content|wp-includes/i),
      ...matchResources(audit, /wp-content|wp-includes/i),
      ...matchMeta(audit, /wordpress/i),
    ];
    return evidence.length > 0
      ? { id: 'wordpress', name: 'WordPress', confidence: 0.92, evidence: evidence.slice(0, 4) }
      : null;
  },
  (audit) => {
    const evidence = [...matchScripts(audit, /elementor/i), ...matchResources(audit, /elementor/i)];
    return evidence.length > 0
      ? { id: 'elementor', name: 'Elementor', confidence: 0.88, evidence: evidence.slice(0, 4) }
      : null;
  },
  (audit) => {
    const evidence = [
      ...matchScripts(audit, /woocommerce|wc-add-to-cart/i),
      ...matchResources(audit, /woocommerce/i),
    ];
    return evidence.length > 0
      ? { id: 'woocommerce', name: 'WooCommerce', confidence: 0.86, evidence: evidence.slice(0, 4) }
      : null;
  },
  (audit) => {
    const evidence = matchScripts(audit, /cdn\.shopify\.com|shopify/i);
    return evidence.length > 0
      ? { id: 'shopify', name: 'Shopify', confidence: 0.9, evidence: evidence.slice(0, 4) }
      : null;
  },
  (audit) => {
    const evidence = matchScripts(audit, /webflow\.js|assets\.website-files\.com/i);
    return evidence.length > 0
      ? { id: 'webflow', name: 'Webflow', confidence: 0.87, evidence: evidence.slice(0, 4) }
      : null;
  },
  (audit) => {
    const evidence = matchScripts(audit, /static\.wixstatic\.com|parastorage\.com|wix\.com/i);
    return evidence.length > 0
      ? { id: 'wix', name: 'Wix', confidence: 0.87, evidence: evidence.slice(0, 4) }
      : null;
  },
  (audit) => {
    const evidence = [
      ...matchScripts(audit, /bootstrap(?:\.min)?\.(?:js|css)/i),
      ...matchResources(audit, /bootstrap/i),
    ];
    return evidence.length > 0
      ? { id: 'bootstrap', name: 'Bootstrap', confidence: 0.8, evidence: evidence.slice(0, 4) }
      : null;
  },
  (audit) => {
    const evidence = matchResources(audit, /tailwind/i);
    return evidence.length > 0
      ? { id: 'tailwind', name: 'Tailwind CSS', confidence: 0.75, evidence: evidence.slice(0, 4) }
      : null;
  },
  (audit) => {
    const evidence = matchScripts(audit, /jquery(?:-\d+\.\d+\.\d+)?(?:\.min)?\.js/i);
    return evidence.length > 0
      ? { id: 'jquery', name: 'jQuery', confidence: 0.9, evidence: evidence.slice(0, 4) }
      : null;
  },
  (audit) => {
    const evidence = matchScripts(audit, /@vite\/client|vite\/dist/i);
    return evidence.length > 0
      ? { id: 'vite', name: 'Vite', confidence: 0.82, evidence: evidence.slice(0, 4) }
      : null;
  },
  (audit) => {
    const evidence = matchScripts(audit, /webpack|chunk|runtime~|main\.[a-f0-9]+\.js/i);
    return evidence.length > 0
      ? { id: 'webpack', name: 'Webpack', confidence: 0.7, evidence: evidence.slice(0, 4) }
      : null;
  },
  (audit) => {
    const evidence = matchScripts(audit, /gatsby/i);
    return evidence.length > 0
      ? { id: 'gatsby', name: 'Gatsby', confidence: 0.85, evidence: evidence.slice(0, 4) }
      : null;
  },
  (audit) => {
    const evidence = matchScripts(audit, /remix|@remix-run/i);
    return evidence.length > 0
      ? { id: 'remix', name: 'Remix', confidence: 0.84, evidence: evidence.slice(0, 4) }
      : null;
  },
];

const FRAMEWORK_DETECTOR_COUNT = DETECTORS.length;

export class TechnologyDetector {
  detectAll(audit: AuditResult): TechnologyDetection[] {
    const results: TechnologyDetection[] = [];
    const seen = new Set<string>();

    for (const detect of DETECTORS) {
      const result = detect(audit);
      if (result && !seen.has(result.id)) {
        seen.add(result.id);
        results.push(result);
      }
    }

    if (results.length === 0) {
      results.push({
        id: 'plain-html',
        name: 'Plain HTML',
        confidence: 0.6,
        evidence: ['No major framework markers detected in scripts or resources'],
      });
    }

    return results.sort((a, b) => b.confidence - a.confidence);
  }

  getDetectorCount(): number {
    return FRAMEWORK_DETECTOR_COUNT + 1;
  }
}

export const technologyDetector = new TechnologyDetector();

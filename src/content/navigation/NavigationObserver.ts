import {
  NAVIGATION_DEBOUNCE_MS,
  NAVIGATION_TRACK_HASH_CHANGES,
} from '@shared/constants/navigation';
import type { PageChangeKind } from '@shared/messaging';
import { hasPageUrlChanged } from '@content/navigation/urlCompare';

export interface PageChangeEvent {
  previousUrl: string;
  nextUrl: string;
  kind: PageChangeKind;
}

export interface NavigationObserverConfig {
  trackHashChanges?: boolean;
  debounceMs?: number;
  onPageChanged: (event: PageChangeEvent) => void;
}

/**
 * Observes client-side navigations across SPA frameworks (React, Next.js, Vue,
 * Nuxt, Angular, Svelte, Astro) via History API patching plus framework events.
 */
export class NavigationObserver {
  private readonly config: Required<NavigationObserverConfig>;
  private currentUrl: string;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingKind: PageChangeKind = 'history';
  private disposed = false;

  private readonly originalPushState: History['pushState'];
  private readonly originalReplaceState: History['replaceState'];

  private readonly onPopState = () => this.scheduleCheck('popstate');
  private readonly onHashChange = () => this.scheduleCheck('hash');
  private readonly onFrameworkNavigation = () => this.scheduleCheck('framework');
  private readonly onPageHide = () => this.stop();

  private readonly frameworkEvents = ['astro:page-load', 'astro:after-swap'] as const;

  constructor(config: NavigationObserverConfig) {
    this.config = {
      trackHashChanges: config.trackHashChanges ?? NAVIGATION_TRACK_HASH_CHANGES,
      debounceMs: config.debounceMs ?? NAVIGATION_DEBOUNCE_MS,
      onPageChanged: config.onPageChanged,
    };
    this.currentUrl = window.location.href;
    this.originalPushState = history.pushState.bind(history);
    this.originalReplaceState = history.replaceState.bind(history);
  }

  start(): void {
    if (this.disposed) {
      return;
    }

    history.pushState = (...args) => {
      this.originalPushState(...args);
      this.scheduleCheck('history');
    };

    history.replaceState = (...args) => {
      this.originalReplaceState(...args);
      this.scheduleCheck('history');
    };

    window.addEventListener('popstate', this.onPopState);
    window.addEventListener('hashchange', this.onHashChange);
    window.addEventListener('pagehide', this.onPageHide, { once: true });

    for (const eventName of this.frameworkEvents) {
      window.addEventListener(eventName, this.onFrameworkNavigation);
    }
  }

  stop(): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;

    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    history.pushState = this.originalPushState;
    history.replaceState = this.originalReplaceState;

    window.removeEventListener('popstate', this.onPopState);
    window.removeEventListener('hashchange', this.onHashChange);
    window.removeEventListener('pagehide', this.onPageHide);

    for (const eventName of this.frameworkEvents) {
      window.removeEventListener(eventName, this.onFrameworkNavigation);
    }
  }

  private scheduleCheck(kind: PageChangeKind): void {
    if (this.disposed) {
      return;
    }

    if (kind === 'hash' && !this.config.trackHashChanges) {
      return;
    }

    this.pendingKind = kind;

    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      this.emitIfChanged(this.pendingKind);
    }, this.config.debounceMs);
  }

  private emitIfChanged(kind: PageChangeKind): void {
    if (this.disposed) {
      return;
    }

    const nextUrl = window.location.href;
    const previousUrl = this.currentUrl;

    if (!hasPageUrlChanged(previousUrl, nextUrl, this.config.trackHashChanges)) {
      return;
    }

    this.currentUrl = nextUrl;
    this.config.onPageChanged({
      previousUrl,
      nextUrl,
      kind,
    });
  }
}

import type { Collector } from '@content/collectors/types';
import { createEmptyDOMResult } from '@content/collectors/defaults';
import type { DOMResult } from '@shared/types';

function walkNode(
  node: Node,
  depth: number,
  state: {
    totalNodes: number;
    maxDepth: number;
    shadowRootCount: number;
    elementCounts: Record<string, number>;
  },
): void {
  state.totalNodes += 1;
  state.maxDepth = Math.max(state.maxDepth, depth);

  if (node instanceof Element) {
    const tag = node.tagName.toLowerCase();
    state.elementCounts[tag] = (state.elementCounts[tag] ?? 0) + 1;

    if (node.shadowRoot) {
      state.shadowRootCount += 1;
      walkNode(node.shadowRoot, depth + 1, state);
    }
  }

  let child = node.firstChild;
  while (child) {
    walkNode(child, depth + 1, state);
    child = child.nextSibling;
  }
}

export class DOMCollector implements Collector<DOMResult> {
  readonly name = 'dom';

  async collect(): Promise<DOMResult> {
    const empty = createEmptyDOMResult();

    if (typeof document === 'undefined') {
      return empty;
    }

    const state = {
      totalNodes: 0,
      maxDepth: 0,
      shadowRootCount: 0,
      elementCounts: {} as Record<string, number>,
    };

    walkNode(document.documentElement, 0, state);

    return {
      totalNodes: state.totalNodes,
      maxDepth: state.maxDepth,
      scriptCount: document.querySelectorAll('script').length,
      stylesheetCount: document.querySelectorAll('link[rel="stylesheet"], style').length,
      iframeCount: document.querySelectorAll('iframe').length,
      shadowRootCount: state.shadowRootCount,
      elementCounts: state.elementCounts,
      bodyChildCount: document.body?.childElementCount ?? 0,
      documentReadyState: document.readyState ?? null,
    };
  }
}

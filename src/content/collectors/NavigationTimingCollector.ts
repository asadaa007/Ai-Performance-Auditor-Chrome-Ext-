import type { Collector } from '@content/collectors/types';
import { createEmptyNavigationTimingResult } from '@content/collectors/defaults';
import { getNavigationEntry, timingDelta } from '@content/utils/performance';
import type { NavigationTimingResult } from '@shared/types';

export class NavigationTimingCollector implements Collector<NavigationTimingResult> {
  readonly name = 'navigationTiming';

  async collect(): Promise<NavigationTimingResult> {
    const empty = createEmptyNavigationTimingResult();
    const navigation = getNavigationEntry();

    if (!navigation) {
      return empty;
    }

    return {
      dnsLookup: {
        value: timingDelta(navigation.domainLookupEnd, navigation.domainLookupStart),
        unit: 'ms',
      },
      tcpConnection: {
        value: timingDelta(navigation.connectEnd, navigation.connectStart),
        unit: 'ms',
      },
      tlsNegotiation: {
        value:
          navigation.secureConnectionStart > 0
            ? timingDelta(navigation.connectEnd, navigation.secureConnectionStart)
            : null,
        unit: 'ms',
      },
      redirectTime: {
        value: timingDelta(navigation.redirectEnd, navigation.redirectStart),
        unit: 'ms',
      },
      responseStart: {
        value: timingDelta(navigation.responseStart, navigation.requestStart),
        unit: 'ms',
      },
      responseEnd: {
        value: timingDelta(navigation.responseEnd, navigation.responseStart),
        unit: 'ms',
      },
      domInteractive: {
        value: timingDelta(navigation.domInteractive, navigation.fetchStart),
        unit: 'ms',
      },
      domComplete: {
        value: timingDelta(navigation.domComplete, navigation.fetchStart),
        unit: 'ms',
      },
      loadEvent: {
        value: timingDelta(navigation.loadEventEnd, navigation.fetchStart),
        unit: 'ms',
      },
      transferSize: navigation.transferSize ?? null,
      encodedBodySize: navigation.encodedBodySize ?? null,
      decodedBodySize: navigation.decodedBodySize ?? null,
      navigationType: navigation.type ?? null,
      protocol: navigation.nextHopProtocol ?? null,
    };
  }
}

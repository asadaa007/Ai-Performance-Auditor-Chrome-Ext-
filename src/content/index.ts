import { registerContentMessageHandlers, cancelAllAudits } from '@content/messageHandler';
import { NavigationObserver } from '@content/navigation/NavigationObserver';
import { createMessageBus } from '@shared/messaging';

const bus = createMessageBus('content');
registerContentMessageHandlers(bus);

const navigationObserver = new NavigationObserver({
  onPageChanged: (change) => {
    cancelAllAudits();

    void bus
      .send({
        type: 'AUDIT_PAGE_CHANGED',
        payload: {
          previousUrl: change.previousUrl,
          nextUrl: change.nextUrl,
          changeKind: change.kind,
          observedAt: Date.now(),
        },
        target: 'background',
        expectResponse: false,
      })
      .catch(() => undefined);
  },
});

navigationObserver.start();

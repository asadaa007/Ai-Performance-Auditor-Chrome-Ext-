import type { AuditOrchestrator } from '@background/auditOrchestrator';
import type { AuditPageChangedPayload, MessageBus } from '@shared/messaging';

export function registerNavigationRouter(bus: MessageBus, orchestrator: AuditOrchestrator): void {
  bus.on<AuditPageChangedPayload>('AUDIT_PAGE_CHANGED', async (message, sender) => {
    const tabId = message.payload.tabId ?? sender.tab?.id;
    if (!tabId) {
      return undefined;
    }

    await orchestrator.handlePageChanged(tabId, message.payload);
    return undefined;
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (!changeInfo.url) {
      return;
    }

    void orchestrator.handleTabUrlUpdated(tabId, changeInfo.url, changeInfo.status);
  });
}

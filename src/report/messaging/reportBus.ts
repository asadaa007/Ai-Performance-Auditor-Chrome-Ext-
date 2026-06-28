import { createMessageBus, type MessageBus } from '@shared/messaging';

let reportBus: MessageBus | null = null;

export function getReportMessageBus(): MessageBus {
  if (!reportBus) {
    reportBus = createMessageBus('report');
  }
  return reportBus;
}

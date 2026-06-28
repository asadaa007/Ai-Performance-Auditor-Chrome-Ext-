import { createMessageBus, type MessageBus } from '@shared/messaging';

let popupBus: MessageBus | null = null;

export function getPopupMessageBus(): MessageBus {
  if (!popupBus) {
    popupBus = createMessageBus('popup');
  }
  return popupBus;
}

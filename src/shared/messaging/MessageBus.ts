import type { MessageEndpoint, MessageEnvelope, MessageType } from '@shared/messaging/types';
import {
  assertValidMessage,
  createMessage,
  isMessageEnvelope,
} from '@shared/messaging/createMessage';

export type MessageHandler<TPayload = unknown, TResponse = unknown> = (
  message: MessageEnvelope<TPayload>,
  sender: chrome.runtime.MessageSender,
) => TResponse | Promise<TResponse>;

export class MessageBus {
  private readonly handlers = new Map<MessageType, Set<MessageHandler>>();
  private readonly listener: (
    message: unknown,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: unknown) => void,
  ) => boolean;

  constructor(private readonly endpoint: MessageEndpoint) {
    this.listener = (message, sender, sendResponse) => {
      if (!this.shouldHandle(message)) {
        return false;
      }

      void this.handleIncoming(message, sender)
        .then((response) => {
          sendResponse(response);
        })
        .catch((error: unknown) => {
          sendResponse({
            error: error instanceof Error ? error.message : String(error),
          });
        });

      return true;
    };

    chrome.runtime.onMessage.addListener(this.listener);
  }

  destroy(): void {
    chrome.runtime.onMessage.removeListener(this.listener);
    this.handlers.clear();
  }

  on<TPayload = unknown, TResponse = unknown>(
    type: MessageType,
    handler: MessageHandler<TPayload, TResponse>,
  ): () => void {
    const handlers = this.handlers.get(type) ?? new Set<MessageHandler>();
    handlers.add(handler as MessageHandler);
    this.handlers.set(type, handlers);

    return () => {
      handlers.delete(handler as MessageHandler);
      if (handlers.size === 0) {
        this.handlers.delete(type);
      }
    };
  }

  async send<TPayload, TResponse = unknown>({
    type,
    payload,
    target,
    tabId,
    expectResponse = true,
  }: {
    type: MessageType;
    payload: TPayload;
    target: MessageEndpoint;
    tabId?: number;
    expectResponse?: boolean;
  }): Promise<TResponse> {
    const message = createMessage({
      type,
      payload,
      source: this.endpoint,
      target,
    });

    if (target === 'content') {
      if (!tabId) {
        throw new Error('tabId is required when sending messages to content scripts.');
      }

      const response = await chrome.tabs.sendMessage(tabId, message);
      return this.finalizeOutgoingResponse<TResponse>(response, expectResponse);
    }

    const response = await chrome.runtime.sendMessage(message);
    return this.finalizeOutgoingResponse<TResponse>(response, expectResponse);
  }

  async broadcast<TPayload>(type: MessageType, payload: TPayload): Promise<void> {
    const message = createMessage({
      type,
      payload,
      source: this.endpoint,
      target: 'broadcast',
    });

    await chrome.runtime.sendMessage(message).catch(() => {
      // Popup may be closed; session storage retains audit state.
    });
  }

  private shouldHandle(message: unknown): boolean {
    if (!isMessageForBus(message, this.endpoint)) {
      return false;
    }

    if (!isMessageEnvelope(message)) {
      return false;
    }

    return this.handlers.has(message.type);
  }

  private async handleIncoming(
    message: unknown,
    sender: chrome.runtime.MessageSender,
  ): Promise<unknown> {
    assertValidMessage(message);

    const handlers = this.handlers.get(message.type);
    if (!handlers || handlers.size === 0) {
      return undefined;
    }

    let response: unknown;
    for (const handler of handlers) {
      response = await handler(message, sender);
    }

    return response;
  }

  private finalizeOutgoingResponse<TResponse>(
    response: unknown,
    expectResponse: boolean,
  ): TResponse {
    if (!expectResponse) {
      return undefined as TResponse;
    }

    if (response === undefined) {
      return undefined as TResponse;
    }

    if (isMessageEnvelope(response)) {
      return response.payload as TResponse;
    }

    return response as TResponse;
  }
}

function isMessageForBus(message: unknown, endpoint: MessageEndpoint): boolean {
  if (!isMessageEnvelope(message)) {
    return false;
  }

  return message.target === endpoint || message.target === 'broadcast';
}

export function createMessageBus(endpoint: MessageEndpoint): MessageBus {
  return new MessageBus(endpoint);
}

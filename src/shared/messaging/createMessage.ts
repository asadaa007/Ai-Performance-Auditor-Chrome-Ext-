import { MessageValidationError } from '@shared/errors';
import type { MessageEndpoint, MessageEnvelope, MessageType } from '@shared/messaging/types';
import { MESSAGE_ENDPOINTS, MESSAGE_TYPES } from '@shared/messaging/types';

export function createMessageId(): string {
  return crypto.randomUUID();
}

export function createMessage<TPayload>({
  type,
  payload,
  source,
  target,
}: {
  type: MessageType;
  payload: TPayload;
  source: MessageEndpoint;
  target: MessageEndpoint;
}): MessageEnvelope<TPayload> {
  return {
    id: createMessageId(),
    timestamp: Date.now(),
    type,
    payload,
    source,
    target,
  };
}

export function isMessageEnvelope(value: unknown): value is MessageEnvelope {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.timestamp === 'number' &&
    typeof candidate.type === 'string' &&
    MESSAGE_TYPES.includes(candidate.type as MessageType) &&
    typeof candidate.source === 'string' &&
    MESSAGE_ENDPOINTS.includes(candidate.source as MessageEndpoint) &&
    typeof candidate.target === 'string' &&
    MESSAGE_ENDPOINTS.includes(candidate.target as MessageEndpoint) &&
    'payload' in candidate
  );
}

export function assertValidMessage(value: unknown): asserts value is MessageEnvelope {
  if (!isMessageEnvelope(value)) {
    throw new MessageValidationError('Message envelope failed validation.', {
      value,
    });
  }
}

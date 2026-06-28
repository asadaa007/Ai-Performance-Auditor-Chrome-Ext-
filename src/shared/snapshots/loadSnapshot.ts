import {
  auditErrorFromSerialized,
  isErrorResponse,
  type SerializedAuditError,
} from '@shared/errors';
import type {
  DeleteAuditSnapshotPayload,
  DeleteAuditSnapshotResponsePayload,
  GetAuditSnapshotPayload,
  GetAuditSnapshotResponsePayload,
  ListAuditSnapshotsPayload,
  ListAuditSnapshotsResponsePayload,
  MessageBus,
} from '@shared/messaging';
import type { AuditSnapshot } from '@shared/snapshots';

function unwrapRpcResponse<T>(response: T | { error: SerializedAuditError }): T {
  if (isErrorResponse(response)) {
    throw auditErrorFromSerialized(response.error);
  }
  return response;
}

export async function loadAuditSnapshot(
  bus: MessageBus,
  auditId: string,
): Promise<AuditSnapshot | null> {
  const response = await bus.send<
    GetAuditSnapshotPayload,
    GetAuditSnapshotResponsePayload | { error: SerializedAuditError }
  >({
    type: 'GET_AUDIT_SNAPSHOT',
    payload: { auditId },
    target: 'background',
  });

  const data = unwrapRpcResponse(response);
  return data.snapshot;
}

export async function listAuditSnapshots(
  bus: MessageBus,
  limit?: number,
): Promise<ListAuditSnapshotsResponsePayload['snapshots']> {
  const response = await bus.send<
    ListAuditSnapshotsPayload,
    ListAuditSnapshotsResponsePayload | { error: SerializedAuditError }
  >({
    type: 'LIST_AUDIT_SNAPSHOTS',
    payload: { limit },
    target: 'background',
  });

  const data = unwrapRpcResponse(response);
  return data.snapshots;
}

export async function deleteAuditSnapshot(bus: MessageBus, auditId: string): Promise<boolean> {
  const response = await bus.send<
    DeleteAuditSnapshotPayload,
    DeleteAuditSnapshotResponsePayload | { error: SerializedAuditError }
  >({
    type: 'DELETE_AUDIT_SNAPSHOT',
    payload: { auditId },
    target: 'background',
  });

  const data = unwrapRpcResponse(response);
  return data.deleted;
}

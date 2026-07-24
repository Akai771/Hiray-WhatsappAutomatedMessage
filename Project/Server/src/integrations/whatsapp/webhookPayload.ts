import { LOG_STATUS, type LogStatus } from "../../shared/constants";

export interface StatusUpdate {
  whatsappMessageId: string;
  status: LogStatus;
  errorMessage?: string;
}

const STATUS_MAP: Record<string, LogStatus> = {
  sent: LOG_STATUS.SENT,
  delivered: LOG_STATUS.DELIVERED,
  read: LOG_STATUS.READ,
  failed: LOG_STATUS.FAILED,
};

/**
 * WhatsApp's webhook payload nests statuses several levels deep and batches
 * multiple entries/changes per request. Flattens it to the updates we care
 * about, silently skipping anything not a recognized status (e.g. inbound
 * message events, which this system doesn't act on).
 */
export function extractStatusUpdates(payload: unknown): StatusUpdate[] {
  const updates: StatusUpdate[] = [];

  const entries = (payload as any)?.entry;
  if (!Array.isArray(entries)) return updates;

  for (const entry of entries) {
    const changes = entry?.changes;
    if (!Array.isArray(changes)) continue;

    for (const change of changes) {
      const statuses = change?.value?.statuses;
      if (!Array.isArray(statuses)) continue;

      for (const status of statuses) {
        const mapped = STATUS_MAP[status?.status];
        if (!mapped || !status?.id) continue;

        updates.push({
          whatsappMessageId: status.id,
          status: mapped,
          errorMessage: status?.errors?.[0]?.title,
        });
      }
    }
  }

  return updates;
}

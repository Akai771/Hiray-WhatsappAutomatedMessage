import type { RecipientType } from "../../../shared/constants";
import { logger } from "../../../shared/logger";

export interface RecipientFilter {
  branchId?: string;
  courseId?: string;
  year?: number;
  semester?: number;
  audience: RecipientType[];
}

export interface Recipient {
  recipientId: string;
  recipientType: RecipientType;
  phone: string;
}

/**
 * Placeholder seam (server.md § Recipient Filtering / § Excluded Modules).
 * Student/Parent modules aren't built yet, so there's no real data source
 * for recipients. Swap this implementation for real queries against the
 * Student/Parent tables once those modules land — nothing above this layer
 * (notification service, queue, workers) should need to change.
 */
export async function resolveRecipients(filter: RecipientFilter): Promise<Recipient[]> {
  logger.warn("resolveRecipients: Student/Parent modules not implemented yet, returning no recipients", filter);
  return [];
}

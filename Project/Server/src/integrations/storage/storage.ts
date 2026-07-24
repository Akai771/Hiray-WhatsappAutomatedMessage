import { randomUUID } from "node:crypto";
import { supabaseAdmin } from "../../config/supabase";
import { env } from "../../config/env";
import { ApiError } from "../../shared/errors";
import { MEDIA_CATEGORIES, categoryForMime } from "./mediaLimits";

export interface UploadInput {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
}

export interface UploadResult {
  url: string;
  path: string;
  mimeType: string;
  sizeBytes: number;
}

export async function uploadFile({ buffer, mimeType, originalName }: UploadInput): Promise<UploadResult> {
  const category = categoryForMime(mimeType);
  if (!category) {
    throw ApiError.badRequest(`Unsupported file type: ${mimeType}`);
  }

  const { maxSizeBytes } = MEDIA_CATEGORIES[category];
  if (buffer.byteLength > maxSizeBytes) {
    throw ApiError.badRequest(
      `File exceeds max size for ${category} (${Math.floor(maxSizeBytes / (1024 * 1024))}MB)`,
    );
  }

  const extension = originalName.includes(".") ? originalName.split(".").pop() : undefined;
  const path = `${category}/${randomUUID()}${extension ? `.${extension}` : ""}`;

  const { error } = await supabaseAdmin.storage.from(env.SUPABASE_BUCKET).upload(path, buffer, {
    contentType: mimeType,
    upsert: false,
  });

  if (error) {
    throw ApiError.internal("Failed to upload file", error.message);
  }

  const { data: publicUrlData } = supabaseAdmin.storage.from(env.SUPABASE_BUCKET).getPublicUrl(path);

  return {
    url: publicUrlData.publicUrl,
    path,
    mimeType,
    sizeBytes: buffer.byteLength,
  };
}

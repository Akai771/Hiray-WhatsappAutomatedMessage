// Caps kept under WhatsApp Cloud API's own per-type media limits so an
// upload never succeeds here only to be rejected at send time.
export const MEDIA_CATEGORIES = {
  image: {
    mimeTypes: ["image/jpeg", "image/png"],
    maxSizeBytes: 5 * 1024 * 1024,
  },
  document: {
    mimeTypes: [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ],
    // Supabase Storage project-wide bucket cap is 50MB — keep in sync with
    // that dashboard setting, not just WhatsApp's own document limit.
    maxSizeBytes: 50 * 1024 * 1024,
  },
  video: {
    mimeTypes: ["video/mp4", "video/3gpp"],
    maxSizeBytes: 16 * 1024 * 1024,
  },
} as const;

export type MediaCategory = keyof typeof MEDIA_CATEGORIES;

const ALL_MIME_TYPES = new Map<string, MediaCategory>();
for (const [category, config] of Object.entries(MEDIA_CATEGORIES) as [MediaCategory, (typeof MEDIA_CATEGORIES)[MediaCategory]][]) {
  for (const mime of config.mimeTypes) ALL_MIME_TYPES.set(mime, category);
}

export function categoryForMime(mimeType: string): MediaCategory | undefined {
  return ALL_MIME_TYPES.get(mimeType);
}

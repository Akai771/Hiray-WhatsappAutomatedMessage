import { apiUpload } from "./apiClient";
import type { UploadResult } from "./types";

export async function uploadAttachment(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiUpload<UploadResult>("/uploads", formData);
  return data;
}

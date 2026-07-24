import type { Request, Response } from "express";
import { uploadFile } from "../../../integrations/storage";
import { ApiError } from "../../../shared/errors";
import { sendSuccess } from "../../../shared/responses";

export async function upload(req: Request, res: Response) {
  const file = req.file;
  if (!file) throw ApiError.badRequest("No file provided");

  const result = await uploadFile({
    buffer: file.buffer,
    mimeType: file.mimetype,
    originalName: file.originalname,
  });

  return sendSuccess(res, result, "File uploaded", 201);
}

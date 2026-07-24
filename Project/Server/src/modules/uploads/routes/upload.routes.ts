import { Router } from "express";
import multer from "multer";
import * as uploadController from "../controllers/upload.controller";
import { authenticate } from "../../../middleware";
import { MEDIA_CATEGORIES } from "../../../integrations/storage";

const MAX_UPLOAD_SIZE = Math.max(...Object.values(MEDIA_CATEGORIES).map((c) => c.maxSizeBytes));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_SIZE },
});

export const uploadRouter = Router();

uploadRouter.post("/", authenticate, upload.single("file"), uploadController.upload);

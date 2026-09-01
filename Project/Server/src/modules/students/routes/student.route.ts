import { Router } from "express";
import multer from "multer";
import * as studentController from "../controllers/student.controller";
import {
  createStudentSchema,
  updateStudentSchema,
  listStudentsQuerySchema,
  bulkDeleteStudentsSchema,
  promoteStudentsSchema,
} from "../validators/student.validators";
import { idParamSchema } from "../../../shared/validators";
import { authenticate, validate } from "../../../middleware";

const importUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const studentRouter = Router();

studentRouter.use(authenticate);

// Registered ahead of GET/POST "/:id"-shaped routes below, since Express
// would otherwise match "/import-template" against ":id".
studentRouter.get("/import-template", studentController.importTemplate);
studentRouter.post("/import", importUpload.single("file"), studentController.importStudents);

studentRouter.post("/", validate({ body: createStudentSchema }), studentController.create);
studentRouter.get("/", validate({ query: listStudentsQuerySchema }), studentController.list);
studentRouter.get("/:id", validate({ params: idParamSchema }), studentController.getById);
studentRouter.patch("/:id", validate({ params: idParamSchema, body: updateStudentSchema }), studentController.update);
studentRouter.delete("/:id", validate({ params: idParamSchema }), studentController.remove);
studentRouter.post("/bulk-delete", validate({ body: bulkDeleteStudentsSchema }), studentController.bulkRemove);
studentRouter.post("/promote", validate({ body: promoteStudentsSchema }), studentController.promote);

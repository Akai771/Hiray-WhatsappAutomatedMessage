import { Router } from "express";
import { authRouter } from "../modules/auth";
import { branchRouter } from "../modules/branches";
import { courseRouter } from "../modules/courses";
import { facultyRouter } from "../modules/faculty";
import { templateRouter } from "../modules/templates";
import { notificationRouter } from "../modules/notifications";
import { dashboardRouter } from "../modules/dashboard";
import { uploadRouter } from "../modules/uploads";
import { studentRouter } from "../modules/students";
import { parentRouter } from "../modules/parents";

export const v1Router = Router();

v1Router.use("/auth", authRouter);
v1Router.use("/branches", branchRouter);
v1Router.use("/courses", courseRouter);
v1Router.use("/faculty", facultyRouter);
v1Router.use("/templates", templateRouter);
v1Router.use("/notifications", notificationRouter);
v1Router.use("/dashboard", dashboardRouter);
v1Router.use("/uploads", uploadRouter);
v1Router.use("/students", studentRouter);
v1Router.use("/parents", parentRouter);

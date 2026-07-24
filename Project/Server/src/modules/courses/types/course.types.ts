import type { EntityStatus } from "../../../shared/constants";
import type { Semester } from "../../../shared/utils";

export interface Course {
  id: string;
  branchId: string;
  name: string;
  code: string;
  totalYears: number;
  semestersPerYear: number;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CourseWithSemesters extends Course {
  semesters: Semester[];
}

export interface CreateCourseInput {
  branchId: string;
  name: string;
  code: string;
  totalYears: number;
  semestersPerYear: number;
}

export interface UpdateCourseInput {
  name?: string;
  code?: string;
  totalYears?: number;
  semestersPerYear?: number;
  status?: EntityStatus;
}

export interface ListCoursesFilter {
  branchId?: string;
  status?: string;
}

import type { MessageForm } from "@/lib/types";
import type { ApiParent, ApiStudent } from "@/services";

interface RecipientPools {
  students: ApiStudent[];
  parents: ApiParent[];
}

export interface RecipientCount {
  students: number;
  parents: number;
  total: number;
}

export function computeRecipientCount(pools: RecipientPools, f: MessageForm): RecipientCount {
  const yearNum = f.year === "all" ? undefined : Number(f.year);
  const semesterNum = f.semester === "all" ? undefined : Number(f.semester);

  const matchedStudents = pools.students.filter(
    (s) =>
      (f.branchId === "all" || s.branchId === f.branchId) &&
      (f.courseId === "all" || s.courseId === f.courseId) &&
      (yearNum === undefined || s.year === yearNum) &&
      (semesterNum === undefined || s.semester === semesterNum),
  );
  const matchedStudentIds = new Set(matchedStudents.map((s) => s.id));
  const matchedParents = pools.parents.filter((p) => matchedStudentIds.has(p.linkedStudentId));

  const students = f.audience.students ? matchedStudents.length : 0;
  const parents = f.audience.parents ? matchedParents.length : 0;
  return { students, parents, total: students + parents };
}

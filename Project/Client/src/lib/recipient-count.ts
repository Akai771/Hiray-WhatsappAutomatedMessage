import type { FacultyMember, MessageForm, Student } from "@/lib/types";

interface RecipientPools {
  students: Student[];
  faculty: FacultyMember[];
}

export function computeRecipientCount(pools: RecipientPools, f: MessageForm) {
  const students = pools.students.filter(
    (s) =>
      (f.college === "all" || s.college === f.college) &&
      (f.course === "all" || s.course === f.course) &&
      (f.year === "all" || s.year === f.year) &&
      (f.division === "all" || s.division === f.division),
  );
  let count = 0;
  if (f.audience.students) count += students.length;
  if (f.audience.parents) count += students.length;
  if (f.audience.staff) count += pools.faculty.length;
  return count;
}

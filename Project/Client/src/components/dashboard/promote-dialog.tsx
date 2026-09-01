import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboard } from "@/store/dashboard-store";
import { useAuth } from "@/store/auth-store";
import { DialogFormHeader, FormSection } from "@/components/dashboard/form-section";
import { ArrowUpIcon } from "@phosphor-icons/react";

export function PromoteDialog() {
  const { state, actions } = useDashboard();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const f = state.promoteForm;

  const coursesForBranch = useMemo(
    () => (f.branchId ? state.courses.filter((c) => c.branchId === f.branchId) : []),
    [state.courses, f.branchId],
  );
  // `Course` (lib/types.ts) omits `semesters` — it's a derived, server-only
  // field the API response actually carries at runtime (ApiCourse), same
  // gap student-dialog.tsx casts around.
  const selectedCourse = useMemo(
    () => state.courses.find((c) => c.id === f.courseId) as (typeof state.courses)[number] & { semesters?: { year: number; semester: number }[] },
    [state.courses, f.courseId],
  );

  const branchItems = useMemo(() => Object.fromEntries(state.branches.map((b) => [b.id, b.name])), [state.branches]);
  const courseItems = useMemo(() => Object.fromEntries(coursesForBranch.map((c) => [c.id, c.name])), [coursesForBranch]);
  const yearOptions = useMemo(
    () => Array.from({ length: selectedCourse?.totalYears ?? 0 }, (_, i) => i + 1),
    [selectedCourse],
  );
  // Semester numbers are course-wide absolute (Year 2 Sem 1 of a 2-sem/year
  // course is semester 3, never back to 1) — reads off the course's own
  // derived semester list rather than assuming 1..semestersPerYear per year,
  // same as student-dialog.tsx.
  const semesterOptions = useMemo(() => {
    if (!selectedCourse?.semesters || !f.year) return [];
    const year = Number(f.year);
    return selectedCourse.semesters.filter((s) => s.year === year).map((s) => s.semester);
  }, [selectedCourse, f.year]);
  const yearItems = useMemo(() => Object.fromEntries(yearOptions.map((y) => [String(y), `Year ${y}`])), [yearOptions]);
  const semesterItems = useMemo(() => Object.fromEntries(semesterOptions.map((s) => [String(s), `Semester ${s}`])), [semesterOptions]);

  // Mirrors the server's own next-semester math (student.service.ts) so the
  // preview can say exactly what's about to happen before it does. `semester`
  // is already course-wide absolute, so no combining with `year` needed.
  const outcome = useMemo(() => {
    if (!selectedCourse || !f.year || !f.semester) return null;
    const totalSemesters = selectedCourse.totalYears * selectedCourse.semestersPerYear;
    const nextSemester = Number(f.semester) + 1;
    if (nextSemester > totalSemesters) return { graduates: true, newYear: null, newSemester: null };
    const newYear = Math.ceil(nextSemester / selectedCourse.semestersPerYear);
    return { graduates: false, newYear, newSemester: nextSemester };
  }, [selectedCourse, f.year, f.semester]);

  const ready = !!f.courseId && !!f.year && !!f.semester;

  return (
    <Dialog open={state.showPromoteStudents} onOpenChange={(v) => !v && actions.closePromoteStudents()}>
      <DialogContent className="max-h-[88vh] max-w-130 overflow-y-auto rounded-2xl p-4 sm:p-6.5">
        <DialogFormHeader
          icon={ArrowUpIcon}
          editing={false}
          title="Promote a Class"
          subtitle="Move an entire course × year × semester cohort forward in one go — no need to select students one by one."
        />

        <div className="flex flex-col gap-4">
          <FormSection icon={ArrowUpIcon} title="Which Class" subtitle="Every active student matching all four fields is affected.">
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {isSuperAdmin && (
                <div>
                  <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">College *</Label>
                  <Select value={f.branchId} items={branchItems} onValueChange={(v) => actions.setPromoteFormField("branchId", v ?? "")}>
                    <SelectTrigger className="h-9.5 w-full text-[13.5px]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {state.branches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Course *</Label>
                <Select
                  value={f.courseId}
                  items={courseItems}
                  onValueChange={(v) => actions.setPromoteFormField("courseId", v ?? "")}
                  disabled={!f.branchId}
                >
                  <SelectTrigger className="h-9.5 w-full text-[13.5px]">
                    <SelectValue placeholder={f.branchId ? "Select" : "Select college first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {coursesForBranch.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Current Year *</Label>
                <Select
                  value={f.year}
                  items={yearItems}
                  onValueChange={(v) => actions.setPromoteFormField("year", v ?? "")}
                  disabled={!f.courseId}
                >
                  <SelectTrigger className="h-9.5 w-full text-[13.5px]">
                    <SelectValue placeholder={f.courseId ? "Select" : "Select course first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        Year {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Current Semester *</Label>
                <Select
                  value={f.semester}
                  items={semesterItems}
                  onValueChange={(v) => actions.setPromoteFormField("semester", v ?? "")}
                  disabled={!f.year}
                >
                  <SelectTrigger className="h-9.5 w-full text-[13.5px]">
                    <SelectValue placeholder={f.year ? "Select" : "Select year first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {semesterOptions.map((sem) => (
                      <SelectItem key={sem} value={String(sem)}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </FormSection>

          {ready && (
            <div className="rounded-xl border border-dashed p-4 text-[13px]">
              {state.promotePreviewLoading || state.promotePreviewCount === null ? (
                <span className="text-muted-foreground">Checking how many students match…</span>
              ) : state.promotePreviewCount === 0 ? (
                <span className="text-muted-foreground">No active students in this year/semester — nothing to promote.</span>
              ) : outcome?.graduates ? (
                <span>
                  <span className="font-extrabold">{state.promotePreviewCount}</span> active student(s) will be marked{" "}
                  <span className="font-bold text-primary">GRADUATED</span> — this was the course's final semester.
                </span>
              ) : (
                <span>
                  <span className="font-extrabold">{state.promotePreviewCount}</span> active student(s) will move to{" "}
                  <span className="font-bold text-primary">
                    Year {outcome?.newYear}, Semester {outcome?.newSemester}
                  </span>
                  .
                </span>
              )}
            </div>
          )}
        </div>

        <div className="mt-1 flex flex-wrap justify-end gap-2.5 border-t pt-4">
          <Button variant="outline" onClick={actions.closePromoteStudents} className="h-9.5 rounded-lg px-4.5 text-[13.5px] font-semibold">
            Cancel
          </Button>
          <Button
            onClick={actions.confirmPromote}
            disabled={!ready || state.promoting || state.promotePreviewCount === 0 || state.promotePreviewCount === null}
            className="h-9.5 gap-1.5 rounded-lg px-5 text-[13.5px] font-bold"
          >
            {state.promoting ? "Promoting…" : `Promote ${state.promotePreviewCount ? state.promotePreviewCount : ""} Student(s)`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

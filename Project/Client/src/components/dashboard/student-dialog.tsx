import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STUDENT_STATUS_LABEL, type StudentStatus } from "@/lib/types";
import { useDashboard } from "@/store/dashboard-store";

export function StudentDialog() {
  const { state, actions } = useDashboard();
  const f = state.studentForm;

  const coursesForBranch = useMemo(
    () => (f.branchId ? state.courses.filter((c) => c.branchId === f.branchId) : []),
    [state.courses, f.branchId],
  );

  const selectedCourse = useMemo(
    () => state.courses.find((c) => c.id === f.courseId) as (typeof state.courses)[number] & { semesters?: { year: number; semester: number }[] },
    [state.courses, f.courseId],
  );

  const yearOptions = useMemo(() => {
    const totalYears = selectedCourse?.totalYears ?? 0;
    return Array.from({ length: totalYears }, (_, i) => i + 1);
  }, [selectedCourse]);

  const semesterOptions = useMemo(() => {
    if (!selectedCourse?.semesters) return [];
    const year = Number(f.year);
    return selectedCourse.semesters.filter((s) => s.year === year).map((s) => s.semester);
  }, [selectedCourse, f.year]);

  // Select's built-in label lookup only resolves the selected value's display
  // text when handed this `items` map — without it, SelectValue just prints
  // the raw value (an id, or a bare "1"), not the SelectItem's rendered label.
  const branchItems = useMemo(() => Object.fromEntries(state.branches.map((b) => [b.id, b.name])), [state.branches]);
  const courseItems = useMemo(() => Object.fromEntries(coursesForBranch.map((c) => [c.id, c.name])), [coursesForBranch]);
  const yearItems = useMemo(() => Object.fromEntries(yearOptions.map((y) => [String(y), `Year ${y}`])), [yearOptions]);
  const semesterItems = useMemo(
    () => Object.fromEntries(semesterOptions.map((s) => [String(s), `Semester ${s}`])),
    [semesterOptions],
  );

  return (
    <Dialog open={state.showAddStudent} onOpenChange={(v) => !v && actions.closeAddStudent()}>
      <DialogContent className="max-h-[88vh] max-w-140 overflow-y-auto rounded-2xl p-4 sm:p-6.5">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-extrabold">{state.editingStudentId ? "Edit Student" : "Add Student"}</DialogTitle>
        </DialogHeader>

        <div className="mb-1 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Student Details</div>
        <div className="mb-4 grid grid-cols-1 gap-3.5">
          <div>
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Roll No *</Label>
            <Input value={f.rollNo} onChange={(e) => actions.setStudentFormField("rollNo", e.target.value)} className="h-9.5 text-[13.5px]" />
          </div>
          <div>
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Name *</Label>
            <Input value={f.name} onChange={(e) => actions.setStudentFormField("name", e.target.value)} className="h-9.5 text-[13.5px]" />
          </div>
          <div>
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Phone *</Label>
            <Input value={f.phone} onChange={(e) => actions.setStudentFormField("phone", e.target.value)} className="h-9.5 text-[13.5px]" />
          </div>
          <div>
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Email</Label>
            <Input value={f.email} onChange={(e) => actions.setStudentFormField("email", e.target.value)} className="h-9.5 text-[13.5px]" />
          </div>
          <div>
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Gender</Label>
            <Select value={f.gender} onValueChange={(v) => actions.setStudentFormField("gender", v ?? "")}>
              <SelectTrigger className="h-9.5 w-full text-[13.5px]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-1 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Academic Placement</div>
        <div className="mb-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">College *</Label>
            <Select
              value={f.branchId}
              items={branchItems}
              onValueChange={(v) => {
                actions.setStudentFormField("branchId", v ?? "");
                actions.setStudentFormField("courseId", "");
                actions.setStudentFormField("year", "");
                actions.setStudentFormField("semester", "");
              }}
            >
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
          <div>
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Course *</Label>
            <Select
              value={f.courseId}
              items={courseItems}
              onValueChange={(v) => {
                actions.setStudentFormField("courseId", v ?? "");
                actions.setStudentFormField("year", "");
                actions.setStudentFormField("semester", "");
              }}
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
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Year *</Label>
            <Select
              value={f.year}
              items={yearItems}
              onValueChange={(v) => {
                actions.setStudentFormField("year", v ?? "");
                actions.setStudentFormField("semester", "");
              }}
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
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Semester *</Label>
            <Select value={f.semester} items={semesterItems} onValueChange={(v) => actions.setStudentFormField("semester", v ?? "")} disabled={!f.year}>
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
          {state.editingStudentId && (
            <div>
              <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Status</Label>
              <Select
                value={f.status}
                items={STUDENT_STATUS_LABEL}
                onValueChange={(v) => actions.setStudentFormField("status", (v ?? "ACTIVE") as StudentStatus)}
              >
                <SelectTrigger className="h-9.5 w-full text-[13.5px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STUDENT_STATUS_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="mt-2 flex flex-wrap justify-end gap-2.5">
          <Button variant="outline" onClick={actions.closeAddStudent} className="h-9.5 rounded-lg px-4.5 text-[13.5px] font-semibold">
            Cancel
          </Button>
          <Button onClick={actions.saveStudent} disabled={state.studentsSaving} className="h-9.5 rounded-lg px-5 text-[13.5px] font-bold">
            {state.studentsSaving ? "Saving…" : "Save Student"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

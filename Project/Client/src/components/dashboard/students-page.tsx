import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { statusBadgeClass } from "@/lib/badge-styles";
import { STUDENT_STATUS_LABEL } from "@/lib/types";
import { studentsService } from "@/services";
import { useDashboard } from "@/store/dashboard-store";
import { StudentDialog } from "@/components/dashboard/student-dialog";
import { ImportDialog } from "@/components/dashboard/import-dialog";
import { PencilIcon, TrashIcon } from "@phosphor-icons/react";

export function StudentsPage() {
  const { state, actions } = useDashboard();

  const branchMap = useMemo(() => {
    const m: Record<string, string> = {};
    state.branches.forEach((b) => (m[b.id] = b.name));
    return m;
  }, [state.branches]);

  const courseMap = useMemo(() => {
    const m: Record<string, string> = {};
    state.courses.forEach((c) => (m[c.id] = c.name));
    return m;
  }, [state.courses]);

  const coursesForFilter = useMemo(
    () => (state.studentFilters.branchId === "all" ? state.courses : state.courses.filter((c) => c.branchId === state.studentFilters.branchId)),
    [state.courses, state.studentFilters.branchId],
  );

  // `items` maps are what let Select's SelectValue resolve the selected
  // value to its display label — without it, the trigger just prints the
  // raw value (an id, or a bare number) instead of the item's rendered text.
  const branchFilterItems = useMemo(() => {
    const m: Record<string, string> = { all: "All Colleges" };
    state.branches.forEach((b) => (m[b.id] = b.name));
    return m;
  }, [state.branches]);

  const courseFilterItems = useMemo(() => {
    const m: Record<string, string> = { all: "All Courses" };
    coursesForFilter.forEach((c) => (m[c.id] = c.code));
    return m;
  }, [coursesForFilter]);

  const yearFilterItems = useMemo(() => {
    const m: Record<string, string> = { all: "All Years" };
    for (let y = 1; y <= 6; y++) m[String(y)] = `Year ${y}`;
    return m;
  }, []);

  const semesterFilterItems = useMemo(() => {
    const m: Record<string, string> = { all: "All Semesters" };
    for (let s = 1; s <= 8; s++) m[String(s)] = `Semester ${s}`;
    return m;
  }, []);

  const statusFilterItems = useMemo(() => ({ all: "All Status", ...STUDENT_STATUS_LABEL }), []);

  const allSelected = state.students.length > 0 && state.students.every((s) => state.selectedStudents.includes(s.id));

  return (
    <div className="mx-auto max-w-400 px-8 py-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[22px] font-extrabold">Students</div>
          <div className="mt-0.5 text-[13px] text-muted-foreground">Manage student records and WhatsApp contact details.</div>
        </div>
        <div className="flex gap-2.5">
          <Button variant="outline" onClick={actions.openImportStudents} className="h-9.5 rounded-lg px-4.5 text-[13.5px] font-semibold">
            Import Excel
          </Button>
          <Button onClick={actions.openAddStudent} className="h-9.5 rounded-lg px-5 text-[13.5px] font-bold">
            + Add Student
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 rounded-t-2xl border border-b-0 bg-card p-4">
        <Input
          placeholder="Search name, roll no..."
          value={state.studentSearch}
          onChange={(e) => actions.setStudentSearch(e.target.value)}
          className="h-8.5 min-w-50 flex-1 text-[13px]"
        />
        <Select value={state.studentFilters.branchId} items={branchFilterItems} onValueChange={(v) => actions.setStudentFilter("branchId", v ?? "all")}>
          <SelectTrigger className="h-8.5 text-[12.5px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Colleges</SelectItem>
            {state.branches.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={state.studentFilters.courseId} items={courseFilterItems} onValueChange={(v) => actions.setStudentFilter("courseId", v ?? "all")}>
          <SelectTrigger className="h-8.5 text-[12.5px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {coursesForFilter.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={state.studentFilters.year} items={yearFilterItems} onValueChange={(v) => actions.setStudentFilter("year", v ?? "all")}>
          <SelectTrigger className="h-8.5 text-[12.5px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {[1, 2, 3, 4, 5, 6].map((y) => (
              <SelectItem key={y} value={String(y)}>
                Year {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={state.studentFilters.semester} items={semesterFilterItems} onValueChange={(v) => actions.setStudentFilter("semester", v ?? "all")}>
          <SelectTrigger className="h-8.5 text-[12.5px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Semesters</SelectItem>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <SelectItem key={s} value={String(s)}>
                Semester {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={state.studentFilters.status} items={statusFilterItems} onValueChange={(v) => actions.setStudentFilter("status", v ?? "all")}>
          <SelectTrigger className="h-8.5 text-[12.5px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(STUDENT_STATUS_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {state.selectedStudents.length > 0 && (
        <div className="flex items-center gap-3.5 border-x bg-primary/5 px-5 py-2.5">
          <div className="text-[13px] font-bold text-primary">{state.selectedStudents.length} selected</div>
          <Button size="sm" onClick={actions.messageSelectedStudents} className="h-7 rounded-md px-3 text-xs font-bold">
            Message Selected
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={actions.bulkDeleteStudents}
            className="h-7 rounded-md border-destructive/25 px-3 text-xs font-bold text-destructive"
          >
            Delete Selected
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-b-2xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-9">
                <Checkbox checked={allSelected} onCheckedChange={() => actions.toggleSelectAllStudents(state.students.map((s) => s.id))} />
              </TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Roll No</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Name</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Phone</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">College</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Course</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Year / Sem</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Div</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.studentsLoading && (
              <TableRow>
                <TableCell colSpan={10} className="py-8 text-center text-[13px] text-muted-foreground">
                  Loading students…
                </TableCell>
              </TableRow>
            )}
            {!state.studentsLoading && state.students.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="py-8 text-center text-[13px] text-muted-foreground">
                  No students found.
                </TableCell>
              </TableRow>
            )}
            {!state.studentsLoading &&
              state.students.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Checkbox checked={state.selectedStudents.includes(s.id)} onCheckedChange={() => actions.toggleStudentSelect(s.id)} />
                  </TableCell>
                  <TableCell className="text-[13px]">{s.rollNo}</TableCell>
                  <TableCell className="text-[13px] font-semibold">{s.name}</TableCell>
                  <TableCell className="text-[13px]">{s.phone}</TableCell>
                  <TableCell className="text-[13px]">{branchMap[s.branchId] ?? "—"}</TableCell>
                  <TableCell className="text-[13px]">{courseMap[s.courseId] ?? "—"}</TableCell>
                  <TableCell className="text-[13px]">
                    Y{s.year} / S{s.semester}
                  </TableCell>
                  <TableCell className="text-[13px]">{s.division || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusBadgeClass(STUDENT_STATUS_LABEL[s.status])}>
                      {STUDENT_STATUS_LABEL[s.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex flex-row items-center justify-end gap-5 mr-3">
                    <span onClick={() => actions.openEditStudent(s)} className="cursor-pointer">
                      <PencilIcon size={16} />
                    </span>
                    <span onClick={() => actions.deleteStudent(s.id)} className="cursor-pointer text-destructive">
                      <TrashIcon size={16} />
                    </span>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <StudentDialog />
      <ImportDialog
        open={state.showImportStudents}
        title="Import Students from Excel"
        confirmLabel="Import Students"
        importing={state.studentsImporting}
        onClose={actions.closeImportStudents}
        onConfirm={actions.importStudents}
        onDownloadTemplate={async () => {
          const blob = await studentsService.downloadImportTemplate();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "students-import-template.xlsx";
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        }}
      />
    </div>
  );
}

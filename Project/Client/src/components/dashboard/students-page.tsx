import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { statusBadgeClass } from "@/lib/badge-styles";
import { useDashboard } from "@/store/dashboard-store";
import { StudentDialog } from "@/components/dashboard/student-dialog";
import { ImportDialog } from "@/components/dashboard/import-dialog";

const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

export function StudentsPage() {
  const { state, actions } = useDashboard();

  const courseOptionsFlat = useMemo(() => Array.from(new Set(state.courses.map((c) => c.name))), [state.courses]);

  const filteredBase = useMemo(() => {
    const sf = state.studentFilters;
    return state.students.filter((st) => {
      const q = state.studentSearch.toLowerCase();
      const matchesSearch =
        state.studentSearch === "" ||
        st.name.toLowerCase().includes(q) ||
        st.rollNo.toLowerCase().includes(q) ||
        st.email.toLowerCase().includes(q);
      return (
        matchesSearch &&
        (sf.college === "all" || st.college === sf.college) &&
        (sf.course === "all" || st.course === sf.course) &&
        (sf.year === "all" || st.year === sf.year) &&
        (sf.division === "all" || st.division === sf.division) &&
        (sf.status === "all" || st.status === sf.status)
      );
    });
  }, [state.students, state.studentFilters, state.studentSearch]);

  const allSelected = filteredBase.length > 0 && filteredBase.every((s) => state.selectedStudents.includes(s.id));

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
          placeholder="Search name, roll no, email..."
          value={state.studentSearch}
          onChange={(e) => actions.setStudentSearch(e.target.value)}
          className="h-8.5 min-w-[200px] flex-1 text-[13px]"
        />
        <Select value={state.studentFilters.college} onValueChange={(v) => actions.setStudentFilter("college", v)}>
          <SelectTrigger className="h-8.5 text-[12.5px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Colleges</SelectItem>
            {state.branches.map((b) => (
              <SelectItem key={b.id} value={b.name}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={state.studentFilters.course} onValueChange={(v) => actions.setStudentFilter("course", v)}>
          <SelectTrigger className="h-8.5 text-[12.5px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courseOptionsFlat.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={state.studentFilters.year} onValueChange={(v) => actions.setStudentFilter("year", v)}>
          <SelectTrigger className="h-8.5 text-[12.5px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {YEAR_OPTIONS.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={state.studentFilters.division} onValueChange={(v) => actions.setStudentFilter("division", v)}>
          <SelectTrigger className="h-8.5 text-[12.5px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Divisions</SelectItem>
            {state.divisions.map((d) => (
              <SelectItem key={d} value={d}>
                Division {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={state.studentFilters.status} onValueChange={(v) => actions.setStudentFilter("status", v)}>
          <SelectTrigger className="h-8.5 text-[12.5px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Graduated">Graduated</SelectItem>
            <SelectItem value="Dropped">Dropped</SelectItem>
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
                <Checkbox checked={allSelected} onCheckedChange={() => actions.toggleSelectAllStudents(filteredBase.map((s) => s.id))} />
              </TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Roll No</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Name</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Phone</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">College</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Course</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Year</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Div</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBase.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <Checkbox checked={state.selectedStudents.includes(s.id)} onCheckedChange={() => actions.toggleStudentSelect(s.id)} />
                </TableCell>
                <TableCell className="text-[13px]">{s.rollNo}</TableCell>
                <TableCell className="text-[13px] font-semibold">{s.name}</TableCell>
                <TableCell className="text-[13px]">{s.phone}</TableCell>
                <TableCell className="text-[13px]">{s.college}</TableCell>
                <TableCell className="text-[13px]">{s.course}</TableCell>
                <TableCell className="text-[13px]">{s.year}</TableCell>
                <TableCell className="text-[13px]">{s.division}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={statusBadgeClass(s.status)}>
                    {s.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-[12.5px] whitespace-nowrap">
                  <span onClick={() => actions.openEditStudent(s)} className="mr-3 cursor-pointer font-semibold">
                    Edit
                  </span>
                  <span onClick={() => actions.deleteStudent(s.id)} className="cursor-pointer font-semibold text-destructive">
                    Delete
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
        onClose={actions.closeImportStudents}
        onConfirm={actions.importStudents}
      />
    </div>
  );
}

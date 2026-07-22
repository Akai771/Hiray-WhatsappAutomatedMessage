import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboard } from "@/store/dashboard-store";

const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

export function StudentDialog() {
  const { state, actions } = useDashboard();
  const f = state.studentForm;

  const branchMap = useMemo(() => {
    const m: Record<string, string> = {};
    state.branches.forEach((b) => (m[b.id] = b.name));
    return m;
  }, [state.branches]);

  const courseOptions = useMemo(
    () => (f.college ? state.courses.filter((c) => branchMap[c.branchId] === f.college) : []),
    [state.courses, branchMap, f.college],
  );

  return (
    <Dialog open={state.showAddStudent} onOpenChange={(v) => !v && actions.closeAddStudent()}>
      <DialogContent className="max-h-[88vh] max-w-140 overflow-y-auto rounded-2xl p-6.5">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-extrabold">{state.editingStudentId ? "Edit Student" : "Add Student"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Roll No *</Label>
            <Input value={f.rollNo} onChange={(e) => actions.setStudentFormField("rollNo", e.target.value)} className="h-9.5 text-[13.5px]" />
          </div>
          <div>
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Name *</Label>
            <Input value={f.name} onChange={(e) => actions.setStudentFormField("name", e.target.value)} className="h-9.5 text-[13.5px]" />
          </div>
          <div>
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Phone</Label>
            <Input value={f.phone} onChange={(e) => actions.setStudentFormField("phone", e.target.value)} className="h-9.5 text-[13.5px]" />
          </div>
          <div>
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Email</Label>
            <Input value={f.email} onChange={(e) => actions.setStudentFormField("email", e.target.value)} className="h-9.5 text-[13.5px]" />
          </div>
          <div>
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">College</Label>
            <Select value={f.college} onValueChange={(v) => actions.setStudentFormField("college", v)}>
              <SelectTrigger className="h-9.5 w-full text-[13.5px]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {state.branches.map((b) => (
                  <SelectItem key={b.id} value={b.name}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Course</Label>
            <Select value={f.course} onValueChange={(v) => actions.setStudentFormField("course", v)} disabled={!f.college}>
              <SelectTrigger className="h-9.5 w-full text-[13.5px]">
                <SelectValue placeholder={f.college ? "Select" : "Select college first"} />
              </SelectTrigger>
              <SelectContent>
                {courseOptions.map((c) => (
                  <SelectItem key={c.id} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Year</Label>
            <Select value={f.year} onValueChange={(v) => actions.setStudentFormField("year", v)}>
              <SelectTrigger className="h-9.5 w-full text-[13.5px]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {YEAR_OPTIONS.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Division</Label>
            <Select value={f.division} onValueChange={(v) => actions.setStudentFormField("division", v)}>
              <SelectTrigger className="h-9.5 w-full text-[13.5px]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {state.divisions.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Gender</Label>
            <Select value={f.gender} onValueChange={(v) => actions.setStudentFormField("gender", v)}>
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
          <div>
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Status</Label>
            <Select value={f.status} onValueChange={(v) => actions.setStudentFormField("status", v as typeof f.status)}>
              <SelectTrigger className="h-9.5 w-full text-[13.5px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Graduated">Graduated</SelectItem>
                <SelectItem value="Dropped">Dropped</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-2 flex justify-end gap-2.5">
          <Button variant="outline" onClick={actions.closeAddStudent} className="h-9.5 rounded-lg px-4.5 text-[13.5px] font-semibold">
            Cancel
          </Button>
          <Button onClick={actions.saveStudent} className="h-9.5 rounded-lg px-5 text-[13.5px] font-bold">
            Save Student
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

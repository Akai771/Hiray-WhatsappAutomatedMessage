import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ENTITY_STATUS_LABEL, PARENT_RELATION_LABEL, type EntityStatus, type ParentRelation } from "@/lib/types";
import { useDashboard } from "@/store/dashboard-store";

interface StudentComboItem {
  value: string;
  label: string;
}

export function ParentDialog() {
  const { state, actions } = useDashboard();
  const f = state.parentForm;

  // Local-only filter to narrow the Linked Student list — not part of the
  // saved form, since a parent's "college" is derived from their student.
  const [studentBranchFilter, setStudentBranchFilter] = useState("all");

  const branchMap = useMemo(() => Object.fromEntries(state.branches.map((b) => [b.id, b.name])), [state.branches]);

  const studentsForFilter = useMemo(
    () => (studentBranchFilter === "all" ? state.students : state.students.filter((s) => s.branchId === studentBranchFilter)),
    [state.students, studentBranchFilter],
  );

  const branchFilterItems = useMemo(() => {
    const m: Record<string, string> = { all: "All Colleges" };
    state.branches.forEach((b) => (m[b.id] = b.name));
    return m;
  }, [state.branches]);

  const studentComboItems = useMemo<StudentComboItem[]>(
    () => studentsForFilter.map((s) => ({ value: s.id, label: `${s.name} (${s.rollNo})` })),
    [studentsForFilter],
  );

  return (
    <Dialog open={state.showAddParent} onOpenChange={(v) => !v && actions.closeAddParent()}>
      <DialogContent className="max-h-[88vh] max-w-130 overflow-y-auto rounded-2xl p-6.5">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-extrabold">{state.editingParentId ? "Edit Parent" : "Add Parent"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Name *</Label>
            <Input value={f.name} onChange={(e) => actions.setParentFormField("name", e.target.value)} className="h-9.5 text-[13.5px]" />
          </div>
          <div>
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Relation</Label>
            <Select
              value={f.relation}
              items={PARENT_RELATION_LABEL}
              onValueChange={(v) => actions.setParentFormField("relation", (v ?? "") as ParentRelation | "")}
            >
              <SelectTrigger className="h-9.5 w-full text-[13.5px]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PARENT_RELATION_LABEL).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Phone *</Label>
            <Input value={f.phone} onChange={(e) => actions.setParentFormField("phone", e.target.value)} className="h-9.5 text-[13.5px]" />
          </div>
          <div>
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Email</Label>
            <Input value={f.email} onChange={(e) => actions.setParentFormField("email", e.target.value)} className="h-9.5 text-[13.5px]" />
          </div>
          <div>
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Filter by College</Label>
            <Select
              value={studentBranchFilter}
              items={branchFilterItems}
              onValueChange={(v) => setStudentBranchFilter(v ?? "all")}
            >
              <SelectTrigger className="h-9.5 w-full text-[13.5px]">
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
          </div>
          <div>
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Linked Student *</Label>
            <Combobox
              items={studentComboItems}
              value={f.linkedStudentId || null}
              onValueChange={(v) => actions.setParentFormField("linkedStudentId", (v as string | null) ?? "")}
            >
              <ComboboxInput placeholder="Search by name or roll no…" className="h-9.5 w-full text-[13.5px]" />
              <ComboboxContent>
                <ComboboxEmpty>No students found.</ComboboxEmpty>
                <ComboboxList>
                  {(item: StudentComboItem) => (
                    <ComboboxItem key={item.value} value={item.value}>
                      {item.label}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
          {f.linkedStudentId && (
            <div className="col-span-2 -mt-1.5 text-[12px] text-muted-foreground">
              College: {branchMap[state.students.find((s) => s.id === f.linkedStudentId)?.branchId ?? ""] ?? "—"}
            </div>
          )}
          {state.editingParentId && (
            <div>
              <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Status</Label>
              <Select
                value={f.status}
                items={ENTITY_STATUS_LABEL}
                onValueChange={(v) => actions.setParentFormField("status", (v ?? "ACTIVE") as EntityStatus)}
              >
                <SelectTrigger className="h-9.5 w-full text-[13.5px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ENTITY_STATUS_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <div className="mt-2 flex justify-end gap-2.5">
          <Button variant="outline" onClick={actions.closeAddParent} className="h-9.5 rounded-lg px-4.5 text-[13.5px] font-semibold">
            Cancel
          </Button>
          <Button onClick={actions.saveParent} disabled={state.parentsSaving} className="h-9.5 rounded-lg px-5 text-[13.5px] font-bold">
            {state.parentsSaving ? "Saving…" : "Save Parent"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

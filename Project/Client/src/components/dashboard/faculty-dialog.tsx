import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { API_ROLE_LABEL } from "@/lib/types";
import { useDashboard } from "@/store/dashboard-store";

export function FacultyDialog() {
  const { state, actions } = useDashboard();
  const f = state.facultyForm;
  const isEditing = !!state.editingFacultyId;

  const branchItems = useMemo(() => Object.fromEntries(state.branches.map((b) => [b.id, b.name])), [state.branches]);

  return (
    <Dialog open={state.showAddFaculty} onOpenChange={(v) => !v && actions.closeAddFaculty()}>
      <DialogContent className="max-w-120 rounded-2xl p-6.5">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-extrabold">{isEditing ? "Edit Faculty" : "Add Faculty"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3.5">
          <div>
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Name *</Label>
            <Input value={f.name} onChange={(e) => actions.setFacultyFormField("name", e.target.value)} className="h-9.5 text-[13.5px]" />
          </div>
          <div>
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Email *</Label>
            <Input
              type="email"
              value={f.email}
              disabled={isEditing}
              onChange={(e) => actions.setFacultyFormField("email", e.target.value)}
              className="h-9.5 text-[13.5px] disabled:opacity-60"
            />
          </div>
          {!isEditing && (
            <div>
              <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Password * (min 8 characters)</Label>
              <Input
                type="password"
                value={f.password}
                onChange={(e) => actions.setFacultyFormField("password", e.target.value)}
                className="h-9.5 text-[13.5px]"
              />
            </div>
          )}
          <div>
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">College {f.role === "FACULTY" ? "*" : "(optional for Super Admin)"}</Label>
            <Select value={f.branchId} items={branchItems} onValueChange={(v) => actions.setFacultyFormField("branchId", v ?? "")}>
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
          {isEditing && (
            <div>
              <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Role</Label>
              <Select
                value={f.role}
                items={API_ROLE_LABEL}
                onValueChange={(v) => actions.setFacultyFormField("role", (v ?? "FACULTY") as typeof f.role)}
              >
                <SelectTrigger className="h-9.5 w-full text-[13.5px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(API_ROLE_LABEL).map(([value, label]) => (
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
          <Button variant="outline" onClick={actions.closeAddFaculty} className="h-9.5 rounded-lg px-4.5 text-[13.5px] font-semibold">
            Cancel
          </Button>
          <Button onClick={actions.saveFaculty} disabled={state.facultySaving} className="h-9.5 rounded-lg px-5 text-[13.5px] font-bold">
            {state.facultySaving ? "Saving…" : isEditing ? "Save Changes" : "Create Account"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

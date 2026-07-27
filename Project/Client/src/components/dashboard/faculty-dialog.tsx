import { useEffect, useMemo, useState } from "react";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { API_ROLE_LABEL } from "@/lib/types";
import { generatePassword, useDashboard } from "@/store/dashboard-store";

export function FacultyDialog() {
  const { state, actions } = useDashboard();
  const f = state.facultyForm;
  const isEditing = !!state.editingFacultyId;

  const branchItems = useMemo(() => Object.fromEntries(state.branches.map((b) => [b.id, b.name])), [state.branches]);

  const [resetOpen, setResetOpen] = useState(false);
  const [resetCandidate, setResetCandidate] = useState("");
  const [resetDone, setResetDone] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    setResetOpen(false);
    setResetDone(false);
    setResetting(false);
  }, [state.editingFacultyId, state.showAddFaculty]);

  async function confirmResetPassword() {
    if (!state.editingFacultyId) return;
    setResetting(true);
    const ok = await actions.resetFacultyPassword(state.editingFacultyId, resetCandidate);
    setResetting(false);
    if (ok) setResetDone(true);
  }

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
              <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Auto-generated Password</Label>
              <div className="flex items-center gap-1.5">
                <Input readOnly value={f.password} className="h-9.5 font-mono text-[13.5px]" />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={actions.regenerateFacultyPassword}
                  className="h-9.5 w-9.5 shrink-0"
                  aria-label="Generate new password"
                >
                  <ArrowsClockwiseIcon size={15} />
                </Button>
              </div>
              <p className="mt-1 text-[11.5px] text-muted-foreground">
                Note this password down before creating — it won't be shown again. Forgot it? Hit generate for a fresh one.
              </p>
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
          {isEditing && (
            <div>
              <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Password</Label>
              {!resetOpen && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setResetCandidate(generatePassword());
                    setResetOpen(true);
                  }}
                  className="h-9.5 rounded-lg text-[13px] font-semibold"
                >
                  Reset Password
                </Button>
              )}
              {resetOpen && (
                <>
                  <div className="flex items-center gap-1.5">
                    <Input readOnly value={resetCandidate} className="h-9.5 font-mono text-[13.5px]" />
                    {!resetDone && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setResetCandidate(generatePassword())}
                        className="h-9.5 w-9.5 shrink-0"
                        aria-label="Generate new password"
                      >
                        <ArrowsClockwiseIcon size={15} />
                      </Button>
                    )}
                  </div>
                  {resetDone ? (
                    <p className="mt-1 text-[11.5px] text-muted-foreground">
                      Password reset. Note it down now — it won't be shown again.
                    </p>
                  ) : (
                    <div className="mt-1.5 flex items-center gap-2.5">
                      <p className="text-[11.5px] text-muted-foreground">Note this down, then confirm to apply it.</p>
                      <div className="ml-auto flex gap-1.5">
                        <Button type="button" variant="outline" onClick={() => setResetOpen(false)} className="h-7.5 rounded-md px-2.5 text-[12px]">
                          Cancel
                        </Button>
                        <Button type="button" onClick={confirmResetPassword} disabled={resetting} className="h-7.5 rounded-md px-2.5 text-[12px]">
                          {resetting ? "Resetting…" : "Confirm Reset"}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
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

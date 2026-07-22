import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboard } from "@/store/dashboard-store";

export function FacultyDialog() {
  const { state, actions } = useDashboard();
  const f = state.facultyForm;

  return (
    <Dialog open={state.showAddFaculty} onOpenChange={(v) => !v && actions.closeAddFaculty()}>
      <DialogContent className="max-w-120 rounded-2xl p-6.5">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-extrabold">Add Faculty / Admin</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3.5">
          <div>
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Name *</Label>
            <Input value={f.name} onChange={(e) => actions.setFacultyFormField("name", e.target.value)} className="h-9.5 text-[13.5px]" />
          </div>
          <div>
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Email *</Label>
            <Input value={f.email} onChange={(e) => actions.setFacultyFormField("email", e.target.value)} className="h-9.5 text-[13.5px]" />
          </div>
          <div>
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Phone</Label>
            <Input value={f.phone} onChange={(e) => actions.setFacultyFormField("phone", e.target.value)} className="h-9.5 text-[13.5px]" />
          </div>
          <div>
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Role</Label>
            <Select value={f.role} onValueChange={(v) => actions.setFacultyFormField("role", v as typeof f.role)}>
              <SelectTrigger className="h-9.5 w-full text-[13.5px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Faculty">Faculty</SelectItem>
                <SelectItem value="Super Admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Department</Label>
            <Input
              value={f.department}
              onChange={(e) => actions.setFacultyFormField("department", e.target.value)}
              className="h-9.5 text-[13.5px]"
            />
          </div>
        </div>
        <div className="mt-2 flex justify-end gap-2.5">
          <Button variant="outline" onClick={actions.closeAddFaculty} className="h-9.5 rounded-lg px-4.5 text-[13.5px] font-semibold">
            Cancel
          </Button>
          <Button onClick={actions.saveFaculty} className="h-9.5 rounded-lg px-5 text-[13.5px] font-bold">
            Create Account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

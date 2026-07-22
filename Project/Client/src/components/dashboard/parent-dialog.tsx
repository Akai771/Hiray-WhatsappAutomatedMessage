import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboard } from "@/store/dashboard-store";

export function ParentDialog() {
  const { state, actions } = useDashboard();
  const f = state.parentForm;

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
            <Select value={f.relation} onValueChange={(v) => actions.setParentFormField("relation", v as typeof f.relation)}>
              <SelectTrigger className="h-9.5 w-full text-[13.5px]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Father">Father</SelectItem>
                <SelectItem value="Mother">Mother</SelectItem>
                <SelectItem value="Guardian">Guardian</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Phone</Label>
            <Input value={f.phone} onChange={(e) => actions.setParentFormField("phone", e.target.value)} className="h-9.5 text-[13.5px]" />
          </div>
          <div>
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Email</Label>
            <Input value={f.email} onChange={(e) => actions.setParentFormField("email", e.target.value)} className="h-9.5 text-[13.5px]" />
          </div>
          <div>
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Linked Student</Label>
            <Select value={f.linkedStudent} onValueChange={(v) => actions.setParentFormField("linkedStudent", v)}>
              <SelectTrigger className="h-9.5 w-full text-[13.5px]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {state.students.map((s) => (
                  <SelectItem key={s.id} value={s.name}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">College</Label>
            <Select value={f.college} onValueChange={(v) => actions.setParentFormField("college", v)}>
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
        </div>
        <div className="mt-2 flex justify-end gap-2.5">
          <Button variant="outline" onClick={actions.closeAddParent} className="h-9.5 rounded-lg px-4.5 text-[13.5px] font-semibold">
            Cancel
          </Button>
          <Button onClick={actions.saveParent} className="h-9.5 rounded-lg px-5 text-[13.5px] font-bold">
            Save Parent
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

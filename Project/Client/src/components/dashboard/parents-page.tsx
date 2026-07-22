import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDashboard } from "@/store/dashboard-store";
import { ParentDialog } from "@/components/dashboard/parent-dialog";
import { ImportDialog } from "@/components/dashboard/import-dialog";

export function ParentsPage() {
  const { state, actions } = useDashboard();

  const filteredBase = useMemo(() => {
    const pf = state.parentFilters;
    const q = state.parentSearch.toLowerCase();
    return state.parents.filter((p) => {
      const matchesSearch =
        state.parentSearch === "" || p.name.toLowerCase().includes(q) || p.phone.includes(state.parentSearch) || p.linkedStudent.toLowerCase().includes(q);
      return matchesSearch && (pf.college === "all" || p.college === pf.college) && (pf.relation === "all" || p.relation === pf.relation);
    });
  }, [state.parents, state.parentFilters, state.parentSearch]);

  const allSelected = filteredBase.length > 0 && filteredBase.every((p) => state.selectedParents.includes(p.id));

  return (
    <div className="mx-auto max-w-400 px-8 py-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[22px] font-extrabold">Parents</div>
          <div className="mt-0.5 text-[13px] text-muted-foreground">Manage parent/guardian contacts linked to students.</div>
        </div>
        <div className="flex gap-2.5">
          <Button variant="outline" onClick={actions.openImportParents} className="h-9.5 rounded-lg px-4.5 text-[13.5px] font-semibold">
            Import Excel
          </Button>
          <Button onClick={actions.openAddParent} className="h-9.5 rounded-lg px-5 text-[13.5px] font-bold">
            + Add Parent
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 rounded-t-2xl border border-b-0 bg-card p-4">
        <Input
          placeholder="Search name, phone, linked student..."
          value={state.parentSearch}
          onChange={(e) => actions.setParentSearch(e.target.value)}
          className="h-8.5 min-w-50 flex-1 text-[13px]"
        />
        <Select value={state.parentFilters.college} onValueChange={(v) => actions.setParentFilter("college", v)}>
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
        <Select value={state.parentFilters.relation} onValueChange={(v) => actions.setParentFilter("relation", v)}>
          <SelectTrigger className="h-8.5 text-[12.5px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Relations</SelectItem>
            <SelectItem value="Father">Father</SelectItem>
            <SelectItem value="Mother">Mother</SelectItem>
            <SelectItem value="Guardian">Guardian</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {state.selectedParents.length > 0 && (
        <div className="flex items-center gap-3.5 border-x bg-primary/5 px-5 py-2.5">
          <div className="text-[13px] font-bold text-primary">{state.selectedParents.length} selected</div>
          <Button size="sm" onClick={actions.messageSelectedParents} className="h-7 rounded-md px-3 text-xs font-bold">
            Message Selected
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={actions.bulkDeleteParents}
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
                <Checkbox checked={allSelected} onCheckedChange={() => actions.toggleSelectAllParents(filteredBase.map((p) => p.id))} />
              </TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Name</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Phone</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Email</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Relation</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Linked Student</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">College</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBase.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <Checkbox checked={state.selectedParents.includes(p.id)} onCheckedChange={() => actions.toggleParentSelect(p.id)} />
                </TableCell>
                <TableCell className="text-[13px] font-semibold">{p.name}</TableCell>
                <TableCell className="text-[13px]">{p.phone}</TableCell>
                <TableCell className="text-[13px]">{p.email}</TableCell>
                <TableCell className="text-[13px]">{p.relation}</TableCell>
                <TableCell className="text-[13px]">{p.linkedStudent}</TableCell>
                <TableCell className="text-[13px]">{p.college}</TableCell>
                <TableCell className="text-[12.5px] whitespace-nowrap">
                  <span onClick={() => actions.openEditParent(p)} className="mr-3 cursor-pointer font-semibold">
                    Edit
                  </span>
                  <span onClick={() => actions.deleteParent(p.id)} className="cursor-pointer font-semibold text-destructive">
                    Delete
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ParentDialog />
      <ImportDialog
        open={state.showImportParents}
        title="Import Parents from Excel"
        confirmLabel="Import Parents"
        onClose={actions.closeImportParents}
        onConfirm={actions.importParents}
      />
    </div>
  );
}

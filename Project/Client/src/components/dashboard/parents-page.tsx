import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { statusBadgeClass } from "@/lib/badge-styles";
import { ENTITY_STATUS_LABEL, PARENT_RELATION_LABEL } from "@/lib/types";
import { useDashboard } from "@/store/dashboard-store";
import { useAuth } from "@/store/auth-store";
import { ParentDialog } from "@/components/dashboard/parent-dialog";
import { FunnelIcon, PencilIcon, TrashIcon } from "@phosphor-icons/react";

export function ParentsPage() {
  const { state, actions } = useDashboard();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const branchMap = useMemo(() => Object.fromEntries(state.branches.map((b) => [b.id, b.name])), [state.branches]);
  const studentMap = useMemo(() => Object.fromEntries(state.students.map((s) => [s.id, s])), [state.students]);

  const branchFilterItems = useMemo(() => {
    const m: Record<string, string> = { all: "All Colleges" };
    state.branches.forEach((b) => (m[b.id] = b.name));
    return m;
  }, [state.branches]);

  const relationFilterItems = useMemo(() => ({ all: "All Relations", ...PARENT_RELATION_LABEL }), []);
  const statusFilterItems = useMemo(() => ({ all: "All Status", ...ENTITY_STATUS_LABEL }), []);

  const allSelected = state.parents.length > 0 && state.parents.every((p) => state.selectedParents.includes(p.id));

  function renderFilterFields(triggerWidthClass: string) {
    return (
      <>
        {isSuperAdmin && (
          <Select value={state.parentFilters.branchId} items={branchFilterItems} onValueChange={(v) => actions.setParentFilter("branchId", v ?? "all")}>
            <SelectTrigger className={cn("h-8.5 text-[12.5px]", triggerWidthClass)}>
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
        )}
        <Select value={state.parentFilters.relation} items={relationFilterItems} onValueChange={(v) => actions.setParentFilter("relation", v ?? "all")}>
          <SelectTrigger className={cn("h-8.5 text-[12.5px]", triggerWidthClass)}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Relations</SelectItem>
            {Object.entries(PARENT_RELATION_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={state.parentFilters.status} items={statusFilterItems} onValueChange={(v) => actions.setParentFilter("status", v ?? "all")}>
          <SelectTrigger className={cn("h-8.5 text-[12.5px]", triggerWidthClass)}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(ENTITY_STATUS_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </>
    );
  }

  return (
    <div className="mx-auto max-w-400 px-4 py-7 sm:px-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[22px] font-extrabold">Parents</div>
          <div className="mt-0.5 text-[13px] text-muted-foreground">Manage parent/guardian contacts linked to students.</div>
        </div>
        <div className="flex gap-2.5">
          <Button onClick={actions.openAddParent} className="h-9.5 rounded-lg px-5 text-[13.5px] font-bold">
            + Add Parent
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 rounded-t-2xl border border-b-0 bg-card p-4">
        <Input
          placeholder="Search name, phone..."
          value={state.parentSearch}
          onChange={(e) => actions.setParentSearch(e.target.value)}
          className="h-8.5 min-w-50 flex-1 text-[13px]"
        />
        <Sheet>
          <SheetTrigger
            render={<Button variant="outline" className="h-8.5 shrink-0 gap-1.5 rounded-md px-3 text-[12.5px] font-semibold sm:hidden" />}
          >
            <FunnelIcon className="size-3.5" />
            Filters
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filter Parents</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-2.5">{renderFilterFields("w-full")}</div>
            <SheetClose render={<Button className="mt-2 h-9.5 w-full rounded-lg text-[13.5px] font-bold" />}>Apply Filters</SheetClose>
          </SheetContent>
        </Sheet>
        <div className="hidden sm:contents">{renderFilterFields("w-fit")}</div>
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
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-9">
                <Checkbox checked={allSelected} onCheckedChange={() => actions.toggleSelectAllParents(state.parents.map((p) => p.id))} />
              </TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Name</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Phone</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Email</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Relation</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Linked Student</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">College</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.parentsLoading && (
              <TableRow>
                <TableCell colSpan={9} className="py-8 text-center text-[13px] text-muted-foreground">
                  Loading parents…
                </TableCell>
              </TableRow>
            )}
            {!state.parentsLoading && state.parents.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="py-8 text-center text-[13px] text-muted-foreground">
                  No parents found.
                </TableCell>
              </TableRow>
            )}
            {!state.parentsLoading &&
              state.parents.map((p) => {
                const student = studentMap[p.linkedStudentId];
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Checkbox checked={state.selectedParents.includes(p.id)} onCheckedChange={() => actions.toggleParentSelect(p.id)} />
                    </TableCell>
                    <TableCell className="text-[13px] font-semibold">{p.name}</TableCell>
                    <TableCell className="text-[13px]">{p.phone}</TableCell>
                    <TableCell className="text-[13px]">{p.email || "—"}</TableCell>
                    <TableCell className="text-[13px]">{p.relation ? PARENT_RELATION_LABEL[p.relation] : "—"}</TableCell>
                    <TableCell className="text-[13px]">{student ? `${student.name} (${student.rollNo})` : "—"}</TableCell>
                    <TableCell className="text-[13px]">{student ? (branchMap[student.branchId] ?? "—") : "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusBadgeClass(ENTITY_STATUS_LABEL[p.status])}>
                        {ENTITY_STATUS_LABEL[p.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex flex-row items-center justify-end gap-5 mr-3">
                      <span onClick={() => actions.openEditParent(p)} className="cursor-pointer">
                        <PencilIcon size={16} />
                      </span>
                      <span onClick={() => actions.deleteParent(p.id)} className="cursor-pointer text-destructive">
                        <TrashIcon size={16} />
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        </div>
      </div>

      <ParentDialog />
    </div>
  );
}

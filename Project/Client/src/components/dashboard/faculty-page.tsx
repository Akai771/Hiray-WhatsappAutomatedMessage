import { useMemo, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { statusBadgeClass } from "@/lib/badge-styles";
import { API_ROLE_LABEL, ENTITY_STATUS_LABEL } from "@/lib/types";
import { useDashboard } from "@/store/dashboard-store";
import { FacultyDialog } from "@/components/dashboard/faculty-dialog";
import { PencilIcon, PowerIcon, TrashIcon } from "@phosphor-icons/react";
import type { ApiFaculty } from "@/services";

export function FacultyPage() {
  const { state, actions } = useDashboard();
  const isSuperAdmin = state.role === "super_admin";
  const [deleteTarget, setDeleteTarget] = useState<ApiFaculty | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await actions.deleteFaculty(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
  }

  const branchMap = useMemo(() => Object.fromEntries(state.branches.map((b) => [b.id, b.name])), [state.branches]);

  const branchFilterItems = useMemo(() => {
    const m: Record<string, string> = { all: "All Colleges" };
    state.branches.forEach((b) => (m[b.id] = b.name));
    return m;
  }, [state.branches]);
  const statusFilterItems = useMemo(() => ({ all: "All Status", ...ENTITY_STATUS_LABEL }), []);

  return (
    <div className="mx-auto max-w-400 px-8 py-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[22px] font-extrabold">Faculty &amp; Admins</div>
          <div className="mt-0.5 text-[13px] text-muted-foreground">Accounts authorized to log in and send messages.</div>
        </div>
        {isSuperAdmin && (
          <Button onClick={actions.openAddFaculty} className="h-9.5 rounded-lg px-5 text-[13.5px] font-bold">
            + Add Faculty
          </Button>
        )}
      </div>

      {!isSuperAdmin && (
        <div className="mb-4 rounded-[10px] border border-amber-300/60 bg-amber-50 px-4 py-3 text-[13px] font-semibold text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
          Only Super Admins can add, edit, or deactivate faculty accounts.
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <Select
          value={state.facultyFilters.branchId}
          items={branchFilterItems}
          onValueChange={(v) => actions.setFacultyFilter("branchId", v ?? "all")}
        >
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
        <Select
          value={state.facultyFilters.status}
          items={statusFilterItems}
          onValueChange={(v) => actions.setFacultyFilter("status", v ?? "all")}
        >
          <SelectTrigger className="h-8.5 text-[12.5px]">
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
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Name</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Email</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">College</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Role</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.facultyLoading && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-[13px] text-muted-foreground">
                  Loading faculty…
                </TableCell>
              </TableRow>
            )}
            {!state.facultyLoading && state.faculty.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-[13px] text-muted-foreground">
                  No faculty accounts yet.
                </TableCell>
              </TableRow>
            )}
            {!state.facultyLoading &&
              state.faculty.map((fac) => (
                <TableRow key={fac.id}>
                  <TableCell className="text-[13px] font-semibold">{fac.name}</TableCell>
                  <TableCell className="text-[13px]">{fac.email}</TableCell>
                  <TableCell className="text-[13px]">{fac.branchId ? (branchMap[fac.branchId] ?? "—") : "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusBadgeClass(API_ROLE_LABEL[fac.role])}>
                      {API_ROLE_LABEL[fac.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusBadgeClass(ENTITY_STATUS_LABEL[fac.status])}>
                      {ENTITY_STATUS_LABEL[fac.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[12.5px] whitespace-nowrap">
                    {isSuperAdmin && (
                      <>
                        <span onClick={() => actions.openEditFaculty(fac)} className="mr-3 cursor-pointer font-semibold">
                          <PencilIcon size={16} className="inline-block" />
                        </span>
                        <span onClick={() => setDeleteTarget(fac)} className="mr-3 cursor-pointer font-semibold text-destructive">
                          <TrashIcon size={16} className="inline-block" />
                        </span>
                        <span onClick={() => actions.toggleFacultyStatus(fac)} className={`cursor-pointer font-semibold ${fac.status === "ACTIVE" ? "text-destructive" : "text-green-500"}`}>
                          <PowerIcon size={16} className="inline-block" />
                        </span>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <FacultyDialog />

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete faculty account?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes {deleteTarget?.name}'s account and login access. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleting} className="bg-destructive text-white hover:bg-destructive/90">
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { statusBadgeClass } from "@/lib/badge-styles";
import { useDashboard } from "@/store/dashboard-store";
import { FacultyDialog } from "@/components/dashboard/faculty-dialog";

export function FacultyPage() {
  const { state, actions } = useDashboard();
  const isSuperAdmin = state.role === "super_admin";

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
          Only Super Admins can add, edit, or remove faculty accounts.
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Name</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Email</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Phone</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Role</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Department</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Status</TableHead>
              <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Last Active</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.faculty.map((f) => (
              <TableRow key={f.id}>
                <TableCell className="text-[13px] font-semibold">{f.name}</TableCell>
                <TableCell className="text-[13px]">{f.email}</TableCell>
                <TableCell className="text-[13px]">{f.phone}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={statusBadgeClass(f.role)}>
                    {f.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-[13px]">{f.department}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={statusBadgeClass(f.status)}>
                    {f.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-[12.5px] text-muted-foreground">{f.lastActive}</TableCell>
                <TableCell className="text-[12.5px] whitespace-nowrap">
                  {isSuperAdmin && (
                    <span onClick={() => actions.deleteFaculty(f.id)} className="cursor-pointer font-semibold text-destructive">
                      Remove
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <FacultyDialog />
    </div>
  );
}

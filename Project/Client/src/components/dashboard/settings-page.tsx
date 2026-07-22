import { useMemo } from "react";
import { XIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/store/dashboard-store";
import type { SettingsTab } from "@/lib/types";

const SETTINGS_TABS: { key: SettingsTab; label: string }[] = [
  { key: "branches", label: "Branches" },
  { key: "courses", label: "Courses" },
  { key: "years", label: "Years & Semesters" },
  { key: "divisions", label: "Divisions" },
];

export function SettingsPage() {
  const { state, actions } = useDashboard();

  return (
    <div className="mx-auto max-w-400 px-8 py-7">
      <div className="mb-5">
        <div className="text-[22px] font-extrabold">Settings</div>
        <div className="mt-0.5 text-[13px] text-muted-foreground">Configure college branches, courses, years and divisions.</div>
      </div>

      <div className="mb-5 flex gap-2 border-b">
        {SETTINGS_TABS.map((t) => {
          const active = state.settingsTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => actions.setSettingsTab(t.key)}
              className={cn(
                "cursor-pointer rounded-t-lg px-4 py-2.5 text-[13px] font-semibold",
                active ? "bg-primary/10 font-bold text-primary" : "text-muted-foreground",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {state.settingsTab === "branches" && <BranchesTab />}
      {state.settingsTab === "courses" && <CoursesTab />}
      {state.settingsTab === "years" && <YearsTab />}
      {state.settingsTab === "divisions" && <DivisionsTab />}
    </div>
  );
}

function BranchesTab() {
  const { state, actions } = useDashboard();
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="mb-4 text-[15px] font-bold">College Branches</div>
      <div className="mb-5 flex flex-col gap-2">
        {state.branches.map((b) => (
          <div key={b.id} className="flex items-center justify-between rounded-[9px] border px-3.5 py-3">
            <div>
              <div className="text-[13.5px] font-bold">
                {b.name} <span className="font-medium text-muted-foreground">({b.code})</span>
              </div>
              <div className="text-xs text-muted-foreground">{b.address}</div>
            </div>
            <span onClick={() => actions.deleteBranch(b.id)} className="cursor-pointer text-[12.5px] font-semibold text-destructive">
              Delete
            </span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-[1fr_1fr_1.4fr_auto] items-end gap-2.5">
        <div>
          <Label className="mb-1 text-xs font-semibold text-muted-foreground">Name</Label>
          <Input
            placeholder="e.g. East Campus"
            value={state.newBranch.name}
            onChange={(e) => actions.setNewBranchField("name", e.target.value)}
            className="h-9 text-[13px]"
          />
        </div>
        <div>
          <Label className="mb-1 text-xs font-semibold text-muted-foreground">Code</Label>
          <Input
            placeholder="EC"
            value={state.newBranch.code}
            onChange={(e) => actions.setNewBranchField("code", e.target.value)}
            className="h-9 text-[13px]"
          />
        </div>
        <div>
          <Label className="mb-1 text-xs font-semibold text-muted-foreground">Address</Label>
          <Input
            placeholder="Street, City"
            value={state.newBranch.address}
            onChange={(e) => actions.setNewBranchField("address", e.target.value)}
            className="h-9 text-[13px]"
          />
        </div>
        <Button onClick={actions.addBranch} className="h-9 rounded-lg px-4.5 text-[13px] font-bold whitespace-nowrap">
          Add Branch
        </Button>
      </div>
    </div>
  );
}

function CoursesTab() {
  const { state, actions } = useDashboard();
  const selectedBranchId = state.selectedBranchForCourses || (state.branches[0] && state.branches[0].id);

  const coursesForBranch = useMemo(
    () => state.courses.filter((c) => c.branchId === selectedBranchId),
    [state.courses, selectedBranchId],
  );

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="mb-4 text-[15px] font-bold">Courses per Branch</div>
      <div className="mb-4 flex flex-wrap gap-2">
        {state.branches.map((b) => {
          const active = selectedBranchId === b.id;
          return (
            <button
              key={b.id}
              onClick={() => actions.setSelectedBranchForCourses(b.id)}
              className={cn(
                "cursor-pointer rounded-full border px-3.5 py-2 text-[12.5px] font-bold",
                active ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              {b.name}
            </button>
          );
        })}
      </div>
      <div className="mb-5 flex flex-col gap-2">
        {coursesForBranch.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-[9px] border px-3.5 py-3">
            <div className="text-[13.5px] font-bold">
              {c.name} <span className="font-medium text-muted-foreground">({c.code}) · {c.totalYears} yrs</span>
            </div>
            <span onClick={() => actions.deleteCourse(c.id)} className="cursor-pointer text-[12.5px] font-semibold text-destructive">
              Delete
            </span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-[1.4fr_1fr_1fr_auto] items-end gap-2.5">
        <div>
          <Label className="mb-1 text-xs font-semibold text-muted-foreground">Course Name</Label>
          <Input
            placeholder="e.g. Mechanical Engineering"
            value={state.newCourse.name}
            onChange={(e) => actions.setNewCourseField("name", e.target.value)}
            className="h-9 text-[13px]"
          />
        </div>
        <div>
          <Label className="mb-1 text-xs font-semibold text-muted-foreground">Code</Label>
          <Input
            placeholder="ME"
            value={state.newCourse.code}
            onChange={(e) => actions.setNewCourseField("code", e.target.value)}
            className="h-9 text-[13px]"
          />
        </div>
        <div>
          <Label className="mb-1 text-xs font-semibold text-muted-foreground">Total Years</Label>
          <Input
            type="number"
            min={1}
            max={6}
            value={state.newCourse.totalYears}
            onChange={(e) => actions.setNewCourseField("totalYears", e.target.value)}
            className="h-9 text-[13px]"
          />
        </div>
        <Button onClick={actions.addCourse} className="h-9 rounded-lg px-4.5 text-[13px] font-bold whitespace-nowrap">
          Add Course
        </Button>
      </div>
    </div>
  );
}

function YearsTab() {
  const { state, actions } = useDashboard();
  const branchMap = useMemo(() => {
    const m: Record<string, string> = {};
    state.branches.forEach((b) => (m[b.id] = b.name));
    return m;
  }, [state.branches]);

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="mb-4 text-[15px] font-bold">Years &amp; Semesters per Course</div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Course</TableHead>
            <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Branch</TableHead>
            <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Total Years</TableHead>
            <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Semesters / Year</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {state.courses.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="text-[13px] font-semibold">{c.name}</TableCell>
              <TableCell className="text-[13px] text-muted-foreground">{branchMap[c.branchId] ?? "—"}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={1}
                  max={6}
                  value={c.totalYears}
                  onChange={(e) => actions.updateCourseYears(c.id, e.target.value)}
                  className="h-7.5 w-16 text-[12.5px]"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={1}
                  max={4}
                  value={c.semestersPerYear}
                  onChange={(e) => actions.updateCourseSemesters(c.id, e.target.value)}
                  className="h-7.5 w-16 text-[12.5px]"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function DivisionsTab() {
  const { state, actions } = useDashboard();
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="mb-4 text-[15px] font-bold">Divisions / Sections</div>
      <div className="mb-5 flex flex-wrap gap-2.5">
        {state.divisions.map((d) => (
          <div
            key={d}
            className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3.5 py-2 text-[13px] font-bold"
          >
            Division {d}
            <span onClick={() => actions.deleteDivision(d)} className="cursor-pointer font-extrabold text-destructive">
              <XIcon className="size-3" />
            </span>
          </div>
        ))}
      </div>
      <div className="flex max-w-[320px] gap-2.5">
        <Input
          placeholder="e.g. E"
          value={state.newDivision}
          onChange={(e) => actions.setNewDivision(e.target.value)}
          className="h-9 flex-1 text-[13px] uppercase"
        />
        <Button onClick={actions.addDivision} className="h-9 rounded-lg px-4.5 text-[13px] font-bold">
          Add
        </Button>
      </div>
    </div>
  );
}

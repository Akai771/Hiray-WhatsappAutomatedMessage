import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { NOTIF_TYPE_LABEL } from "@/lib/types";
import { useDashboard } from "@/store/dashboard-store";
import type { SettingsTab } from "@/lib/types";

const SETTINGS_TABS: { key: SettingsTab; label: string }[] = [
  { key: "branches", label: "Branches" },
  { key: "courses", label: "Courses" },
  { key: "years", label: "Years & Semesters" },
  { key: "templates", label: "Message Templates" },
];

export function SettingsPage() {
  const { state, actions } = useDashboard();

  return (
    <div className="mx-auto max-w-400 px-4 py-7 sm:px-8">
      <div className="mb-5">
        <div className="text-[22px] font-extrabold">Settings</div>
        <div className="mt-0.5 text-[13px] text-muted-foreground">Configure college branches, courses, and years.</div>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto border-b">
        {SETTINGS_TABS.map((t) => {
          const active = state.settingsTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => actions.setSettingsTab(t.key)}
              className={cn(
                "shrink-0 cursor-pointer rounded-t-lg px-4 py-2.5 text-[13px] font-semibold whitespace-nowrap",
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
      {state.settingsTab === "templates" && <TemplatesTab />}
    </div>
  );
}

function BranchesTab() {
  const { state, actions } = useDashboard();
  return (
    <div className="rounded-2xl border bg-card p-4 sm:p-6">
      <div className="mb-4 text-[15px] font-bold">College Branches</div>
      <div className="mb-5 flex flex-col gap-2">
        {state.branchesLoading && <div className="text-[13px] text-muted-foreground">Loading branches…</div>}
        {!state.branchesLoading && state.branches.length === 0 && (
          <div className="text-[13px] text-muted-foreground">No branches yet — add one below.</div>
        )}
        {state.branches.map((b) => (
          <div key={b.id} className="flex items-center justify-between gap-2 rounded-[9px] border px-3.5 py-3">
            <div className="min-w-0">
              <div className="truncate text-[13.5px] font-bold">
                {b.name} <span className="font-medium text-muted-foreground">({b.code})</span>
              </div>
              <div className="truncate text-xs text-muted-foreground">{b.address}</div>
            </div>
            <span onClick={() => actions.deleteBranch(b.id)} className="shrink-0 cursor-pointer text-[12.5px] font-semibold text-destructive">
              Delete
            </span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 items-end gap-2.5 sm:grid-cols-[1fr_1fr_1.4fr_auto]">
        <div>
          <Label className="mb-1 text-xs font-semibold text-muted-foreground">Name *</Label>
          <Input
            placeholder="e.g. Hiray College"
            value={state.newBranch.name}
            onChange={(e) => actions.setNewBranchField("name", e.target.value)}
            className="h-9 text-[13px]"
          />
        </div>
        <div>
          <Label className="mb-1 text-xs font-semibold text-muted-foreground">Code *</Label>
          <Input
            placeholder="HC"
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
        <Button onClick={actions.addBranch} className="h-9 w-full rounded-lg px-4.5 text-[13px] font-bold whitespace-nowrap sm:w-auto">
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
    <div className="rounded-2xl border bg-card p-4 sm:p-6">
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
        {state.coursesLoading && <div className="text-[13px] text-muted-foreground">Loading courses…</div>}
        {!state.coursesLoading && coursesForBranch.length === 0 && (
          <div className="text-[13px] text-muted-foreground">No courses for this branch yet.</div>
        )}
        {coursesForBranch.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-2 rounded-[9px] border px-3.5 py-3">
            <div className="min-w-0 truncate text-[13.5px] font-bold">
              {c.name}{" "}
              <span className="font-medium text-muted-foreground">
                ({c.code}) · {c.totalYears} yrs · {c.semestersPerYear} sem/yr
              </span>
            </div>
            <span onClick={() => actions.deleteCourse(c.id)} className="shrink-0 cursor-pointer text-[12.5px] font-semibold text-destructive">
              Delete
            </span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 items-end gap-2.5 sm:grid-cols-[1.2fr_0.8fr_0.7fr_0.9fr_auto]">
        <div className="col-span-2 sm:col-span-1">
          <Label className="mb-1 text-xs font-semibold text-muted-foreground">Course Name *</Label>
          <Input
            placeholder="e.g. Mechanical Engineering"
            value={state.newCourse.name}
            onChange={(e) => actions.setNewCourseField("name", e.target.value)}
            className="h-9 text-[13px]"
          />
        </div>
        <div>
          <Label className="mb-1 text-xs font-semibold text-muted-foreground">Code *</Label>
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
        <div>
          <Label className="mb-1 text-xs font-semibold text-muted-foreground">Sem / Year</Label>
          <Input
            type="number"
            min={1}
            max={4}
            value={state.newCourse.semestersPerYear}
            onChange={(e) => actions.setNewCourseField("semestersPerYear", e.target.value)}
            className="h-9 text-[13px]"
          />
        </div>
        <Button onClick={actions.addCourse} className="col-span-2 h-9 w-full rounded-lg px-4.5 text-[13px] font-bold whitespace-nowrap sm:col-span-1 sm:w-auto">
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
    <div className="rounded-2xl border bg-card p-4 sm:p-6">
      <div className="mb-4 text-[15px] font-bold">Years &amp; Semesters per Course</div>
      <div className="overflow-x-auto">
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
    </div>
  );
}

function TemplatesTab() {
  const { state, actions } = useDashboard();
  const canManage = state.role === "super_admin";

  return (
    <div className="rounded-2xl border bg-card p-4 sm:p-6">
      <div className="mb-4 text-[15px] font-bold">WhatsApp Message Templates</div>
      <div className="mb-2 text-[12px] text-muted-foreground">
        Each entry must match a template already approved in WhatsApp Business Manager — the WhatsApp Template Name is looked up at send time.
      </div>
      <div className="mb-5 flex flex-col gap-2">
        {state.templatesLoading && <div className="text-[13px] text-muted-foreground">Loading templates…</div>}
        {!state.templatesLoading && state.templates.length === 0 && (
          <div className="text-[13px] text-muted-foreground">No templates yet — add one below.</div>
        )}
        {state.templates.map((t) => (
          <div key={t.id} className="flex items-center justify-between gap-2 rounded-[9px] border px-3.5 py-3">
            <div className="min-w-0">
              <div className="truncate text-[13.5px] font-bold">
                {t.name} <span className="font-medium text-muted-foreground">({t.whatsappTemplateName})</span>
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {NOTIF_TYPE_LABEL[t.category]}
                {t.attachmentAllowed ? " · attachment allowed" : ""}
                {t.buttonAllowed ? " · button allowed" : ""}
                {t.variables.length ? ` · variables: ${t.variables.join(", ")}` : ""}
              </div>
            </div>
            {canManage && (
              <span onClick={() => actions.deleteTemplate(t.id)} className="shrink-0 cursor-pointer text-[12.5px] font-semibold text-destructive">
                Delete
              </span>
            )}
          </div>
        ))}
      </div>
      {canManage && (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <div>
            <Label className="mb-1 text-xs font-semibold text-muted-foreground">Display Name</Label>
            <Input
              placeholder="e.g. Exam Schedule Notice"
              value={state.newTemplate.name}
              onChange={(e) => actions.setNewTemplateField("name", e.target.value)}
              className="h-9 text-[13px]"
            />
          </div>
          <div>
            <Label className="mb-1 text-xs font-semibold text-muted-foreground">WhatsApp Template Name</Label>
            <Input
              placeholder="exam_schedule_notice"
              value={state.newTemplate.whatsappTemplateName}
              onChange={(e) => actions.setNewTemplateField("whatsappTemplateName", e.target.value)}
              className="h-9 text-[13px]"
            />
          </div>
          <div>
            <Label className="mb-1 text-xs font-semibold text-muted-foreground">Category</Label>
            <Select
              value={state.newTemplate.category}
              items={NOTIF_TYPE_LABEL}
              onValueChange={(v) => actions.setNewTemplateField("category", (v ?? "UTILITY") as typeof state.newTemplate.category)}
            >
              <SelectTrigger className="h-9 w-full text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(NOTIF_TYPE_LABEL).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1 text-xs font-semibold text-muted-foreground">Variables (comma-separated)</Label>
            <Input
              placeholder="studentName, examDate"
              value={state.newTemplate.variablesText}
              onChange={(e) => actions.setNewTemplateField("variablesText", e.target.value)}
              className="h-9 text-[13px]"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2">
            <Checkbox
              checked={state.newTemplate.attachmentAllowed}
              onCheckedChange={(v) => actions.setNewTemplateField("attachmentAllowed", !!v)}
            />
            <span className="text-[12.5px] font-semibold">Allows attachment</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <Checkbox checked={state.newTemplate.buttonAllowed} onCheckedChange={(v) => actions.setNewTemplateField("buttonAllowed", !!v)} />
            <span className="text-[12.5px] font-semibold">Allows CTA button</span>
          </label>
          <Button onClick={actions.addTemplate} className="col-span-2 h-9 rounded-lg text-[13px] font-bold">
            Add Template
          </Button>
        </div>
      )}
    </div>
  );
}

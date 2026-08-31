import { useMemo, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { statusBadgeClass } from "@/lib/badge-styles";
import { NOTIF_TYPE_LABEL } from "@/lib/types";
import { useDashboard } from "@/store/dashboard-store";
import type { ApiNotificationTemplate } from "@/services";
import type { SettingsTab } from "@/lib/types";
import {
  CursorClickIcon,
  FileTextIcon,
  ImageIcon,
  PaperPlaneTiltIcon,
  PencilIcon,
  PlusIcon,
  TextAaIcon,
  TrashIcon,
  UserIcon,
  XIcon,
} from "@phosphor-icons/react";

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

// One badge per capability the template actually has — mirrors what the
// Send page will show/require, so the library reads like a quick spec sheet
// instead of a wall of text.
function templateCapabilities(t: ApiNotificationTemplate) {
  const items: { icon: ReactNode; label: string }[] = [];
  if (t.hasTextHeader) items.push({ icon: <TextAaIcon className="size-3" />, label: "Text header" });
  if (t.attachmentAllowed) items.push({ icon: <ImageIcon className="size-3" />, label: "Attachment" });
  if (t.buttonAllowed) {
    items.push({ icon: <CursorClickIcon className="size-3" />, label: t.buttonUrlIsDynamic ? "Dynamic CTA" : "Fixed CTA" });
  }
  if (t.autoFillRecipientName) items.push({ icon: <UserIcon className="size-3" />, label: "Auto-fills name" });
  return items;
}

interface CapabilityToggleProps {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  title: string;
  description: string;
  className?: string;
}

function CapabilityToggle({ checked, onCheckedChange, title, description, className }: CapabilityToggleProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors",
        checked ? "border-primary/40 bg-primary/5" : "border-border hover:bg-muted/40",
        className,
      )}
    >
      <Checkbox checked={checked} onCheckedChange={(v) => onCheckedChange(!!v)} className="mt-0.5" />
      <div className="min-w-0">
        <div className="text-[13px] font-semibold">{title}</div>
        <div className="mt-0.5 text-[11.5px] leading-snug text-muted-foreground">{description}</div>
      </div>
    </label>
  );
}

function TemplatesTab() {
  const { state, actions } = useDashboard();
  const canManage = state.role === "super_admin";
  const editing = state.editingTemplateId !== null;
  const editingTemplate = state.templates.find((t) => t.id === state.editingTemplateId);

  return (
    <div className="flex flex-col gap-6">
            {/* Editor */}
      {canManage && (
        <section className="overflow-hidden rounded-2xl border bg-card">
          <div className="flex items-center gap-3 border-b bg-muted/30 px-5 py-4 sm:px-6">
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full",
                editing ? "bg-primary/10 text-primary" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
              )}
            >
              {editing ? <PencilIcon size={16} weight="bold" /> : <PlusIcon size={16} weight="bold" />}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[15px] font-bold">
                {editing ? `Editing "${editingTemplate?.name ?? ""}"` : "New Template"}
              </div>
              <div className="text-[12px] text-muted-foreground">
                {editing ? "Update the details for this approved template." : "Register a template already approved in WhatsApp Manager."}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 p-5 sm:p-6">
            <div>
              <div className="mb-3 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Basic Info</div>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                <div>
                  <Label className="mb-1.5 text-xs font-semibold text-muted-foreground">Display Name</Label>
                  <Input
                    placeholder="e.g. Exam Schedule Notice"
                    value={state.newTemplate.name}
                    onChange={(e) => actions.setNewTemplateField("name", e.target.value)}
                    className="h-9.5 text-[13px]"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 text-xs font-semibold text-muted-foreground">WhatsApp Template Name</Label>
                  <Input
                    placeholder="exam_schedule_notice"
                    value={state.newTemplate.whatsappTemplateName}
                    onChange={(e) => actions.setNewTemplateField("whatsappTemplateName", e.target.value)}
                    className="h-9.5 font-mono text-[13px]"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 text-xs font-semibold text-muted-foreground">Category</Label>
                  <Select
                    value={state.newTemplate.category}
                    items={NOTIF_TYPE_LABEL}
                    onValueChange={(v) => actions.setNewTemplateField("category", (v ?? "UTILITY") as typeof state.newTemplate.category)}
                  >
                    <SelectTrigger className="h-9.5 w-full text-[13px]">
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
              </div>
            </div>

            <div>
              <div className="mb-3 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Content</div>
              <div className="grid grid-cols-1 gap-3.5">
                <div>
                  <Label className="mb-1.5 text-xs font-semibold text-muted-foreground">
                    Variables (comma-separated, one per {"{{n}}"}, in order — any count)
                  </Label>
                  <Input
                    placeholder="Recipient Name, Exam Name, Start Date, End Date"
                    value={state.newTemplate.variablesText}
                    onChange={(e) => actions.setNewTemplateField("variablesText", e.target.value)}
                    className="h-9.5 text-[13px]"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 text-xs font-semibold text-muted-foreground">
                    Body Text (copy from WhatsApp Manager, keep {"{{1}}"}, {"{{2}}"}, ... exactly)
                  </Label>
                  <Textarea
                    placeholder={
                      "Hello {{1}},\n\nThe examination schedule for {{2}} has been announced.\n\nThe examinations will be conducted from {{3}} to {{4}}.\n\nRegards,\nHiray Group of Institutes"
                    }
                    rows={4}
                    value={state.newTemplate.bodyText}
                    onChange={(e) => actions.setNewTemplateField("bodyText", e.target.value)}
                    className="text-[13px]"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="mb-3 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Capabilities</div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <CapabilityToggle
                  checked={state.newTemplate.hasTextHeader}
                  onCheckedChange={(v) => actions.setNewTemplateField("hasTextHeader", v)}
                  title="Text header"
                  description="Approved template shows a text header above the body. Not combinable with a media header."
                />
                <CapabilityToggle
                  checked={state.newTemplate.autoFillRecipientName}
                  onCheckedChange={(v) => actions.setNewTemplateField("autoFillRecipientName", v)}
                  title="Auto-fill recipient name"
                  description={`Fills ${"{{1}}"} with each recipient's own name — only valid if the first variable is a name.`}
                />
                <CapabilityToggle
                  checked={state.newTemplate.attachmentAllowed}
                  onCheckedChange={(v) => actions.setNewTemplateField("attachmentAllowed", v)}
                  title="Media header"
                  description="Approved template requires an image, video, or document header on every send."
                />
                <div className="flex flex-col gap-3">
                  <CapabilityToggle
                    checked={state.newTemplate.buttonAllowed}
                    onCheckedChange={(v) => actions.setNewTemplateField("buttonAllowed", v)}
                    title="CTA button"
                    description="Approved template includes a call-to-action URL button."
                  />
                  {state.newTemplate.buttonAllowed && (
                    <CapabilityToggle
                      checked={state.newTemplate.buttonUrlIsDynamic}
                      onCheckedChange={(v) => actions.setNewTemplateField("buttonUrlIsDynamic", v)}
                      title="Dynamic button URL"
                      description={`Approved URL ends in ${"{{1}}"} — leave unchecked if it's one fixed URL.`}
                      className="ml-4"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t pt-5">
              {editing && (
                <Button variant="outline" onClick={actions.cancelEditTemplate} className="h-9.5 gap-1.5 rounded-lg px-4.5 text-[13px] font-bold">
                  <XIcon className="size-3.5" />
                  Cancel
                </Button>
              )}
              <Button onClick={actions.addTemplate} className="h-9.5 gap-1.5 rounded-lg px-5 text-[13px] font-bold">
                {editing ? (
                  <>
                    <FileTextIcon className="size-3.5" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <PaperPlaneTiltIcon className="size-3.5" />
                    Add Template
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>
      )}
      
      {/* Library */}
      <section className="overflow-hidden rounded-2xl border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/30 px-5 py-4 sm:px-6">
          <div>
            <div className="text-[15px] font-bold">Template Library</div>
            <div className="mt-0.5 text-[12px] text-muted-foreground">
              Each entry must match a template already approved in WhatsApp Business Manager.
            </div>
          </div>
          <Badge variant="secondary" className="h-6 shrink-0 rounded-full px-3 text-[11px] font-bold">
            {state.templates.length} template{state.templates.length === 1 ? "" : "s"}
          </Badge>
        </div>

        <div className="p-4 sm:p-6">
          {state.templatesLoading && <div className="py-6 text-center text-[13px] text-muted-foreground">Loading templates…</div>}
          {!state.templatesLoading && state.templates.length === 0 && (
            <div className="rounded-xl border border-dashed py-10 text-center text-[13px] text-muted-foreground">
              No templates yet — add one below to get started.
            </div>
          )}
          {!state.templatesLoading && state.templates.length > 0 && (
            <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
              {state.templates.map((t) => {
                const isEditingThis = state.editingTemplateId === t.id;
                const capabilities = templateCapabilities(t);
                return (
                  <div
                    key={t.id}
                    className={cn(
                      "flex flex-col gap-3 rounded-xl border bg-card p-4 transition-shadow",
                      isEditingThis ? "border-primary ring-2 ring-primary/15" : "hover:shadow-sm",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-[14px] font-bold">{t.name}</div>
                        <div className="truncate font-mono text-[11.5px] text-muted-foreground">{t.whatsappTemplateName}</div>
                      </div>
                      <Badge className={cn("shrink-0 rounded-full px-2.5 text-[10.5px] font-bold", statusBadgeClass(NOTIF_TYPE_LABEL[t.category]))}>
                        {NOTIF_TYPE_LABEL[t.category]}
                      </Badge>
                    </div>

                    {t.bodyText && (
                      <div className="rounded-lg border border-dashed bg-muted/40 px-3 py-2 text-[11.5px] leading-snug whitespace-pre-wrap text-muted-foreground italic line-clamp-3">
                        {t.bodyText}
                      </div>
                    )}

                    {(capabilities.length > 0 || t.variables.length > 0) && (
                      <div className="flex flex-wrap gap-1.5">
                        {capabilities.map((c, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[10.5px] font-semibold text-foreground/80"
                          >
                            {c.icon}
                            {c.label}
                          </span>
                        ))}
                        {t.variables.map((v, i) => (
                          <span
                            key={`var-${i}`}
                            className="inline-flex items-center rounded-full border border-dashed px-2 py-1 text-[10.5px] font-semibold text-muted-foreground"
                          >
                            {"{{"}
                            {i + 1}
                            {"}}"} {v}
                          </span>
                        ))}
                      </div>
                    )}

                    {canManage && (
                      <div className="mt-auto flex items-center justify-end gap-1.5 border-t pt-2.5">
                        <button
                          onClick={() => actions.startEditTemplate(t)}
                          className="flex size-7.5 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                          title="Edit template"
                        >
                          <PencilIcon size={15} />
                        </button>
                        <button
                          onClick={() => actions.deleteTemplate(t.id)}
                          className="flex size-7.5 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          title="Delete template"
                        >
                          <TrashIcon size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

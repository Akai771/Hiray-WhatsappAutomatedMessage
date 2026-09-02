import { useEffect, useMemo, useState, type ElementType, type ReactNode } from "react";
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
  BuildingsIcon,
  CalendarBlankIcon,
  CurrencyInrIcon,
  CursorClickIcon,
  FileTextIcon,
  GraduationCapIcon,
  ImageIcon,
  MapPinIcon,
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
  { key: "pricing", label: "Pricing" },
];

// Known-good locale codes seen in WhatsApp Manager. "en_US" is the safe
// default — most templates get approved under it — but a template approved
// under plain "en" (or another locale) must match exactly or every send to
// it fails at the Graph API.
const TEMPLATE_LANGUAGE_LABEL: Record<string, string> = {
  en_US: "English (US) — en_US",
  en: "English — en",
};

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
      {state.settingsTab === "pricing" && <PricingTab />}
    </div>
  );
}

// Shared header bar for a section card — icon badge + title/subtitle, plus
// an optional trailing badge (a count, usually). Reused across every
// Editor/Library section in Settings so they all read as one design system.
function SectionHeader({
  icon: Icon,
  iconTone,
  title,
  subtitle,
  trailing,
}: {
  icon: ElementType;
  iconTone: string;
  title: string;
  subtitle: string;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/30 px-5 py-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", iconTone)}>
          <Icon size={16} weight="bold" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-[15px] font-bold">{title}</div>
          <div className="text-[12px] text-muted-foreground">{subtitle}</div>
        </div>
      </div>
      {trailing}
    </div>
  );
}

const NEW_ICON_TONE = "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400";

function EmptyState({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-dashed py-10 text-center text-[13px] text-muted-foreground">{children}</div>;
}

function CountBadge({ count, noun }: { count: number; noun: string }) {
  return (
    <Badge variant="secondary" className="h-6 shrink-0 rounded-full px-3 text-[11px] font-bold">
      {count} {noun}
      {count === 1 ? "" : "s"}
    </Badge>
  );
}

function BranchesTab() {
  const { state, actions } = useDashboard();
  return (
    <div className="flex flex-col gap-6">
      {/* Editor */}
      <section className="overflow-hidden rounded-2xl border bg-card">
        <SectionHeader
          icon={PlusIcon}
          iconTone={NEW_ICON_TONE}
          title="New Branch"
          subtitle="Add a college branch to scope courses, students, and faculty."
        />
        <div className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <div>
              <Label className="mb-1.5 text-xs font-semibold text-muted-foreground">Name *</Label>
              <Input
                placeholder="e.g. Hiray College"
                value={state.newBranch.name}
                onChange={(e) => actions.setNewBranchField("name", e.target.value)}
                className="h-9.5 text-[13px]"
              />
            </div>
            <div>
              <Label className="mb-1.5 text-xs font-semibold text-muted-foreground">Code *</Label>
              <Input
                placeholder="HC"
                value={state.newBranch.code}
                onChange={(e) => actions.setNewBranchField("code", e.target.value)}
                className="h-9.5 text-[13px]"
              />
            </div>
            <div>
              <Label className="mb-1.5 text-xs font-semibold text-muted-foreground">Address</Label>
              <Input
                placeholder="Street, City"
                value={state.newBranch.address}
                onChange={(e) => actions.setNewBranchField("address", e.target.value)}
                className="h-9.5 text-[13px]"
              />
            </div>
          </div>
          <div className="flex justify-end border-t pt-5">
            <Button onClick={actions.addBranch} className="h-9.5 gap-1.5 rounded-lg px-5 text-[13px] font-bold">
              <PlusIcon className="size-3.5" />
              Add Branch
            </Button>
          </div>
        </div>
      </section>

      {/* Library */}
      <section className="overflow-hidden rounded-2xl border bg-card">
        <SectionHeader
          icon={BuildingsIcon}
          iconTone="bg-primary/10 text-primary"
          title="Branch Library"
          subtitle="Every college branch registered in the system."
          trailing={<CountBadge count={state.branches.length} noun="branch" />}
        />
        <div className="p-4 sm:p-6">
          {state.branchesLoading && <div className="py-6 text-center text-[13px] text-muted-foreground">Loading branches…</div>}
          {!state.branchesLoading && state.branches.length === 0 && <EmptyState>No branches yet — add one above.</EmptyState>}
          {!state.branchesLoading && state.branches.length > 0 && (
            <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
              {state.branches.map((b) => (
                <div key={b.id} className="flex items-start justify-between gap-3 rounded-xl border bg-card p-4 transition-shadow hover:shadow-sm">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <MapPinIcon size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-[14px] font-bold">{b.name}</span>
                        <Badge variant="secondary" className="shrink-0 rounded-full px-2 text-[10.5px] font-bold">
                          {b.code}
                        </Badge>
                      </div>
                      <div className="truncate text-[11.5px] text-muted-foreground">{b.address || "No address on file"}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => actions.deleteBranch(b.id)}
                    className="flex size-7.5 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    title="Delete branch"
                  >
                    <TrashIcon size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function CoursesTab() {
  const { state, actions } = useDashboard();
  const selectedBranchId = state.selectedBranchForCourses || (state.branches[0] && state.branches[0].id);
  const selectedBranch = state.branches.find((b) => b.id === selectedBranchId);

  const coursesForBranch = useMemo(
    () => state.courses.filter((c) => c.branchId === selectedBranchId),
    [state.courses, selectedBranchId],
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Branch switcher — scopes both the editor and the library below */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border bg-card p-4">
        <span className="mr-1 text-[12px] font-semibold text-muted-foreground">Branch:</span>
        {state.branches.length === 0 && <span className="text-[12.5px] text-muted-foreground">Add a branch first.</span>}
        {state.branches.map((b) => {
          const active = selectedBranchId === b.id;
          return (
            <button
              key={b.id}
              onClick={() => actions.setSelectedBranchForCourses(b.id)}
              className={cn(
                "cursor-pointer rounded-full border px-3.5 py-2 text-[12.5px] font-bold transition-colors",
                active ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/60",
              )}
            >
              {b.name}
            </button>
          );
        })}
      </div>

      {/* Editor */}
      <section className="overflow-hidden rounded-2xl border bg-card">
        <SectionHeader
          icon={PlusIcon}
          iconTone={NEW_ICON_TONE}
          title="New Course"
          subtitle={selectedBranch ? `Add a course under ${selectedBranch.name}.` : "Select a branch above first."}
        />
        <div className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
            <div className="col-span-2 sm:col-span-1">
              <Label className="mb-1.5 text-xs font-semibold text-muted-foreground">Course Name *</Label>
              <Input
                placeholder="e.g. Mechanical Engineering"
                value={state.newCourse.name}
                onChange={(e) => actions.setNewCourseField("name", e.target.value)}
                className="h-9.5 text-[13px]"
              />
            </div>
            <div>
              <Label className="mb-1.5 text-xs font-semibold text-muted-foreground">Code *</Label>
              <Input
                placeholder="ME"
                value={state.newCourse.code}
                onChange={(e) => actions.setNewCourseField("code", e.target.value)}
                className="h-9.5 text-[13px]"
              />
            </div>
            <div>
              <Label className="mb-1.5 text-xs font-semibold text-muted-foreground">Total Years</Label>
              <Input
                type="number"
                min={1}
                max={6}
                value={state.newCourse.totalYears}
                onChange={(e) => actions.setNewCourseField("totalYears", e.target.value)}
                className="h-9.5 text-[13px]"
              />
            </div>
            <div>
              <Label className="mb-1.5 text-xs font-semibold text-muted-foreground">Sem / Year</Label>
              <Input
                type="number"
                min={1}
                max={4}
                value={state.newCourse.semestersPerYear}
                onChange={(e) => actions.setNewCourseField("semestersPerYear", e.target.value)}
                className="h-9.5 text-[13px]"
              />
            </div>
          </div>
          <div className="flex justify-end border-t pt-5">
            <Button onClick={actions.addCourse} disabled={!selectedBranchId} className="h-9.5 gap-1.5 rounded-lg px-5 text-[13px] font-bold">
              <PlusIcon className="size-3.5" />
              Add Course
            </Button>
          </div>
        </div>
      </section>

      {/* Library */}
      <section className="overflow-hidden rounded-2xl border bg-card">
        <SectionHeader
          icon={GraduationCapIcon}
          iconTone="bg-primary/10 text-primary"
          title="Course Library"
          subtitle={selectedBranch ? `Courses under ${selectedBranch.name}.` : "Courses for the selected branch."}
          trailing={<CountBadge count={coursesForBranch.length} noun="course" />}
        />
        <div className="p-4 sm:p-6">
          {state.coursesLoading && <div className="py-6 text-center text-[13px] text-muted-foreground">Loading courses…</div>}
          {!state.coursesLoading && coursesForBranch.length === 0 && <EmptyState>No courses for this branch yet — add one above.</EmptyState>}
          {!state.coursesLoading && coursesForBranch.length > 0 && (
            <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
              {coursesForBranch.map((c) => (
                <div key={c.id} className="flex items-start justify-between gap-3 rounded-xl border bg-card p-4 transition-shadow hover:shadow-sm">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <GraduationCapIcon size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-[14px] font-bold">{c.name}</span>
                        <Badge variant="secondary" className="shrink-0 rounded-full px-2 text-[10.5px] font-bold">
                          {c.code}
                        </Badge>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-[10.5px] font-semibold text-foreground/80">
                          {c.totalYears} yr{c.totalYears === 1 ? "" : "s"}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-[10.5px] font-semibold text-foreground/80">
                          {c.semestersPerYear} sem/yr
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => actions.deleteCourse(c.id)}
                    className="flex size-7.5 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    title="Delete course"
                  >
                    <TrashIcon size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
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
    <section className="overflow-hidden rounded-2xl border bg-card">
      <SectionHeader
        icon={CalendarBlankIcon}
        iconTone="bg-primary/10 text-primary"
        title="Years & Semesters"
        subtitle="Adjust how many years and semesters each course runs for."
        trailing={<CountBadge count={state.courses.length} noun="course" />}
      />
      {state.coursesLoading && <div className="py-6 text-center text-[13px] text-muted-foreground">Loading courses…</div>}
      {!state.coursesLoading && state.courses.length === 0 && (
        <div className="p-4 sm:p-6">
          <EmptyState>No courses yet — add one in the Courses tab first.</EmptyState>
        </div>
      )}
      {!state.coursesLoading && state.courses.length > 0 && (
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
      )}
    </section>
  );
}

function PricingTab() {
  const { state, actions } = useDashboard();
  const p = state.pricing;

  // Local edit buffer — only committed to the server on "Save Rates", so
  // typing a new value doesn't affect Analytics spend until it's saved.
  const [form, setForm] = useState({ utilityRate: "0", marketingRate: "0", gstPercent: "18" });
  useEffect(() => {
    if (p) setForm({ utilityRate: String(p.utilityRate), marketingRate: String(p.marketingRate), gstPercent: String(p.gstPercent) });
  }, [p]);

  function handleSave() {
    const utilityRate = Number(form.utilityRate);
    const marketingRate = Number(form.marketingRate);
    const gstPercent = Number(form.gstPercent);
    if (!Number.isFinite(utilityRate) || !Number.isFinite(marketingRate) || !Number.isFinite(gstPercent)) return;
    actions.savePricing({ utilityRate, marketingRate, gstPercent });
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="overflow-hidden rounded-2xl border bg-card">
        <SectionHeader
          icon={CurrencyInrIcon}
          iconTone="bg-primary/10 text-primary"
          title="Message Pricing"
          subtitle="₹/message rate (excl. GST) used to estimate WhatsApp spend on the Analytics page."
        />
        <div className="flex flex-col gap-4 p-5 sm:p-6">
          {state.pricingLoading ? (
            <div className="py-6 text-center text-[13px] text-muted-foreground">Loading pricing…</div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                <div>
                  <Label className="mb-1.5 text-xs font-semibold text-muted-foreground">Utility Rate (₹/msg)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.utilityRate}
                    onChange={(e) => setForm((f) => ({ ...f, utilityRate: e.target.value }))}
                    className="h-9.5 text-[13px]"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 text-xs font-semibold text-muted-foreground">Marketing Rate (₹/msg)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.marketingRate}
                    onChange={(e) => setForm((f) => ({ ...f, marketingRate: e.target.value }))}
                    className="h-9.5 text-[13px]"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 text-xs font-semibold text-muted-foreground">GST %</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.gstPercent}
                    onChange={(e) => setForm((f) => ({ ...f, gstPercent: e.target.value }))}
                    className="h-9.5 text-[13px]"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between border-t pt-5">
                <div className="text-[11.5px] text-muted-foreground">
                  {p ? `Last updated ${new Date(p.updatedAt).toLocaleString()}` : ""}
                </div>
                <Button onClick={handleSave} disabled={state.pricingSaving} className="h-9.5 gap-1.5 rounded-lg px-5 text-[13px] font-bold">
                  {state.pricingSaving ? "Saving…" : "Save Rates"}
                </Button>
              </div>
            </>
          )}
        </div>
      </section>
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
                <div>
                  <Label className="mb-1.5 text-xs font-semibold text-muted-foreground">
                    Language Code (must match the approved locale in WhatsApp Manager)
                  </Label>
                  <Select
                    value={state.newTemplate.languageCode || "en_US"}
                    items={TEMPLATE_LANGUAGE_LABEL}
                    onValueChange={(v) => actions.setNewTemplateField("languageCode", v ?? "en_US")}
                  >
                    <SelectTrigger className="h-9.5 w-full text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Falls back to whatever's already saved (e.g. an
                          older or less common locale) so an existing
                          template never silently shows the wrong value. */}
                      {Object.entries(
                        state.newTemplate.languageCode && !TEMPLATE_LANGUAGE_LABEL[state.newTemplate.languageCode]
                          ? { ...TEMPLATE_LANGUAGE_LABEL, [state.newTemplate.languageCode]: state.newTemplate.languageCode }
                          : TEMPLATE_LANGUAGE_LABEL,
                      ).map(([value, label]) => (
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

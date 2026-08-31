import { useMemo, useRef } from "react";
import { ArrowClockwiseIcon, CaretDownIcon, FileIcon, FilePdfIcon, ImageIcon, VideoIcon, WarningCircleIcon, XIcon } from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { statusBadgeClass } from "@/lib/badge-styles";
import { computeRecipientCount } from "@/lib/recipient-count";
import { useDashboard } from "@/store/dashboard-store";
import { useAuth } from "@/store/auth-store";
import { WhatsappPreview } from "@/components/dashboard/whatsapp-preview";
import { NOTIFICATION_STATUS_LABEL, NOTIF_TYPE_LABEL } from "@/lib/types";

const HISTORY_FILTERS = ["All", ...Object.values(NOTIFICATION_STATUS_LABEL)];
const COLLEGE_NAME = "Hiray Group";
const COLLEGE_INITIALS = "GC";
const ATTACHMENT_ACCEPT =
  "image/jpeg,image/png,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation,video/mp4,video/3gpp";

function attachmentIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return ImageIcon;
  if (mimeType.startsWith("video/")) return VideoIcon;
  if (mimeType === "application/pdf") return FilePdfIcon;
  return FileIcon;
}

export function MessagesPage() {
  const { state, actions } = useDashboard();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const f = state.msgForm;
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const branchFilterItems = useMemo(() => {
    const m: Record<string, string> = { all: "All Colleges" };
    state.branches.forEach((b) => (m[b.id] = b.name));
    return m;
  }, [state.branches]);

  const coursesForCollege = useMemo(
    () => (f.branchId === "all" ? state.courses : state.courses.filter((c) => c.branchId === f.branchId)),
    [state.courses, f.branchId],
  );

  const courseFilterItems = useMemo(() => {
    const m: Record<string, string> = { all: "All Courses" };
    coursesForCollege.forEach((c) => (m[c.id] = c.name));
    return m;
  }, [coursesForCollege]);

  const yearFilterItems = useMemo(() => {
    const m: Record<string, string> = { all: "All Years" };
    for (let y = 1; y <= 6; y++) m[String(y)] = `Year ${y}`;
    return m;
  }, []);
  const semesterFilterItems = useMemo(() => {
    const m: Record<string, string> = { all: "All Semesters" };
    for (let s = 1; s <= 8; s++) m[String(s)] = `Semester ${s}`;
    return m;
  }, []);

  const matchedStudents = useMemo(() => {
    const yearNum = f.year === "all" ? undefined : Number(f.year);
    const semesterNum = f.semester === "all" ? undefined : Number(f.semester);
    return state.students.filter(
      (st) =>
        (f.branchId === "all" || st.branchId === f.branchId) &&
        (f.courseId === "all" || st.courseId === f.courseId) &&
        (yearNum === undefined || st.year === yearNum) &&
        (semesterNum === undefined || st.semester === semesterNum),
    );
  }, [state.students, f.branchId, f.courseId, f.year, f.semester]);
  const matchedStudentIds = useMemo(() => new Set(matchedStudents.map((s) => s.id)), [matchedStudents]);
  const matchedParents = useMemo(
    () => state.parents.filter((p) => matchedStudentIds.has(p.linkedStudentId)),
    [state.parents, matchedStudentIds],
  );

  const recipientCount = useMemo(
    () => computeRecipientCount({ students: state.students, parents: state.parents }, f),
    [state.students, state.parents, f],
  );
  const msgCharCount = f.message.length;

  const templatesForType = useMemo(
    () => (f.notifType ? state.templates.filter((t) => t.category === f.notifType) : state.templates),
    [state.templates, f.notifType],
  );
  const templateItems = useMemo(() => {
    const m: Record<string, string> = {};
    templatesForType.forEach((t) => (m[t.id] = `${t.name} (${t.whatsappTemplateName})`));
    return m;
  }, [templatesForType]);

  const selectedTemplate = useMemo(() => state.templates.find((t) => t.id === f.templateId), [state.templates, f.templateId]);

  // The template's approved body is the real message shape (placeholders
  // included). autoFillRecipientName fills {{1}} per-recipient server-side
  // (a representative placeholder stands in here since there's no single
  // "the" recipient to preview); otherwise what's typed in "Message" fills
  // {{1}} identically for every recipient in the batch.
  const previewTitle = f.title || "Your notification title";
  const previewBody = selectedTemplate?.bodyText
    ? selectedTemplate.autoFillRecipientName
      ? selectedTemplate.bodyText.replace(/\{\{\d+\}\}/g, "Recipient's Name")
      : f.message
        ? selectedTemplate.bodyText.replace(/\{\{\d+\}\}/g, f.message)
        : selectedTemplate.bodyText
    : f.message || "Your message will appear here as you type.";
  const previewHasCta = !!f.ctaLabel;
  const AttachmentIcon = f.attachment ? attachmentIcon(f.attachment.mimeType) : ImageIcon;
  const previewAttachmentKind: "image" | "video" | "document" | undefined = !f.attachment
    ? undefined
    : f.attachment.mimeType.startsWith("image/")
      ? "image"
      : f.attachment.mimeType.startsWith("video/")
        ? "video"
        : "document";
  const previewAttachmentImageUrl = previewAttachmentKind === "image" ? f.attachment?.url : undefined;
  const audienceLabelParts = [f.audience.students && "Students", f.audience.parents && "Parents"].filter(Boolean) as string[];

  const historyView = useMemo(
    () =>
      state.history.filter(
        (h) =>
          (state.historyFilter === "All" || NOTIFICATION_STATUS_LABEL[h.status] === state.historyFilter) &&
          (state.historySearch === "" || h.title.toLowerCase().includes(state.historySearch.toLowerCase())),
      ),
    [state.history, state.historyFilter, state.historySearch],
  );

  return (
    <div className="mx-auto max-w-400 px-4 py-7 sm:px-8">
      <div className="mb-5">
        <div className="text-[22px] font-extrabold">Send Notification</div>
        <div className="mt-0.5 text-[13px] text-muted-foreground">
          Compose and broadcast WhatsApp messages to students and parents using an approved template.
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1.55fr_1fr]">
        <div className="flex flex-col gap-5">
          {/* Notification Details */}
          <div className="rounded-2xl border bg-card p-6">
            <div className="mb-4.5 text-[15px] font-bold">Notification Details</div>
            <div className="mb-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Notification Type *</Label>
                <Select
                  value={f.notifType}
                  items={NOTIF_TYPE_LABEL}
                  onValueChange={(v) => {
                    actions.setMsgField("notifType", (v ?? "") as typeof f.notifType);
                    actions.setMsgField("templateId", "");
                  }}
                >
                  <SelectTrigger className="h-9.5 w-full text-[13.5px]">
                    <SelectValue placeholder="Select" />
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
                <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">WhatsApp Template *</Label>
                <Select value={f.templateId} items={templateItems} onValueChange={(v) => actions.setMsgField("templateId", v ?? "")}>
                  <SelectTrigger className="h-9.5 w-full text-[13.5px]">
                    <SelectValue placeholder={templatesForType.length ? "Select" : "No templates yet"} />
                  </SelectTrigger>
                  <SelectContent>
                    {templatesForType.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} ({t.whatsappTemplateName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {!selectedTemplate ? (
              <div className="rounded-lg border border-dashed bg-muted/30 px-3.5 py-3 text-[12.5px] text-muted-foreground">
                Select a WhatsApp Template above to see its approved content and what's left to fill in.
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Title (optional, internal label only — not sent to WhatsApp)</Label>
                  <Input
                    placeholder="e.g. Mid-Semester Exam Schedule"
                    value={f.title}
                    onChange={(e) => actions.setMsgField("title", e.target.value)}
                    className="h-9.5 text-[13.5px]"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Template Content</Label>
                  <div className="mb-2 rounded-lg border border-dashed bg-muted/40 px-3 py-2 text-[12px] whitespace-pre-wrap text-muted-foreground">
                    {selectedTemplate.bodyText || "(no body text saved for this template — add it in Settings → Message Templates)"}
                  </div>
                  {selectedTemplate.variables.length === 0 ? (
                    <div className="text-[12px] text-muted-foreground italic">
                      This template has no placeholders — the text above is sent exactly as-is.
                    </div>
                  ) : selectedTemplate.autoFillRecipientName ? (
                    <div className="text-[12px] text-muted-foreground italic">
                      This template personalizes the placeholder with each recipient's own name automatically — no message needed.
                    </div>
                  ) : (
                    <>
                      <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">
                        Message * — fills the placeholder above, same value for every recipient
                      </Label>
                      <Textarea
                        placeholder="Type your WhatsApp message..."
                        rows={4}
                        value={f.message}
                        onChange={(e) => actions.setMsgField("message", e.target.value)}
                        className="resize-y text-[13.5px]"
                      />
                      <div className={cn("mt-1 text-right text-[11.5px]", msgCharCount > 1024 ? "text-destructive" : "text-muted-foreground")}>
                        {msgCharCount} / 1024 characters
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Attachment */}
          {selectedTemplate?.attachmentAllowed && (
          <div className="rounded-2xl border bg-card p-6">
            <div className="mb-4.5 text-[15px] font-bold">Attachment (Optional)</div>
            <input
              ref={attachmentInputRef}
              type="file"
              accept={ATTACHMENT_ACCEPT}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) actions.uploadMsgAttachment(file);
                e.target.value = "";
              }}
            />
            {!f.attachment ? (
              <Button
                type="button"
                variant="outline"
                disabled={state.attachmentUploading}
                onClick={() => attachmentInputRef.current?.click()}
                className="h-8.5 rounded-lg px-4 text-[12.5px] font-semibold"
              >
                {state.attachmentUploading ? "Uploading…" : "Upload File"}
              </Button>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-2.5 py-1.5 text-[12.5px] font-semibold text-primary">
                <AttachmentIcon className="size-4" />
                {f.attachment.name}
                <span onClick={actions.removeMsgAttachment} className="ml-1 cursor-pointer font-extrabold text-primary/80">
                  <XIcon className="size-3" />
                </span>
              </div>
            )}
          </div>
          )}

          {/* CTA */}
          {selectedTemplate?.buttonAllowed && (
          <div className="rounded-2xl border bg-card p-6">
            <div className="mb-4.5 text-[15px] font-bold">Call-to-Action (Optional)</div>
            {!selectedTemplate.buttonUrlIsDynamic ? (
              <div className="text-[12.5px] text-muted-foreground italic">
                This template's button uses one fixed URL set on WhatsApp Manager — nothing to configure per message.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Button Label</Label>
                  <Input
                    placeholder="e.g. View Details"
                    value={f.ctaLabel}
                    onChange={(e) => actions.setMsgField("ctaLabel", e.target.value)}
                    className="h-9.5 text-[13.5px]"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Button URL — fills the {"{{1}}"} suffix</Label>
                  <Input
                    placeholder="https://"
                    value={f.ctaUrl}
                    onChange={(e) => actions.setMsgField("ctaUrl", e.target.value)}
                    className="h-9.5 text-[13.5px]"
                  />
                </div>
              </div>
            )}
          </div>
          )}

          {/* Recipients */}
          <div className="rounded-2xl border bg-card p-6">
            <div className="mb-4.5 text-[15px] font-bold">Recipients *</div>
            <div className={cn("mb-5 grid grid-cols-2 gap-3", isSuperAdmin ? "sm:grid-cols-4" : "sm:grid-cols-3")}>
              {isSuperAdmin && (
                <div>
                  <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">College</Label>
                  <Select
                    value={f.branchId}
                    items={branchFilterItems}
                    onValueChange={(v) => {
                      actions.setMsgField("branchId", v ?? "all");
                      actions.setMsgField("courseId", "all");
                    }}
                  >
                    <SelectTrigger className="h-8.5 w-full text-[12.5px]">
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
                </div>
              )}
              <div>
                <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Course</Label>
                <Select value={f.courseId} items={courseFilterItems} onValueChange={(v) => actions.setMsgField("courseId", v ?? "all")}>
                  <SelectTrigger className="h-8.5 w-full text-[12.5px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {coursesForCollege.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Year</Label>
                <Select value={f.year} items={yearFilterItems} onValueChange={(v) => actions.setMsgField("year", v ?? "all")}>
                  <SelectTrigger className="h-8.5 w-full text-[12.5px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {[1, 2, 3, 4, 5, 6].map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        Year {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Semester</Label>
                <Select value={f.semester} items={semesterFilterItems} onValueChange={(v) => actions.setMsgField("semester", v ?? "all")}>
                  <SelectTrigger className="h-8.5 w-full text-[12.5px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Semesters</SelectItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <SelectItem key={s} value={String(s)}>
                        Semester {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Label className="mb-2 block text-[12.5px] font-semibold text-muted-foreground">Target Audience *</Label>
            <div className="flex flex-wrap gap-3">
              <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-[9px] border bg-muted/40 px-3.5 py-2.5">
                <Checkbox checked={f.audience.students} onCheckedChange={() => actions.toggleAudience("students")} />
                <span className="text-[13.5px] font-semibold">Students</span>
                <span className="ml-auto text-xs text-muted-foreground">{matchedStudents.length}</span>
              </label>
              <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-[9px] border bg-muted/40 px-3.5 py-2.5">
                <Checkbox checked={f.audience.parents} onCheckedChange={() => actions.toggleAudience("parents")} />
                <span className="text-[13.5px] font-semibold">Parents</span>
                <span className="ml-auto text-xs text-muted-foreground">{matchedParents.length}</span>
              </label>
            </div>
          </div>

          {/* Schedule */}
          <div className="rounded-2xl border bg-card p-6">
            <div className="mb-4.5 text-[15px] font-bold">Schedule *</div>
            <div className="mb-3.5 flex flex-wrap gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => actions.setScheduleMode("schedule")}
                className={cn(
                  "h-9.5 rounded-lg px-5 text-[13px] font-bold",
                  f.scheduleMode === "schedule" && "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
                )}
              >
                Schedule
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => actions.setScheduleMode("now")}
                className={cn(
                  "h-9.5 rounded-lg px-5 text-[13px] font-bold",
                  f.scheduleMode === "now" && "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
                )}
              >
                Send Now
              </Button>
            </div>
            {f.scheduleMode === "schedule" && (
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Date</Label>
                  <Input
                    type="date"
                    value={f.scheduleDate}
                    onChange={(e) => actions.setMsgField("scheduleDate", e.target.value)}
                    className="h-9.5 text-[13.5px]"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">Time</Label>
                  <Input
                    type="time"
                    value={f.scheduleTime}
                    onChange={(e) => actions.setMsgField("scheduleTime", e.target.value)}
                    className="h-9.5 text-[13.5px]"
                  />
                </div>
              </div>
            )}
            <Button
              onClick={actions.sendNotification}
              disabled={state.sendingNotification}
              className="mt-4 h-10 w-full rounded-lg text-[13.5px] font-bold"
            >
              {state.sendingNotification ? "Sending…" : f.scheduleMode === "schedule" ? "Schedule Notification" : "Send Notification"}
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-5 lg:sticky lg:top-24">
          <div className="flex flex-col items-center rounded-2xl border bg-card p-5.5">
            <div className="mb-3.5 self-start text-[13px] font-bold text-muted-foreground">Live Preview</div>
            <WhatsappPreview
              title={previewTitle}
              body={previewBody}
              hasAttachment={!!f.attachment}
              attachmentLabel={f.attachment?.name ?? ""}
              attachmentImageUrl={previewAttachmentImageUrl}
              attachmentKind={previewAttachmentKind}
              hasCta={previewHasCta}
              ctaLabel={f.ctaLabel}
              collegeName={COLLEGE_NAME}
              collegeInitials={COLLEGE_INITIALS}
            />
          </div>

          <div className="rounded-2xl border bg-card p-5.5">
            <div className="mb-2 text-[13px] font-bold text-muted-foreground">Estimated Reach</div>
            <div className="text-[34px] leading-tight font-extrabold text-primary">{recipientCount.total.toLocaleString()}</div>
            <div className="mb-4 text-xs text-muted-foreground">recipients based on current filters</div>
            <div className="flex flex-col gap-2">
              <div className={cn("flex justify-between text-[12.5px]", f.audience.students ? "text-foreground" : "text-muted-foreground/50")}>
                <span>Students</span>
                <span className="font-bold">{matchedStudents.length}</span>
              </div>
              <div className={cn("flex justify-between text-[12.5px]", f.audience.parents ? "text-foreground" : "text-muted-foreground/50")}>
                <span>Parents</span>
                <span className="font-bold">{matchedParents.length}</span>
              </div>
            </div>
            <Button variant="outline" onClick={actions.openPreview} className="mt-4 h-8.5 w-full rounded-lg text-[12.5px] font-semibold">
              Preview Message
            </Button>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="mt-8">
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2.5">
          <div className="text-[17px] font-extrabold">Message History</div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={state.historyLoading}
              onClick={() => actions.refreshHistory()}
              className="h-8.5 gap-1.5 rounded-md px-3 text-xs font-bold"
            >
              <ArrowClockwiseIcon className={cn("size-3.5", state.historyLoading && "animate-spin")} />
              Refresh
            </Button>
            <Input
              placeholder="Search by title..."
              value={state.historySearch}
              onChange={(e) => actions.setHistorySearch(e.target.value)}
              className="h-8.5 w-44 text-[12.5px]"
            />
            <Select
              value={state.historyFilter}
              items={Object.fromEntries(HISTORY_FILTERS.map((l) => [l, l]))}
              onValueChange={(v) => actions.setHistoryFilter(v ?? "All")}
            >
              <SelectTrigger className="h-8.5 w-36 text-[12.5px] sm:hidden">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HISTORY_FILTERS.map((lbl) => (
                  <SelectItem key={lbl} value={lbl}>
                    {lbl}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="hidden flex-wrap items-center gap-2 sm:flex">
              {HISTORY_FILTERS.map((lbl) => {
                const active = state.historyFilter === lbl;
                return (
                  <Button
                    key={lbl}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => actions.setHistoryFilter(lbl)}
                    className={cn("h-7.5 rounded-md px-3 text-xs font-bold", active && "border-primary bg-primary text-primary-foreground")}
                  >
                    {lbl}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border bg-card">
          {/* Mobile: dropdown rows */}
          <div className="divide-y sm:hidden">
            {state.historyLoading && (
              <div className="py-8 text-center text-[13px] text-muted-foreground">Loading message history…</div>
            )}
            {!state.historyLoading && historyView.length === 0 && (
              <div className="py-8 text-center text-[13px] text-muted-foreground">No notifications yet.</div>
            )}
            {!state.historyLoading &&
              historyView.map((h) => (
                <details key={h.id} className="group px-4 py-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-semibold">{h.title}</div>
                      <div className="text-[11.5px] text-muted-foreground">{h.date}</div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="secondary" className={statusBadgeClass(NOTIFICATION_STATUS_LABEL[h.status])}>
                        {NOTIFICATION_STATUS_LABEL[h.status]}
                      </Badge>
                      <CaretDownIcon className="size-3.5 text-muted-foreground transition-transform group-open:rotate-180" />
                    </div>
                  </summary>
                  <div className="mt-3 flex flex-col gap-1.5 text-[12.5px]">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <Badge variant="secondary" className={statusBadgeClass(h.type === "—" ? "—" : NOTIF_TYPE_LABEL[h.type])}>
                        {h.type === "—" ? "—" : NOTIF_TYPE_LABEL[h.type]}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Audience</span>
                      <span className="font-semibold">{h.audience}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Recipients</span>
                      <span className="font-semibold">{h.recipients.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivered / Read / Failed</span>
                      <span className="font-semibold">
                        {h.delivered} / {h.read} /{" "}
                        {h.failed > 0 ? (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 text-destructive underline underline-offset-2"
                            onClick={() => actions.viewFailedLogs(h.id)}
                          >
                            {h.failed} <WarningCircleIcon className="size-3.5" />
                          </button>
                        ) : (
                          h.failed
                        )}
                      </span>
                    </div>
                  </div>
                </details>
              ))}
          </div>
          {/* Desktop/tablet: table */}
          <div className="hidden overflow-x-auto sm:block">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Date</TableHead>
                <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Title</TableHead>
                <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Type</TableHead>
                <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Audience</TableHead>
                <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Recipients</TableHead>
                <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Status</TableHead>
                <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Delivered / Read / Failed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.historyLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-[13px] text-muted-foreground">
                    Loading message history…
                  </TableCell>
                </TableRow>
              )}
              {!state.historyLoading && historyView.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-[13px] text-muted-foreground">
                    No notifications yet.
                  </TableCell>
                </TableRow>
              )}
              {!state.historyLoading &&
                historyView.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="text-[13px]">{h.date}</TableCell>
                    <TableCell className="text-[13px] font-semibold">{h.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusBadgeClass(h.type === "—" ? "—" : NOTIF_TYPE_LABEL[h.type])}>
                        {h.type === "—" ? "—" : NOTIF_TYPE_LABEL[h.type]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[13px]">{h.audience}</TableCell>
                    <TableCell className="text-[13px]">{h.recipients.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusBadgeClass(NOTIFICATION_STATUS_LABEL[h.status])}>
                        {NOTIFICATION_STATUS_LABEL[h.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[12.5px] text-muted-foreground">
                      {h.delivered} / {h.read} /{" "}
                      {h.failed > 0 ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-destructive underline underline-offset-2"
                          onClick={() => actions.viewFailedLogs(h.id)}
                        >
                          {h.failed} <WarningCircleIcon className="size-3.5" />
                        </button>
                      ) : (
                        h.failed
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          </div>
        </div>
      </div>

      <PreviewDialog
        open={state.showPreview}
        onClose={actions.closePreview}
        title={previewTitle}
        body={previewBody}
        hasAttachment={!!f.attachment}
        attachmentLabel={f.attachment?.name ?? ""}
        attachmentImageUrl={previewAttachmentImageUrl}
        attachmentKind={previewAttachmentKind}
        hasCta={previewHasCta}
        ctaLabel={f.ctaLabel}
        recipientCount={recipientCount.total}
        audienceLabel={audienceLabelParts.join(", ") || "no audience selected"}
      />

      <Dialog open={!!state.failureDialogNotificationId} onOpenChange={(v) => !v && actions.closeFailedLogs()}>
        <DialogContent className="max-w-125 rounded-[20px] p-6">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-extrabold">Why did these fail?</DialogTitle>
          </DialogHeader>
          <div className="flex max-h-100 flex-col gap-3 overflow-y-auto">
            {state.failureDialogLoading && (
              <div className="py-6 text-center text-[13px] text-muted-foreground">Loading…</div>
            )}
            {!state.failureDialogLoading && state.failureDialogLogs.length === 0 && (
              <div className="py-6 text-center text-[13px] text-muted-foreground">No failed recipients found.</div>
            )}
            {!state.failureDialogLoading &&
              state.failureDialogLogs.map((log) => (
                <div key={log.id} className="rounded-xl border bg-muted/30 p-3">
                  <div className="text-[13px] font-semibold">{log.phone}</div>
                  <div className="mt-1 text-[12.5px] text-muted-foreground">
                    {log.errorMessage || "No error detail returned by WhatsApp."}
                  </div>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface PreviewDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  body: string;
  hasAttachment: boolean;
  attachmentLabel: string;
  attachmentImageUrl?: string;
  attachmentKind?: "image" | "video" | "document";
  hasCta: boolean;
  ctaLabel: string;
  recipientCount: number;
  audienceLabel: string;
}

function PreviewDialog({
  open,
  onClose,
  title,
  body,
  hasAttachment,
  attachmentLabel,
  attachmentImageUrl,
  attachmentKind,
  hasCta,
  ctaLabel,
  recipientCount,
  audienceLabel,
}: PreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-100 rounded-[20px] p-6">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-extrabold">Notification Preview</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center rounded-2xl bg-[#0b141a] p-1">
          <WhatsappPreview
            title={title}
            body={body}
            hasAttachment={hasAttachment}
            attachmentLabel={attachmentLabel}
            attachmentImageUrl={attachmentImageUrl}
            attachmentKind={attachmentKind}
            hasCta={hasCta}
            ctaLabel={ctaLabel}
            collegeName={COLLEGE_NAME}
            collegeInitials={COLLEGE_INITIALS}
          />
        </div>
        <div className="text-[12.5px] text-muted-foreground">
          Sending to <b className="text-foreground">{recipientCount.toLocaleString()}</b> recipients via {audienceLabel}.
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose} className="h-8.5 rounded-lg px-4.5 text-[13px] font-bold">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useMemo } from "react"
import {
  FileIcon,
  FilePdfIcon,
  ImageIcon,
  VideoIcon,
  XIcon,
} from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { statusBadgeClass } from "@/lib/badge-styles"
import { computeRecipientCount } from "@/lib/recipient-count"
import { useDashboard } from "@/store/dashboard-store"
import { WhatsappPreview } from "@/components/dashboard/whatsapp-preview"
import type { AttachmentType } from "@/lib/types"

const ATTACHMENT_DEFS: {
  type: AttachmentType
  label: string
  filename: string
  icon: typeof ImageIcon
}[] = [
  {
    type: "image",
    label: "Upload Image",
    filename: "brochure.jpg",
    icon: ImageIcon,
  },
  {
    type: "pdf",
    label: "Upload PDF",
    filename: "notice.pdf",
    icon: FilePdfIcon,
  },
  {
    type: "document",
    label: "Upload Document",
    filename: "circular.docx",
    icon: FileIcon,
  },
  {
    type: "video",
    label: "Upload Video",
    filename: "event.mp4",
    icon: VideoIcon,
  },
]

const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year"]
const HISTORY_FILTERS = ["All", "Sent", "Scheduled", "Draft", "Failed"]
const COLLEGE_NAME = "Greenfield College"
const COLLEGE_INITIALS = "GC"

export function MessagesPage() {
  const { state, actions } = useDashboard()
  const f = state.msgForm

  const branchMap = useMemo(() => {
    const m: Record<string, string> = {}
    state.branches.forEach((b) => (m[b.id] = b.name))
    return m
  }, [state.branches])

  const collegeOptions = useMemo(
    () => state.branches.map((b) => b.name),
    [state.branches]
  )
  const coursesForCollege = useMemo(
    () =>
      f.college !== "all"
        ? state.courses.filter((c) => branchMap[c.branchId] === f.college)
        : state.courses,
    [state.courses, branchMap, f.college]
  )

  const matchedStudents = useMemo(
    () =>
      state.students.filter(
        (st) =>
          (f.college === "all" || st.college === f.college) &&
          (f.course === "all" || st.course === f.course) &&
          (f.year === "all" || st.year === f.year) &&
          (f.division === "all" || st.division === f.division)
      ),
    [state.students, f.college, f.course, f.year, f.division]
  )
  const matchedStudentsCount = matchedStudents.length
  const facultyCount = state.faculty.length
  const recipientCount = computeRecipientCount(state, f)
  const msgCharCount = f.message.length

  const attachmentChips = ATTACHMENT_DEFS.filter((d) => f.attachments[d.type])
  const hasAnyAttachment = attachmentChips.length > 0
  const previewTitle = f.title || "Your notification title"
  const previewBody = f.message || "Your message will appear here as you type."
  const previewHasCta = !!f.ctaLabel
  const previewAttachmentLabel = attachmentChips.length
    ? f.attachments[attachmentChips[0].type]!.name
    : ""
  const audienceLabelParts = [
    f.audience.students && "Students",
    f.audience.parents && "Parents",
    f.audience.staff && "Staff",
  ].filter(Boolean) as string[]

  const historyView = useMemo(
    () =>
      state.history.filter(
        (h) =>
          (state.historyFilter === "All" || h.status === state.historyFilter) &&
          (state.historySearch === "" ||
            h.title.toLowerCase().includes(state.historySearch.toLowerCase()))
      ),
    [state.history, state.historyFilter, state.historySearch]
  )

  return (
    <div className="mx-auto max-w-400 px-8 py-7">
      <div className="mb-5">
        <div className="text-[22px] font-extrabold">Send Notification</div>
        <div className="mt-0.5 text-[13px] text-muted-foreground">
          Compose and broadcast WhatsApp messages to students, parents, and
          staff.
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1.55fr_1fr]">
        <div className="flex flex-col gap-5">
          {/* Notification Details */}
          <div className="rounded-2xl border bg-card p-6">
            <div className="mb-4.5 text-[15px] font-bold">
              Notification Details
            </div>
            <div className="mb-4">
              <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">
                Notification Type *
              </Label>
              <Select
                value={f.notifType}
                onValueChange={(v) =>
                  actions.setMsgField("notifType", v as typeof f.notifType)
                }
              >
                <SelectTrigger className="h-9.5 w-full text-[13.5px]">
                  <SelectValue placeholder="Select Notification Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Utility">Utility</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">
                Title *
              </Label>
              <Input
                placeholder="e.g. Mid-Semester Exam Schedule"
                value={f.title}
                onChange={(e) => actions.setMsgField("title", e.target.value)}
                className="h-9.5 text-[13.5px]"
              />
            </div>
            <div>
              <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">
                Message *
              </Label>
              <Textarea
                placeholder="Type your WhatsApp message..."
                rows={5}
                value={f.message}
                onChange={(e) => actions.setMsgField("message", e.target.value)}
                className="resize-y text-[13.5px]"
              />
              <div
                className={cn(
                  "mt-1 text-right text-[11.5px]",
                  msgCharCount > 1024
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}
              >
                {msgCharCount} / 1024 characters
              </div>
            </div>
          </div>

          {/* Attachment */}
          <div className="rounded-2xl border bg-card p-6">
            <div className="mb-4.5 text-[15px] font-bold">
              Attachment (Optional)
            </div>
            <div className="mb-3.5 flex flex-wrap gap-2.5">
              {ATTACHMENT_DEFS.map((d) => {
                const active = !!f.attachments[d.type]
                return (
                  <Button
                    key={d.type}
                    type="button"
                    variant="outline"
                    onClick={() => actions.toggleAttachment(d.type, d.filename)}
                    className={cn(
                      "h-8.5 rounded-lg px-4 text-[12.5px] font-semibold",
                      active && "border-primary/30 bg-primary/10 text-primary"
                    )}
                  >
                    {d.label}
                  </Button>
                )
              })}
            </div>
            {hasAnyAttachment && (
              <div className="flex flex-wrap gap-2">
                {attachmentChips.map((chip) => (
                  <div
                    key={chip.type}
                    className="inline-flex items-center rounded-lg border border-primary/25 bg-primary/10 px-2.5 py-1.5 text-[12.5px] font-semibold text-primary"
                  >
                    {f.attachments[chip.type]!.name}
                    <span
                      onClick={() =>
                        actions.toggleAttachment(chip.type, chip.filename)
                      }
                      className="ml-2 cursor-pointer font-extrabold text-primary/80"
                    >
                      <XIcon className="size-3" />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="rounded-2xl border bg-card p-6">
            <div className="mb-4.5 text-[15px] font-bold">
              Call-to-Action (Optional)
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">
                  Button Label
                </Label>
                <Input
                  placeholder="e.g. View Details"
                  value={f.ctaLabel}
                  onChange={(e) =>
                    actions.setMsgField("ctaLabel", e.target.value)
                  }
                  className="h-9.5 text-[13.5px]"
                />
              </div>
              <div>
                <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">
                  Button URL
                </Label>
                <Input
                  placeholder="https://"
                  value={f.ctaUrl}
                  onChange={(e) =>
                    actions.setMsgField("ctaUrl", e.target.value)
                  }
                  className="h-9.5 text-[13.5px]"
                />
              </div>
            </div>
          </div>

          {/* Recipients */}
          <div className="rounded-2xl border bg-card p-6">
            <div className="mb-4.5 text-[15px] font-bold">Recipients *</div>
            <div className="mb-5 grid grid-cols-5 gap-3">
              <div>
                <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">
                  College
                </Label>
                <Select
                  value={f.college}
                  onValueChange={(v) => actions.setMsgField("college", v)}
                >
                  <SelectTrigger className="h-8.5 w-full text-[12.5px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Colleges</SelectItem>
                    {collegeOptions.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">
                  Course
                </Label>
                <Select
                  value={f.course}
                  onValueChange={(v) => actions.setMsgField("course", v)}
                >
                  <SelectTrigger className="h-8.5 w-full text-[12.5px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {coursesForCollege.map((c) => (
                      <SelectItem key={c.id} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">
                  Year
                </Label>
                <Select
                  value={f.year}
                  onValueChange={(v) => actions.setMsgField("year", v)}
                >
                  <SelectTrigger className="h-8.5 w-full text-[12.5px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {YEAR_OPTIONS.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">
                  Semester
                </Label>
                <Select
                  value={f.semester}
                  onValueChange={(v) => actions.setMsgField("semester", v)}
                >
                  <SelectTrigger className="h-8.5 w-full text-[12.5px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Semesters</SelectItem>
                    {Array.from(
                      { length: 8 },
                      (_, i) => `Semester ${i + 1}`
                    ).map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">
                  Division
                </Label>
                <Select
                  value={f.division}
                  onValueChange={(v) => actions.setMsgField("division", v)}
                >
                  <SelectTrigger className="h-8.5 w-full text-[12.5px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Divisions</SelectItem>
                    {state.divisions.map((d) => (
                      <SelectItem key={d} value={d}>
                        Division {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Label className="mb-2 block text-[12.5px] font-semibold text-muted-foreground">
              Target Audience *
            </Label>
            <div className="flex gap-3">
              <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-[9px] border bg-muted/40 px-3.5 py-2.5">
                <Checkbox
                  checked={f.audience.students}
                  onCheckedChange={() => actions.toggleAudience("students")}
                />
                <span className="text-[13.5px] font-semibold">Students</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {matchedStudentsCount}
                </span>
              </label>
              <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-[9px] border bg-muted/40 px-3.5 py-2.5">
                <Checkbox
                  checked={f.audience.parents}
                  onCheckedChange={() => actions.toggleAudience("parents")}
                />
                <span className="text-[13.5px] font-semibold">Parents</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {matchedStudentsCount}
                </span>
              </label>
              <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-[9px] border bg-muted/40 px-3.5 py-2.5">
                <Checkbox
                  checked={f.audience.staff}
                  onCheckedChange={() => actions.toggleAudience("staff")}
                />
                <span className="text-[13.5px] font-semibold">Staff</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {facultyCount}
                </span>
              </label>
            </div>
          </div>

          {/* Schedule */}
          <div className="rounded-2xl border bg-card p-6">
            <div className="mb-4.5 text-[15px] font-bold">Schedule *</div>
            <div className="mb-3.5 flex gap-2.5">
              <Button
                variant="outline"
                onClick={actions.saveDraft}
                className="h-10 rounded-lg px-5 text-[13.5px] font-semibold"
              >
                Save as Draft
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => actions.setScheduleMode("schedule")}
                className={cn(
                  "h-9.5 rounded-lg px-5 text-[13px] font-bold",
                  f.scheduleMode === "schedule" &&
                    "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
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
                  f.scheduleMode === "now" &&
                    "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                Send Now
              </Button>
            </div>
            {f.scheduleMode === "schedule" && (
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">
                    Date
                  </Label>
                  <Input
                    type="date"
                    value={f.scheduleDate}
                    onChange={(e) =>
                      actions.setMsgField("scheduleDate", e.target.value)
                    }
                    className="h-9.5 text-[13.5px]"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 text-[12.5px] font-semibold text-muted-foreground">
                    Time
                  </Label>
                  <Input
                    type="time"
                    value={f.scheduleTime}
                    onChange={(e) =>
                      actions.setMsgField("scheduleTime", e.target.value)
                    }
                    className="h-9.5 text-[13.5px]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="sticky top-24 flex flex-col gap-5">
          <div className="flex flex-col items-center rounded-2xl border bg-card p-5.5">
            <div className="mb-3.5 self-start text-[13px] font-bold text-muted-foreground">
              Live Preview
            </div>
            <WhatsappPreview
              title={previewTitle}
              body={previewBody}
              hasAttachment={hasAnyAttachment}
              attachmentLabel={previewAttachmentLabel}
              hasCta={previewHasCta}
              ctaLabel={f.ctaLabel}
              collegeName={COLLEGE_NAME}
              collegeInitials={COLLEGE_INITIALS}
            />
          </div>

          <div className="rounded-2xl border bg-card p-5.5">
            <div className="mb-2 text-[13px] font-bold text-muted-foreground">
              Estimated Reach
            </div>
            <div className="text-[34px] leading-tight font-extrabold text-primary">
              {recipientCount.toLocaleString()}
            </div>
            <div className="mb-4 text-xs text-muted-foreground">
              recipients based on current filters
            </div>
            <div className="flex flex-col gap-2">
              <div
                className={cn(
                  "flex justify-between text-[12.5px]",
                  f.audience.students
                    ? "text-foreground"
                    : "text-muted-foreground/50"
                )}
              >
                <span>Students</span>
                <span className="font-bold">{matchedStudentsCount}</span>
              </div>
              <div
                className={cn(
                  "flex justify-between text-[12.5px]",
                  f.audience.parents
                    ? "text-foreground"
                    : "text-muted-foreground/50"
                )}
              >
                <span>Parents</span>
                <span className="font-bold">{matchedStudentsCount}</span>
              </div>
              <div
                className={cn(
                  "flex justify-between text-[12.5px]",
                  f.audience.staff
                    ? "text-foreground"
                    : "text-muted-foreground/50"
                )}
              >
                <span>Staff</span>
                <span className="font-bold">{facultyCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="mt-8">
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2.5">
          <div className="text-[17px] font-extrabold">Message History</div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search by title..."
              value={state.historySearch}
              onChange={(e) => actions.setHistorySearch(e.target.value)}
              className="h-8.5 w-44 text-[12.5px]"
            />
            {HISTORY_FILTERS.map((lbl) => {
              const active = state.historyFilter === lbl
              return (
                <Button
                  key={lbl}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => actions.setHistoryFilter(lbl)}
                  className={cn(
                    "h-7.5 rounded-md px-3 text-xs font-bold",
                    active &&
                      "border-primary bg-primary text-primary-foreground"
                  )}
                >
                  {lbl}
                </Button>
              )
            })}
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
                  Date
                </TableHead>
                <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
                  Title
                </TableHead>
                <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
                  Type
                </TableHead>
                <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
                  Audience
                </TableHead>
                <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
                  Recipients
                </TableHead>
                <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
                  Status
                </TableHead>
                <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
                  Delivered / Read / Failed
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyView.map((h) => (
                <TableRow key={h.id}>
                  <TableCell className="text-[13px]">{h.date}</TableCell>
                  <TableCell className="text-[13px] font-semibold">
                    {h.title}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={statusBadgeClass(h.type)}
                    >
                      {h.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[13px]">{h.audience}</TableCell>
                  <TableCell className="text-[13px]">
                    {h.recipients.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={statusBadgeClass(h.status)}
                    >
                      {h.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[12.5px] text-muted-foreground">
                    {h.status === "Scheduled" || h.status === "Draft"
                      ? "—"
                      : `${h.delivered} / ${h.read} / ${h.failed}`}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <PreviewDialog
        open={state.showPreview}
        onClose={actions.closePreview}
        title={previewTitle}
        body={previewBody}
        hasAttachment={hasAnyAttachment}
        attachmentLabel={previewAttachmentLabel}
        hasCta={previewHasCta}
        ctaLabel={f.ctaLabel}
        recipientCount={recipientCount}
        audienceLabel={audienceLabelParts.join(", ") || "no audience selected"}
      />
    </div>
  )
}

interface PreviewDialogProps {
  open: boolean
  onClose: () => void
  title: string
  body: string
  hasAttachment: boolean
  attachmentLabel: string
  hasCta: boolean
  ctaLabel: string
  recipientCount: number
  audienceLabel: string
}

function PreviewDialog({
  open,
  onClose,
  title,
  body,
  hasAttachment,
  attachmentLabel,
  hasCta,
  ctaLabel,
  recipientCount,
  audienceLabel,
}: PreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-100 rounded-[20px] p-6">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-extrabold">
            Notification Preview
          </DialogTitle>
        </DialogHeader>
        <div className="flex justify-center rounded-2xl bg-[#0b141a] p-1">
          <WhatsappPreview
            title={title}
            body={body}
            hasAttachment={hasAttachment}
            attachmentLabel={attachmentLabel}
            hasCta={hasCta}
            ctaLabel={ctaLabel}
            collegeName={COLLEGE_NAME}
            collegeInitials={COLLEGE_INITIALS}
          />
        </div>
        <div className="text-[12.5px] text-muted-foreground">
          Sending to{" "}
          <b className="text-foreground">{recipientCount.toLocaleString()}</b>{" "}
          recipients via {audienceLabel}.
        </div>
        <div className="flex justify-end">
          <Button
            onClick={onClose}
            className="h-8.5 rounded-lg px-4.5 text-[13px] font-bold"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

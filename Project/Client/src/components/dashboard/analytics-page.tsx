import { useState, type ElementType, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Funnel,
  FunnelChart,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChatCircleTextIcon, CurrencyInrIcon, PaperPlaneTiltIcon, UsersThreeIcon, WarningCircleIcon } from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { NOTIF_TYPE_LABEL, NOTIFICATION_STATUS_LABEL, type NotificationStatus, type NotifType } from "@/lib/types";
import { useDashboard } from "@/store/dashboard-store";
import type { BranchSpendStat, ScopeStat, SenderStat, TemplateStat } from "@/services";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

// Fixed hex swatches (not CSS vars) so every chart segment renders a
// distinct, theme-legible color — mirrors the same color families used by
// the app's status badges elsewhere, just as raw hex for SVG fills.
const CATEGORY_COLOR: Record<string, string> = { UTILITY: "#3b82f6", MARKETING: "#8b5cf6" };
const STATUS_COLOR: Record<string, string> = {
  DRAFT: "#94a3b8",
  SCHEDULED: "#f59e0b",
  QUEUED: "#f59e0b",
  PROCESSING: "#3b82f6",
  COMPLETED: "#10b981",
  CANCELLED: "#94a3b8",
  FAILED: "#ef4444",
};
const ROLE_COLOR: Record<string, string> = { SUPER_ADMIN: "#f2994a", FACULTY: "#6366f1" };
const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "Super Admin", FACULTY: "Faculty" };
// Light → dark, one hue, for the delivery funnel's three ordered stages —
// an ordinal ramp (each stage is a step further along, not a distinct
// identity), so it darkens as the funnel narrows instead of using three
// unrelated categorical hues.
const FUNNEL_RAMP = ["#6da7ec", "#2a78d6", "#184f95"];

function StatBadge({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string }) {
  return (
    <Badge variant="outline" className="h-auto gap-1.5 rounded-full bg-card px-3.5 py-2 text-[11.5px] font-semibold">
      <Icon className="size-3.5 shrink-0 text-primary" />
      <span className="text-[13.5px] leading-none font-extrabold">{value}</span>
      <span className="leading-none text-muted-foreground">{label}</span>
    </Badge>
  );
}

function ChartCard({ title, description, children, empty }: { title: string; description: string; children: ReactNode; empty: boolean }) {
  return (
    <div className="rounded-2xl border bg-card p-5 sm:p-6">
      <div className="mb-1 text-[14px] font-bold">{title}</div>
      <div className="mb-4 text-[11.5px] text-muted-foreground">{description}</div>
      {empty ? (
        <div className="flex h-52 items-center justify-center rounded-xl border border-dashed text-[12.5px] text-muted-foreground">
          No data yet.
        </div>
      ) : (
        children
      )}
    </div>
  );
}

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  fontSize: 12,
  color: "var(--foreground)",
};
const axisTick = { fill: "var(--muted-foreground)", fontSize: 11 };

function HorizontalBarChart<T extends object>({ data, dataKey, nameKey }: { data: T[]; dataKey: keyof T & string; nameKey: keyof T & string }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 34)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
        <XAxis type="number" allowDecimals={false} tick={axisTick} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
        <YAxis
          type="category"
          dataKey={nameKey as string}
          width={150}
          tick={axisTick}
          axisLine={{ stroke: "var(--border)" }}
          tickLine={false}
          interval={0}
        />
        <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={tooltipStyle} />
        <Bar dataKey={dataKey as string} fill="var(--primary)" radius={[0, 6, 6, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Two bars per category, side by side — for comparing two related counts
// across the same set of categories on one shared axis (never two y-scales).
function GroupedHorizontalBarChart({
  data,
  series,
}: {
  data: Record<string, string | number>[];
  series: { key: string; name: string; color: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 42)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }} barGap={2}>
        <XAxis type="number" allowDecimals={false} tick={axisTick} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
        <YAxis type="category" dataKey="name" width={150} tick={axisTick} axisLine={{ stroke: "var(--border)" }} tickLine={false} interval={0} />
        <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11.5, color: "var(--muted-foreground)" }} iconType="circle" iconSize={8} />
        {series.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} radius={[0, 4, 4, 0]} maxBarSize={14} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

// A thin stem + end-dot instead of a filled bar — same ranking job as a bar
// chart, different silhouette, so it doesn't read as a repeat of the six
// other bar charts on this page.
function lollipopShape(props: unknown) {
  const { x, y, width, height, fill } = props as { x: number; y: number; width: number; height: number; fill: string };
  const cy = y + height / 2;
  const x2 = x + width;
  return (
    <g>
      <line x1={x} y1={cy} x2={x2} y2={cy} stroke={fill} strokeWidth={2} strokeLinecap="round" />
      <circle cx={x2} cy={cy} r={5} fill={fill} stroke="var(--card)" strokeWidth={2} />
    </g>
  );
}

function LollipopChart<T extends object>({ data, dataKey, nameKey }: { data: T[]; dataKey: keyof T & string; nameKey: keyof T & string }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 34)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
        <XAxis type="number" allowDecimals={false} tick={axisTick} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
        <YAxis
          type="category"
          dataKey={nameKey as string}
          width={150}
          tick={axisTick}
          axisLine={{ stroke: "var(--border)" }}
          tickLine={false}
          interval={0}
        />
        <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={tooltipStyle} />
        <Bar dataKey={dataKey as string} fill="var(--primary)" shape={lollipopShape} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// A ranked list with an inline proportional bar per row — reads as a
// leaderboard (rank, who, how much) rather than a plotted chart, which suits
// "who's sending" better than an axis ever could.
function LeaderboardList({ rows }: { rows: { key: string; primary: string; secondary?: string; value: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="flex flex-col gap-3">
      {rows.map((r, i) => (
        <div key={r.key} className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold",
              i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
            )}
          >
            {i + 1}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className="truncate text-[12.5px] font-semibold">{r.primary}</span>
              <span className="shrink-0 text-[12.5px] font-bold tabular-nums">{r.value.toLocaleString()}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${(r.value / max) * 100}%` }} />
            </div>
            {r.secondary && <div className="mt-1 truncate text-[10.5px] text-muted-foreground">{r.secondary}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

// One bar, two colored segments proportional to share — for a 2-way split
// this reads at a glance where a bar-chart axis is overkill.
function SplitBar({ segments }: { segments: { key: string; label: string; value: number; color: string }[] }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  return (
    <div>
      <div className="flex h-7 w-full gap-0.5 overflow-hidden rounded-full bg-muted">
        {segments.map((s) => (
          <div key={s.key} style={{ width: `${(s.value / total) * 100}%`, background: s.color }} />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        {segments.map((s) => (
          <div key={s.key} className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
            <span className="text-[12.5px] font-semibold">{s.label}</span>
            <span className="text-[12.5px] font-bold text-muted-foreground">
              {s.value.toLocaleString()} ({Math.round((s.value / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DonutChart({ data, colorFor }: { data: { key: string; label: string; value: number }[]; colorFor: (key: string) => string }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="label" innerRadius={50} outerRadius={80} paddingAngle={2}>
          {data.map((d) => (
            <Cell key={d.key} fill={colorFor(d.key)} stroke="var(--card)" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11.5, color: "var(--muted-foreground)" }} iconType="circle" iconSize={8} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function AnalyticsPage() {
  const { state } = useDashboard();
  const a = state.analytics;
  const p = state.pricing;

  // College filter for the Spend card only — purely local, filters the
  // already-fetched spendByBranch array. Rates themselves are configured in
  // Settings → Pricing, not here.
  const [spendBranchFilter, setSpendBranchFilter] = useState("all");

  const gstPercent = p?.gstPercent ?? 18;
  const gstMultiplier = 1 + gstPercent / 100;
  const spendByBranch: BranchSpendStat[] = a?.spendByBranch ?? [];
  const filteredBranchSpend = spendBranchFilter === "all" ? spendByBranch : spendByBranch.filter((b) => b.id === spendBranchFilter);

  const selectedBranch = spendBranchFilter === "all" ? null : spendByBranch.find((b) => b.id === spendBranchFilter);
  const utilityCount = selectedBranch ? selectedBranch.utilityCount : (a?.billableByCategory.UTILITY ?? 0);
  const marketingCount = selectedBranch ? selectedBranch.marketingCount : (a?.billableByCategory.MARKETING ?? 0);
  const utilitySpend = utilityCount * (p?.utilityRate ?? 0) * gstMultiplier;
  const marketingSpend = marketingCount * (p?.marketingRate ?? 0) * gstMultiplier;
  const totalSpend = utilitySpend + marketingSpend;

  const spendLineData = filteredBranchSpend.map((b) => ({
    name: b.name,
    utility: b.utilityCount * (p?.utilityRate ?? 0) * gstMultiplier,
    marketing: b.marketingCount * (p?.marketingRate ?? 0) * gstMultiplier,
  }));

  const deliveryRate = a && a.totalRecipients > 0 ? Math.round((a.delivered / a.totalRecipients) * 100) : 0;

  const categoryData = a
    ? Object.entries(a.categoryCounts)
        .filter(([, v]) => v > 0)
        .map(([key, value]) => ({ key, label: NOTIF_TYPE_LABEL[key as NotifType] ?? key, value }))
    : [];
  const statusData = a
    ? Object.entries(a.statusCounts)
        .filter(([, v]) => v > 0)
        .map(([key, value]) => ({ key, label: NOTIFICATION_STATUS_LABEL[key as NotificationStatus] ?? key, value }))
    : [];
  const roleSegments = a
    ? Object.entries(a.roleCounts)
        .filter(([, v]) => v > 0)
        .map(([key, value]) => ({ key, label: ROLE_LABEL[key] ?? key, value, color: ROLE_COLOR[key] ?? "#94a3b8" }))
    : [];

  // A real funnel needs cumulative, monotonically-narrowing stages — a raw
  // "sent" status count (messages *stuck* at sent, not yet delivered) would
  // undercount and could even read as narrower than "delivered". "Attempted"
  // instead sums every recipient that left the queue (sent + delivered +
  // failed), so each stage is a superset of the next. Failed is excluded on
  // purpose — a failed send never had a "delivered" or "read" future, so it
  // doesn't belong on this funnel's single path; it's called out below instead.
  const attempted = a ? a.sent + a.delivered + a.failed : 0;
  const funnelStages = a
    ? [
        { key: "attempted", name: "Attempted", value: attempted },
        { key: "delivered", name: "Delivered", value: a.delivered },
        { key: "read", name: "Read", value: a.read },
      ]
        .filter((s) => s.value > 0)
        .map((s, i, arr) => ({ ...s, labelText: `${s.name} — ${s.value.toLocaleString()}`, fill: FUNNEL_RAMP[i] ?? FUNNEL_RAMP[arr.length - 1] }))
    : [];

  // Sender's own course folded into the display name — a bar chart's Y-axis
  // only has room for one label per row, and "who" + "which course" is
  // exactly the pairing this view exists to answer.
  const senderRows = (a?.topSenders ?? []).map((s: SenderStat) => ({
    key: s.senderId,
    primary: s.name,
    secondary: s.courseName ?? undefined,
    value: s.count,
  }));
  const templateRows: (TemplateStat & { name: string })[] = a?.topTemplates ?? [];
  const branchRows: ScopeStat[] = a?.topBranches ?? [];
  const courseRows: ScopeStat[] = a?.topCourses ?? [];
  const senderCourseRows: ScopeStat[] = a?.topSenderCourses ?? [];

  // Top Courses (who they messaged) and Faculty Activity (who sent, by their
  // own course) share the same course axis and the same unit (a notification
  // count) — one grouped chart tells both stories at once instead of two
  // near-identical single-series bar charts back to back.
  const courseComparisonMap = new Map<string, { name: string; audience: number; faculty: number }>();
  courseRows.forEach((c) => courseComparisonMap.set(c.name, { name: c.name, audience: c.count, faculty: 0 }));
  senderCourseRows.forEach((c) => {
    const existing = courseComparisonMap.get(c.name);
    if (existing) existing.faculty = c.count;
    else courseComparisonMap.set(c.name, { name: c.name, audience: 0, faculty: c.count });
  });
  const courseComparisonRows = [...courseComparisonMap.values()]
    .sort((x, y) => y.audience + y.faculty - (x.audience + x.faculty))
    .slice(0, 10);

  return (
    <div className="mx-auto max-w-400 px-4 py-7 sm:px-8">
      <div className="mb-5">
        <div className="text-[22px] font-extrabold">Analytics</div>
        <div className="mt-0.5 text-[13px] text-muted-foreground">Who's sending what, which templates work, and how it's landing.</div>
      </div>

      {state.analyticsLoading && <div className="py-16 text-center text-[13px] text-muted-foreground">Loading analytics…</div>}

      {!state.analyticsLoading && !a && (
        <div className="rounded-2xl border border-dashed py-16 text-center text-[13px] text-muted-foreground">
          Couldn't load analytics right now.
        </div>
      )}

      {!state.analyticsLoading && a && (
        <div className="flex flex-col gap-6">
          {/* Summary */}
          <div className="rounded-2xl border bg-card p-5">
            <div className="flex flex-wrap gap-2.5">
              <StatBadge icon={PaperPlaneTiltIcon} value={a.totalNotifications.toLocaleString()} label="notifications sent" />
              <StatBadge icon={UsersThreeIcon} value={a.totalRecipients.toLocaleString()} label="recipients messaged" />
              <StatBadge icon={ChatCircleTextIcon} value={`${deliveryRate}%`} label="delivery rate" />
              <StatBadge icon={WarningCircleIcon} value={a.failed.toLocaleString()} label="failed" />
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                <span>Delivery rate</span>
                <span>{deliveryRate}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${deliveryRate}%` }} />
              </div>
            </div>
          </div>

          {/* Spend */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="lg:col-span-2 rounded-2xl border bg-card p-5 sm:p-6">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-[14px] font-bold">WhatsApp Spend</div>
                  <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                    Billable messages (sent, delivered or read) × the rate set in Settings → Pricing, incl. {gstPercent}% GST.
                  </div>
                </div>
                <Select value={spendBranchFilter} onValueChange={(v) => setSpendBranchFilter(v ?? "all")}>
                  <SelectTrigger className="h-8.5 w-48 shrink-0 text-[12.5px]">
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

              <div className="mb-4 flex flex-wrap gap-2.5">
                <StatBadge icon={CurrencyInrIcon} value={inr.format(utilitySpend)} label={`utility (${utilityCount.toLocaleString()} msgs)`} />
                <StatBadge icon={CurrencyInrIcon} value={inr.format(marketingSpend)} label={`marketing (${marketingCount.toLocaleString()} msgs)`} />
                <StatBadge icon={CurrencyInrIcon} value={inr.format(totalSpend)} label="total spend, incl. GST" />
              </div>

              {spendLineData.length === 0 ? (
                <div className="flex h-52 items-center justify-center rounded-xl border border-dashed text-[12.5px] text-muted-foreground">
                  No billable messages yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={spendLineData} margin={{ left: 8, right: 16, top: 8, bottom: 4 }}>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={axisTick} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
                    <YAxis tick={axisTick} axisLine={{ stroke: "var(--border)" }} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => inr.format(v)} />
                    <Legend wrapperStyle={{ fontSize: 11.5, color: "var(--muted-foreground)" }} iconType="circle" iconSize={8} />
                    <Line type="monotone" dataKey="utility" name="Utility" stroke={CATEGORY_COLOR.UTILITY} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="marketing" name="Marketing" stroke={CATEGORY_COLOR.MARKETING} strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}

              {filteredBranchSpend.length > 0 && (
                <div className="mt-5 overflow-x-auto rounded-xl border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">College</TableHead>
                        <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Utility Msgs</TableHead>
                        <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Marketing Msgs</TableHead>
                        <TableHead className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Spend (incl. GST)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBranchSpend.map((b) => {
                        const branchSpend = (b.utilityCount * (p?.utilityRate ?? 0) + b.marketingCount * (p?.marketingRate ?? 0)) * gstMultiplier;
                        return (
                          <TableRow key={b.id}>
                            <TableCell className="text-[13px] font-semibold">{b.name}</TableCell>
                            <TableCell className="text-[13px]">{b.utilityCount.toLocaleString()}</TableCell>
                            <TableCell className="text-[13px]">{b.marketingCount.toLocaleString()}</TableCell>
                            <TableCell className="text-[13px] font-bold">{inr.format(branchSpend)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>

          {/* Pies */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard title="By Category" description="Utility vs Marketing sends" empty={categoryData.length === 0}>
              <DonutChart data={categoryData} colorFor={(k) => CATEGORY_COLOR[k] ?? "#94a3b8"} />
            </ChartCard>
            <ChartCard title="By Status" description="Where notifications currently stand" empty={statusData.length === 0}>
              <DonutChart data={statusData} colorFor={(k) => STATUS_COLOR[k] ?? "#94a3b8"} />
            </ChartCard>
          </div>

          {/* Role split + delivery funnel */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard title="Super Admin vs Faculty" description="Notifications sent, by account role" empty={roleSegments.length === 0}>
              <SplitBar segments={roleSegments} />
            </ChartCard>
            <ChartCard
              title="Delivery Funnel"
              description="Every recipient that left the queue, narrowing from delivered to read"
              empty={funnelStages.length === 0}
            >
              <ResponsiveContainer width="100%" height={220}>
                <FunnelChart>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => v.toLocaleString()} />
                  <Funnel dataKey="value" data={funnelStages} isAnimationActive={false}>
                    {funnelStages.map((d) => (
                      <Cell key={d.key} fill={d.fill} />
                    ))}
                    <LabelList dataKey="labelText" position="right" fill="var(--foreground)" stroke="none" fontSize={12} fontWeight={700} />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
              {a.failed > 0 && (
                <div className="mt-2 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                  <span className="size-2 shrink-0 rounded-full" style={{ background: STATUS_COLOR.FAILED }} />
                  {a.failed.toLocaleString()} more failed outright and never entered this funnel.
                </div>
              )}
            </ChartCard>
          </div>

          {/* Senders + templates */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard title="Top Senders" description="Faculty & admins by notifications sent (with their course, if any)" empty={senderRows.length === 0}>
              <LeaderboardList rows={senderRows} />
            </ChartCard>
            <ChartCard title="Most-Used Templates" description="Approved templates by times sent" empty={templateRows.length === 0}>
              <LollipopChart data={templateRows} dataKey="count" nameKey="name" />
            </ChartCard>
          </div>

          {/* Branches + course comparison */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard
              title="Top Colleges"
              description="By successful (delivered/read) sends"
              empty={branchRows.length === 0}
            >
              <HorizontalBarChart data={branchRows} dataKey="count" nameKey="name" />
            </ChartCard>
            <ChartCard
              title="Courses: Messaged vs. Sending"
              description="Blue = sends targeted at the course's students. Indigo = sends by that course's own faculty — shows who's actually using the app vs. who's on the receiving end."
              empty={courseComparisonRows.length === 0}
            >
              <GroupedHorizontalBarChart
                data={courseComparisonRows}
                series={[
                  { key: "audience", name: "Messaged (audience)", color: CATEGORY_COLOR.UTILITY! },
                  { key: "faculty", name: "Sent by faculty", color: ROLE_COLOR.FACULTY! },
                ]}
              />
            </ChartCard>
          </div>
        </div>
      )}
    </div>
  );
}

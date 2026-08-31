import type { ElementType, ReactNode } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChatCircleTextIcon, PaperPlaneTiltIcon, UsersThreeIcon, WarningCircleIcon } from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
import { NOTIF_TYPE_LABEL, NOTIFICATION_STATUS_LABEL, type NotificationStatus, type NotifType } from "@/lib/types";
import { useDashboard } from "@/store/dashboard-store";
import type { ScopeStat, SenderStat, TemplateStat } from "@/services";

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

function HorizontalBarChart({ data, dataKey, nameKey }: { data: Record<string, unknown>[]; dataKey: string; nameKey: string }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 34)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
        <XAxis type="number" allowDecimals={false} tick={axisTick} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
        <YAxis
          type="category"
          dataKey={nameKey}
          width={120}
          tick={axisTick}
          axisLine={{ stroke: "var(--border)" }}
          tickLine={false}
          interval={0}
        />
        <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={tooltipStyle} />
        <Bar dataKey={dataKey} fill="var(--primary)" radius={[0, 6, 6, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
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
  const roleData = a
    ? Object.entries(a.roleCounts)
        .filter(([, v]) => v > 0)
        .map(([key, value]) => ({ key, label: ROLE_LABEL[key] ?? key, value }))
    : [];
  const funnelData = a
    ? [
        { key: "sent", label: "Sent", value: a.sent },
        { key: "delivered", label: "Delivered", value: a.delivered },
        { key: "read", label: "Read", value: a.read },
        { key: "failed", label: "Failed", value: a.failed },
      ].filter((d) => d.value > 0)
    : [];

  const senderRows: (SenderStat & { name: string })[] = a?.topSenders ?? [];
  const templateRows: (TemplateStat & { name: string })[] = a?.topTemplates ?? [];
  const branchRows: ScopeStat[] = a?.topBranches ?? [];
  const courseRows: ScopeStat[] = a?.topCourses ?? [];

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
            <ChartCard title="Super Admin vs Faculty" description="Notifications sent, by account role" empty={roleData.length === 0}>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={roleData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                  <XAxis type="number" allowDecimals={false} tick={axisTick} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
                  <YAxis type="category" dataKey="label" width={100} tick={axisTick} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
                  <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={tooltipStyle} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={34}>
                    {roleData.map((d) => (
                      <Cell key={d.key} fill={ROLE_COLOR[d.key] ?? "#94a3b8"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Delivery Funnel" description="Recipient outcomes across all sends" empty={funnelData.length === 0}>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={funnelData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                  <XAxis type="number" allowDecimals={false} tick={axisTick} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
                  <YAxis type="category" dataKey="label" width={70} tick={axisTick} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
                  <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={tooltipStyle} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={22}>
                    {funnelData.map((d) => (
                      <Cell key={d.key} fill={d.key === "failed" ? STATUS_COLOR.FAILED : "var(--primary)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Senders + templates */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard title="Top Senders" description="Faculty & admins by notifications sent" empty={senderRows.length === 0}>
              <HorizontalBarChart data={senderRows} dataKey="count" nameKey="name" />
            </ChartCard>
            <ChartCard title="Most-Used Templates" description="Approved templates by times sent" empty={templateRows.length === 0}>
              <HorizontalBarChart data={templateRows} dataKey="count" nameKey="name" />
            </ChartCard>
          </div>

          {/* Branches + courses */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard
              title="Top Colleges"
              description="By successful (delivered/read) sends"
              empty={branchRows.length === 0}
            >
              <HorizontalBarChart data={branchRows} dataKey="count" nameKey="name" />
            </ChartCard>
            <ChartCard title="Top Courses" description="By successful (delivered/read) sends" empty={courseRows.length === 0}>
              <HorizontalBarChart data={courseRows} dataKey="count" nameKey="name" />
            </ChartCard>
          </div>
        </div>
      )}
    </div>
  );
}

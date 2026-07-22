const STATUS_CLASSES: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  Sent: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  Graduated: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
  Scheduled: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  Draft: "bg-muted text-muted-foreground",
  Dropped: "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400",
  Failed: "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400",
  Inactive: "bg-muted text-muted-foreground",
  Utility: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
  Marketing: "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
  "Super Admin": "bg-primary/10 text-primary",
  Faculty: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
};

export function statusBadgeClass(status: string): string {
  return STATUS_CLASSES[status] ?? "bg-muted text-muted-foreground";
}

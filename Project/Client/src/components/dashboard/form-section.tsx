import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

// Shared visual language for dialog forms (Add/Edit Student, Add/Edit Parent) —
// mirrors the card + icon-badge header pattern used in Settings (Courses,
// Message Templates) so every "add/edit X" surface in the app reads the same.

export const NEW_ICON_TONE = "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400";
export const EDIT_ICON_TONE = "bg-primary/10 text-primary";

// Icon badge + title/subtitle row at the top of a dialog — swaps tone/icon
// between "new" (emerald, PlusIcon-ish) and "editing" (primary) automatically.
export function DialogFormHeader({
  icon: Icon,
  editing,
  title,
  subtitle,
}: {
  icon: ElementType;
  editing: boolean;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-1 flex items-center gap-3">
      <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", editing ? EDIT_ICON_TONE : NEW_ICON_TONE)}>
        <Icon size={16} weight="bold" />
      </div>
      <div className="min-w-0">
        <div className="truncate text-[15px] font-extrabold">{title}</div>
        <div className="text-[12px] text-muted-foreground">{subtitle}</div>
      </div>
    </div>
  );
}

// One labeled card section within a dialog form — icon badge + title bar,
// then the fields. Same shape as Settings' SectionHeader, scaled for a modal.
export function FormSection({
  icon: Icon,
  iconTone = "bg-primary/10 text-primary",
  title,
  subtitle,
  children,
}: {
  icon: ElementType;
  iconTone?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center gap-2.5 border-b bg-muted/30 px-4 py-2.5">
        <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-full", iconTone)}>
          <Icon size={13} weight="bold" />
        </div>
        <div className="min-w-0">
          <div className="text-[12.5px] font-bold">{title}</div>
          {subtitle && <div className="text-[11px] text-muted-foreground">{subtitle}</div>}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

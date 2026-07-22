import { DesktopIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/store/dashboard-store";
import type { Tab } from "@/lib/types";

const THEME_ICON = { light: SunIcon, dark: MoonIcon, system: DesktopIcon };

const TABS: { key: Tab; label: string }[] = [
  { key: "messages", label: "Messages" },
  { key: "students", label: "Students" },
  { key: "parents", label: "Parents" },
  { key: "faculty", label: "Faculty" },
  { key: "settings", label: "Settings" },
];

export function Header() {
  const { state, actions } = useDashboard();
  const { theme, setTheme } = useTheme();
  const ThemeIcon = THEME_ICON[theme];

  return (
    <div className="sticky top-0 z-40 border-b bg-card">
      <div className="flex items-center justify-between border-b px-8 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8.5 shrink-0 items-center justify-center rounded-[9px] bg-primary text-sm font-extrabold text-primary-foreground">
            HC
          </div>
          <div>
            <div className="text-sm font-extrabold tracking-tight leading-tight">Hiray College Notification System</div>
            <div className="text-[11.5px] font-medium text-muted-foreground">WhatsApp Messaging Dashboard</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={`Theme: ${theme} (click to change)`}
            className="size-8.5 rounded-full"
          >
            <ThemeIcon className="size-4" />
          </Button>
          <div className="flex items-center rounded-full border bg-muted p-0.75">
            <button
              onClick={() => actions.setRole("super_admin")}
              className={cn(
                "cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors",
                state.role === "super_admin" ? "bg-foreground text-background" : "text-muted-foreground",
              )}
            >
              Super Admin
            </button>
            <button
              onClick={() => actions.setRole("faculty")}
              className={cn(
                "cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors",
                state.role === "faculty" ? "bg-foreground text-background" : "text-muted-foreground",
              )}
            >
              Faculty
            </button>
          </div>
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-[12px] font-bold text-background">
            {state.role === "super_admin" ? "SA" : "FA"}
          </div>
        </div>
      </div>
      <div className="flex gap-6.5 px-8">
        {TABS.map((t) => {
          const active = state.activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => actions.setTab(t.key)}
              className={cn(
                "cursor-pointer border-b-[3px] px-0.5 pt-3.5 pb-3 font-sans text-[13px] font-semibold tracking-wide uppercase transition-colors",
                active ? "border-primary text-foreground font-extrabold" : "border-transparent text-muted-foreground",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

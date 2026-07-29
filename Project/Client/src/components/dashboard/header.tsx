import { DesktopIcon, MoonIcon, SignOutIcon, SunIcon } from "@phosphor-icons/react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/store/dashboard-store";
import { useAuth } from "@/store/auth-store";
import type { Tab } from "@/lib/types";

const THEME_ICON = { light: SunIcon, dark: MoonIcon, system: DesktopIcon };

const TABS: { key: Tab; label: string; superAdminOnly?: boolean }[] = [
  { key: "messages", label: "Messages" },
  { key: "students", label: "Students" },
  { key: "parents", label: "Parents" },
  { key: "faculty", label: "Faculty", superAdminOnly: true },
  { key: "settings", label: "Settings", superAdminOnly: true },
];

export function Header() {
  const { state, actions } = useDashboard();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const ThemeIcon = THEME_ICON[theme];

  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : "??";
  const roleLabel = user?.role === "SUPER_ADMIN" ? "Super Admin" : "Faculty";

  return (
    <div className="sticky top-0 z-40 border-b bg-card">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3.5 sm:px-8">
        <div className="flex min-w-0 items-center gap-2.5">
          {/* <div className="flex size-8.5 shrink-0 items-center justify-center rounded-[9px] bg-primary text-sm font-extrabold text-primary-foreground">
            HGI
          </div> */}
          <img src="./HirayLogo.png" alt="Hiray Logo" className="size-10 sm:size-20 shrink-0" />
          <div className="min-w-0">
            <div className="truncate text-sm font-extrabold tracking-tight leading-tight">Hiray Group of Institutes</div>
            <div className="hidden text-[11.5px] font-medium text-muted-foreground sm:block">WhatsApp Notification System</div>
          </div>
        </div>
        <Popover>
          <PopoverTrigger className="flex shrink-0 cursor-pointer items-center gap-2.5 rounded-full py-1 px-2 outline-none hover:bg-muted/60 sm:px-3">
            <div className="hidden text-right leading-tight sm:block">
              <div className="text-[12.5px] font-bold">{user?.name}</div>
              <div className="text-[11px] font-medium text-muted-foreground">{roleLabel}</div>
            </div>
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-[12px] font-bold text-background">
              {initials}
            </div>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 gap-1">
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[12.5px] font-medium hover:bg-muted"
            >
              <ThemeIcon className="size-4" />
              Theme: {theme}
            </button>
            <button
              type="button"
              onClick={() => logout()}
              className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[12.5px] font-medium text-destructive hover:bg-muted"
            >
              <SignOutIcon className="size-4" />
              Sign out
            </button>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex gap-4 overflow-x-auto px-4 sm:gap-6.5 sm:px-8">
        {TABS.filter((t) => !t.superAdminOnly || user?.role === "SUPER_ADMIN").map((t) => {
          const active = state.activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => actions.setTab(t.key)}
              className={cn(
                "shrink-0 cursor-pointer border-b-[3px] px-0.5 pt-3.5 pb-3 font-sans text-[13px] font-semibold tracking-wide whitespace-nowrap uppercase transition-colors",
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

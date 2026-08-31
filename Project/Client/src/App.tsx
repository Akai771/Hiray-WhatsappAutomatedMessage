import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/dashboard/header";
import { MessagesPage } from "@/components/dashboard/messages-page";
import { StudentsPage } from "@/components/dashboard/students-page";
import { ParentsPage } from "@/components/dashboard/parents-page";
import { FacultyPage } from "@/components/dashboard/faculty-page";
import { AnalyticsPage } from "@/components/dashboard/analytics-page";
import { SettingsPage } from "@/components/dashboard/settings-page";
import { LoginPage } from "@/components/login-page";
import { DashboardProvider, useDashboard } from "@/store/dashboard-store";
import { AuthProvider, useAuth } from "@/store/auth-store";

function DashboardShell() {
  const { state } = useDashboard();

  return (
    <div className="min-h-svh bg-muted/30">
      <Header />
      {state.activeTab === "messages" && <MessagesPage />}
      {state.activeTab === "students" && <StudentsPage />}
      {state.activeTab === "parents" && <ParentsPage />}
      {state.activeTab === "faculty" && <FacultyPage />}
      {state.activeTab === "analytics" && <AnalyticsPage />}
      {state.activeTab === "settings" && <SettingsPage />}
      <Toaster position="top-right" />
    </div>
  );
}

function AuthGate() {
  const { status, user } = useAuth();

  if (status === "loading") {
    return <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  }

  if (status === "unauthenticated" || !user) {
    return (
      <>
        <LoginPage />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <DashboardProvider initialRole={user.role === "SUPER_ADMIN" ? "super_admin" : "faculty"}>
      <DashboardShell />
    </DashboardProvider>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

export default App;

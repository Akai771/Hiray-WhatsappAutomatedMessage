import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/dashboard/header";
import { MessagesPage } from "@/components/dashboard/messages-page";
import { StudentsPage } from "@/components/dashboard/students-page";
import { ParentsPage } from "@/components/dashboard/parents-page";
import { FacultyPage } from "@/components/dashboard/faculty-page";
import { SettingsPage } from "@/components/dashboard/settings-page";
import { DashboardProvider, useDashboard } from "@/store/dashboard-store";

function DashboardShell() {
  const { state } = useDashboard();

  return (
    <div className="min-h-svh bg-muted/30">
      <Header />
      {state.activeTab === "messages" && <MessagesPage />}
      {state.activeTab === "students" && <StudentsPage />}
      {state.activeTab === "parents" && <ParentsPage />}
      {state.activeTab === "faculty" && <FacultyPage />}
      {state.activeTab === "settings" && <SettingsPage />}
      <Toaster position="top-right" />
    </div>
  );
}

export function App() {
  return (
    <DashboardProvider>
      <DashboardShell />
    </DashboardProvider>
  );
}

export default App;

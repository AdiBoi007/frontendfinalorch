import { Navigate, Outlet, Route, Routes, useParams } from "react-router-dom";
import { AppShell } from "./components/shell/AppShell";
import { LoginPage } from "./pages/LoginPage";
import { LiveDocPage } from "./pages/LiveDocPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LiveDocViewerPage } from "./pages/LiveDocViewerPage";
import { ProjectBrainPage } from "./pages/ProjectBrainPage";
import { ProjectMemoryPage } from "./pages/ProjectDocsPage";
import { ProjectDashboardPage } from "./pages/ProjectDashboardPage";
import { ProjectFlowchartPage } from "./pages/ProjectFlowchartPage";
import { ProjectConnectorsPage } from "./pages/ProjectConnectorsPage";
import { ProjectRequestsPage } from "./pages/ProjectRequestsPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { useWorkspaceStore } from "./store/workspaceStore";

function hasRole() {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(window.localStorage.getItem("orchestra_role"));
}

function ProtectedRoute() {
  if (!hasRole()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function OnboardingGuard() {
  const onboardingComplete = useWorkspaceStore((s) => s.onboardingComplete);
  if (!onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }
  return <Outlet />;
}

function ProjectMemoryRedirect() {
  const { id = "1" } = useParams();

  return <Navigate to={`/projects/${id}/memory`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route element={<OnboardingGuard />}>
          <Route path="/dashboard" element={<AppShell />}>
            <Route index element={<DashboardPage />} />
          </Route>
          <Route path="/projects" element={<AppShell />}>
            <Route index element={<ProjectsPage />} />
          </Route>
          <Route path="/settings" element={<AppShell />}>
            <Route index element={<SettingsPage />} />
          </Route>
          <Route path="/projects/:id" element={<AppShell />}>
            <Route index element={<ProjectDashboardPage />} />
            <Route path="brain" element={<ProjectBrainPage />} />
            <Route path="flow" element={<ProjectFlowchartPage />} />
            <Route path="live-doc" element={<LiveDocPage />} />
            <Route path="memory" element={<ProjectMemoryPage />} />
            <Route path="docs" element={<ProjectMemoryRedirect />} />
            <Route path="docs/:docId/view" element={<LiveDocViewerPage />} />
            <Route path="connectors" element={<ProjectConnectorsPage />} />
            <Route path="requests" element={<ProjectRequestsPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

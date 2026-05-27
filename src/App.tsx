import { Navigate, Outlet, Route, Routes, useParams } from "react-router-dom";
import { AppShell } from "./components/shell/AppShell";
import { LoginPage } from "./pages/LoginPage";
import { LiveDocViewerPage } from "./pages/LiveDocViewerPage";
import { MemoryPage } from "./pages/MemoryPage";
import { ConnectorsPage } from "./pages/ConnectorsPage";
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

function LegacyDocRedirect() {
  const { docId = "1" } = useParams();

  return <Navigate to={`/memory/docs/${docId}/view`} replace />;
}

function OnboardingGuard() {
  const onboardingComplete = useWorkspaceStore((s) => s.onboardingComplete);
  if (!onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route element={<OnboardingGuard />}>
          <Route element={<AppShell />}>
            <Route path="/memory" element={<MemoryPage />} />
            <Route path="/memory/docs/:docId/view" element={<LiveDocViewerPage />} />
            <Route path="/connectors" element={<ConnectorsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="/dashboard" element={<Navigate to="/memory" replace />} />
      <Route path="/projects" element={<Navigate to="/memory" replace />} />
      <Route path="/projects/:id" element={<Navigate to="/memory" replace />} />
      <Route path="/projects/:id/memory" element={<Navigate to="/memory" replace />} />
      <Route path="/projects/:id/connectors" element={<Navigate to="/connectors" replace />} />
      <Route path="/projects/:id/docs/:docId/view" element={<LegacyDocRedirect />} />
      <Route path="/projects/:id/*" element={<Navigate to="/memory" replace />} />
      <Route path="/requests" element={<Navigate to="/memory" replace />} />
    </Routes>
  );
}

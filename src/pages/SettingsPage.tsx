import { useEffect, useState } from "react";
import { getIntegrationStatuses, getUserRole, setUserRole } from "../lib/api";
import type { IntegrationStatus, UserRole } from "../lib/types";
import { useWorkspaceStore } from "../store/workspaceStore";

function IntegrationTile({
  integration,
  onConnect
}: {
  integration: IntegrationStatus;
  onConnect: (name: string) => void;
}) {
  return (
    <div className="min-w-[140px] flex-1 rounded-xl border border-[rgba(26,22,18,0.08)] bg-[#FAF8F5] p-4">
      <p className="font-sans text-[14px] font-medium text-[#1A1612]">{integration.name}</p>
      <span className={`mt-2 inline-flex ${integration.connected ? "orch-pill-green" : "orch-pill-red"}`}>
        {integration.connected ? "Connected" : "Disconnected"}
      </span>
      {!integration.connected ? (
        <button type="button" className="orch-btn-secondary mt-3 w-full" onClick={() => onConnect(integration.name)}>
          Connect
        </button>
      ) : null}
    </div>
  );
}

export function SettingsPage() {
  const userRole = useWorkspaceStore((state) => state.userRole);
  const profileName = useWorkspaceStore((state) => state.profileName);
  const profileEmail = useWorkspaceStore((state) => state.profileEmail);
  const setProfile = useWorkspaceStore((state) => state.setProfile);
  const [name, setName] = useState(profileName);
  const [email, setEmail] = useState(profileEmail);
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);

  useEffect(() => {
    void getIntegrationStatuses("1").then(setIntegrations);
  }, []);

  const handleRoleToggle = async (checked: boolean) => {
    const nextRole: UserRole = checked ? "developer" : "manager";
    await setUserRole(nextRole);
    void getUserRole();
  };

  return (
    <div className="orch-page h-full overflow-y-auto">
      <div className="orch-container space-y-6">
        <header>
          <h1 className="font-sans text-[24px] font-semibold text-[#1A1612]">Settings</h1>
          <p className="mt-2 font-sans text-[14px] text-[#78716C]">Profile, view mode, and workspace integrations.</p>
        </header>

        <section className="orch-card">
          <h2 className="font-sans text-[18px] font-semibold text-[#1A1612]">Profile</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="font-sans text-[12px] text-[#78716C]">Name</span>
              <input className="orch-input mt-1.5" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="block">
              <span className="font-sans text-[12px] text-[#78716C]">Email</span>
              <input className="orch-input mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
          </div>
          <p className="mt-4 font-sans text-[12px] text-[#78716C]">Role · {userRole === "developer" ? "Developer" : "Manager"}</p>
          <button
            type="button"
            className="orch-btn-primary mt-5"
            onClick={() => {
              setProfile(name, email);
              console.log("TODO: PATCH /v1/users/me profile");
            }}
          >
            Save
          </button>
        </section>

        <section className="orch-card">
          <h2 className="font-sans text-[18px] font-semibold text-[#1A1612]">View Mode</h2>
          <label className="mt-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-sans text-[14px] font-medium text-[#1A1612]">View as Developer</p>
              <p className="mt-1 font-sans text-[12px] text-[#78716C]">Testing only — switch between manager and developer views.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={userRole === "developer"}
              onClick={() => void handleRoleToggle(userRole !== "developer")}
              className={[
                "relative h-7 w-12 rounded-full transition-colors",
                userRole === "developer" ? "bg-[#B8543D]" : "bg-[rgba(26,22,18,0.15)]"
              ].join(" ")}
            >
              <span
                className={[
                  "absolute top-0.5 h-6 w-6 rounded-full bg-white transition-transform",
                  userRole === "developer" ? "translate-x-5" : "translate-x-0.5"
                ].join(" ")}
              />
            </button>
          </label>
        </section>

        <section className="orch-card">
          <h2 className="font-sans text-[18px] font-semibold text-[#1A1612]">Workspace Integrations</h2>
          <p className="mt-2 font-sans text-[12px] text-[#78716C]">
            These apply across your workspace. You can also connect integrations per project.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {integrations.map((integration) => (
              <IntegrationTile key={integration.id} integration={integration} onConnect={(label) => console.log(`TODO: connect workspace ${label}`)} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

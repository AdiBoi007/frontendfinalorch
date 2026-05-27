import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserRole, setUserRole } from "../lib/api";
import type { UserRole } from "../lib/types";
import { useWorkspaceStore } from "../store/workspaceStore";

function RoleSwitch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full p-0.5 transition-colors",
        checked ? "bg-[#B8543D]" : "bg-[rgba(26,22,18,0.15)]"
      ].join(" ")}
    >
      <span
        className={[
          "pointer-events-none block h-6 w-6 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        ].join(" ")}
      />
    </button>
  );
}

export function SettingsPage() {
  const userRole = useWorkspaceStore((state) => state.userRole);
  const profileName = useWorkspaceStore((state) => state.profileName);
  const profileEmail = useWorkspaceStore((state) => state.profileEmail);
  const setProfile = useWorkspaceStore((state) => state.setProfile);
  const [name, setName] = useState(profileName);
  const [email, setEmail] = useState(profileEmail);

  useEffect(() => {
    setName(profileName);
    setEmail(profileEmail);
  }, [profileName, profileEmail]);

  const handleRoleToggle = async (checked: boolean) => {
    const nextRole: UserRole = checked ? "developer" : "manager";
    await setUserRole(nextRole);
    void getUserRole();
  };

  return (
    <div className="orch-page">
      <div className="orch-container space-y-8">
        <header>
          <p className="font-mono text-[11px] tracking-[0.18em] text-[#B8543D]">SETTINGS</p>
          <h1 className="mt-2 font-sans text-[40px] font-light leading-none tracking-tight text-[#1A1612]">Settings</h1>
          <p className="mt-3 font-sans text-[14px] text-[#78716C]">Profile and workspace preferences.</p>
        </header>

        <section className="orch-card">
          <h2 className="font-sans text-[18px] font-semibold text-[#1A1612]">Profile</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="font-sans text-[12px] text-[#78716C]">Name</span>
              <input className="orch-input mt-1.5" value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label className="block">
              <span className="font-sans text-[12px] text-[#78716C]">Email</span>
              <input
                className="orch-input mt-1.5"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
          </div>
          <p className="mt-4 font-sans text-[12px] text-[#78716C]">
            Role · {userRole === "developer" ? "Developer" : "Manager"}
          </p>
          <button
            type="button"
            className="orch-btn-primary mt-5"
            onClick={() => {
              setProfile(name, email);
              console.log("TODO: PATCH /v1/users/me profile");
            }}
          >
            Save profile
          </button>
        </section>

        <section className="orch-card">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <h2 className="font-sans text-[18px] font-semibold text-[#1A1612]">View mode</h2>
              <p className="mt-1 font-sans text-[14px] font-medium text-[#1A1612]">View as developer</p>
              <p className="mt-1 font-sans text-[12px] leading-5 text-[#78716C]">
                Testing only — switch between manager and developer views.
              </p>
            </div>
            <RoleSwitch checked={userRole === "developer"} onChange={(checked) => void handleRoleToggle(checked)} />
          </div>
        </section>

        <section className="orch-card">
          <h2 className="font-sans text-[18px] font-semibold text-[#1A1612]">Integrations</h2>
          <p className="mt-2 font-sans text-[13px] leading-6 text-[#78716C]">
            Connect VS Code and other tools from the Connectors page. Integrations apply to your whole workspace.
          </p>
          <Link
            to="/connectors"
            className="orch-btn-secondary mt-5 inline-flex"
          >
            Open connectors
          </Link>
        </section>
      </div>
    </div>
  );
}

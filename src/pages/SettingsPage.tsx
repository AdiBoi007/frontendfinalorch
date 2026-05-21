import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { TbCheck, TbPlugConnected } from "react-icons/tb";
import Avatar from "../components/ui/Avatar";
import { getIntegrationStatuses } from "../lib/api";
import type { IntegrationStatus } from "../lib/types";

const pageVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } }
};

const sectionVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const }
  }
};

const categoryLabel: Record<IntegrationStatus["category"], string> = {
  comms:          "Communication",
  calendar:       "Calendar",
  payments:       "Payments",
  infrastructure: "Infrastructure",
  database:       "Database",
  hosting:        "Hosting",
  monitoring:     "Monitoring",
  notifications:  "Notifications"
};

const categoryOrder: IntegrationStatus["category"][] = [
  "comms", "calendar", "payments", "infrastructure",
  "database", "hosting", "monitoring", "notifications"
];

const userByRole = {
  manager: { name: "Sarah Chen",    initials: "SC", seed: "Sarah Chen",        role: "Manager"   },
  dev:     { name: "Marcus T",      initials: "MT", seed: "Marcus Thompson",   role: "Developer" },
  client:  { name: "Lisa F",        initials: "LF", seed: "Lisa Foster",       role: "Client"    }
} as const;

function getCurrentRole(): keyof typeof userByRole {
  if (typeof window === "undefined") return "manager";
  const stored = window.localStorage.getItem("orchestra_role");
  if (stored === "dev" || stored === "client") return stored;
  return "manager";
}

function IntegrationCard({ integration }: { integration: IntegrationStatus }) {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(integration.connected);

  const handleConnect = () => {
    if (connected) return;
    setConnecting(true);
    // stub: simulate async OAuth redirect in future
    window.setTimeout(() => setConnecting(false), 1200);
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-[rgba(26,22,18,0.08)] bg-white p-5 transition-colors hover:border-[rgba(26,22,18,0.14)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-sans text-[14px] font-medium text-[#1A1612]">{integration.name}</p>
          <p className="mt-0.5 font-mono text-[10px] tracking-[0.12em] text-[#78716C]">
            {categoryLabel[integration.category]}
          </p>
        </div>

        <span
          className={`flex-shrink-0 rounded-full px-2.5 py-1 font-mono text-[10px] tracking-[0.08em] ${
            connected
              ? "bg-[rgba(45,74,62,0.10)] text-[#2D4A3E]"
              : "bg-[rgba(158,59,46,0.08)] text-[#9E3B2E]"
          }`}
        >
          {connected ? "connected" : "not connected"}
        </span>
      </div>

      {integration.lastSyncedAt && connected && (
        <p className="mt-2 font-mono text-[10px] text-[rgba(120,113,108,0.6)]">
          Last synced {new Intl.DateTimeFormat("en-AU", { day: "2-digit", month: "short" }).format(new Date(integration.lastSyncedAt))}
        </p>
      )}

      <div className="mt-4">
        {connected ? (
          <div className="inline-flex items-center gap-1.5 font-sans text-[12px] text-[#2D4A3E]">
            <TbCheck size={13} strokeWidth={2} />
            Connected
          </div>
        ) : (
          <button
            type="button"
            onClick={handleConnect}
            disabled={connecting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#B8543D] px-3 py-1.5 font-sans text-[12px] font-medium text-[#B8543D] transition-colors hover:bg-[#B8543D] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <TbPlugConnected size={13} strokeWidth={1.6} />
            {connecting ? "Connecting…" : "Connect"}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function SettingsPage() {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const role = getCurrentRole();
  const user = userByRole[role];

  useEffect(() => {
    // Load integrations for the first project as the workspace default.
    // TODO: replace with GET /v1/workspace/integrations once workspace-level endpoint exists.
    getIntegrationStatuses("1").then(setIntegrations);
  }, []);

  const grouped = categoryOrder
    .map((cat) => ({
      category: cat,
      items: integrations.filter((i) => i.category === cat)
    }))
    .filter((group) => group.items.length > 0);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="h-full overflow-y-auto bg-bg px-10 pb-16 pt-12"
    >
      <motion.div variants={sectionVariants} className="mb-10">
        <p className="section-label">SETTINGS</p>
        <h1 className="mt-3 font-sans text-[40px] font-light leading-[1.05] tracking-tight text-[#1A1612]">Workspace</h1>
        <p className="mt-2 font-sans text-[13px] text-[#78716C]">Manage your profile and integration connections.</p>
      </motion.div>

      <motion.section variants={sectionVariants} className="mb-12 max-w-[480px]">
        <p className="section-label mb-6">PROFILE</p>
        <div className="solid-card p-6">
          <div className="flex items-center gap-4">
            <Avatar seed={user.seed} size={48} name={user.name} role={user.role} />
            <div>
              <p className="font-sans text-[18px] font-medium text-[#1A1612]">{user.name}</p>
              <p className="mt-0.5 font-mono text-[11px] tracking-[0.12em] text-[#78716C]">{user.role.toUpperCase()}</p>
            </div>
          </div>
          <p className="mt-4 font-sans text-[13px] leading-6 text-[#78716C]">
            Role is set at login. To switch roles, return to the{" "}
            <a href="/" className="text-[#B8543D] underline-offset-2 hover:underline">login screen</a>.
          </p>
        </div>
      </motion.section>

      <motion.section variants={sectionVariants}>
        <div className="mb-6 flex items-end justify-between">
          <p className="section-label">INTEGRATIONS</p>
          <p className="font-mono text-[11px] text-[#78716C]">
            {integrations.filter((i) => i.connected).length} / {integrations.length} connected
          </p>
        </div>

        <div className="space-y-8">
          {grouped.map((group) => (
            <div key={group.category}>
              <p className="mb-3 font-mono text-[11px] tracking-[0.14em] text-[rgba(120,113,108,0.6)]">
                {categoryLabel[group.category].toUpperCase()}
              </p>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
              >
                {group.items.map((integration) => (
                  <IntegrationCard key={integration.id} integration={integration} />
                ))}
              </motion.div>
            </div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { TbCheck, TbLink, TbPlugConnected } from "react-icons/tb";
import { useParams } from "react-router-dom";
import { getIntegrationStatuses } from "../lib/api";
import { mockProjects } from "../lib/mockData";
import type { IntegrationStatus } from "../lib/types";

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const }
  }
};

const INTEGRATION_ICONS: Record<string, string> = {
  "i-slack":    "SL",
  "i-gmail":    "GM",
  "i-whatsapp": "WA",
  "i-gcal":     "GC",
  "i-stripe":   "ST",
  "i-aws":      "AW",
  "i-supabase": "SB",
  "i-firebase": "FB",
  "i-vercel":   "VC",
  "i-sentry":   "SN"
};

const INTEGRATION_COLORS: Record<string, string> = {
  "i-slack":    "#4A154B",
  "i-gmail":    "#EA4335",
  "i-whatsapp": "#25D366",
  "i-gcal":     "#4285F4",
  "i-stripe":   "#635BFF",
  "i-aws":      "#FF9900",
  "i-supabase": "#3ECF8E",
  "i-firebase": "#FFCA28",
  "i-vercel":   "#000000",
  "i-sentry":   "#362D59"
};

function ConnectorCard({
  integration,
  onLink
}: {
  integration: IntegrationStatus & { linked?: boolean };
  onLink: (id: string) => void;
}) {
  const [linking, setLinking] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const isLinked = integration.linked ?? false;

  const handleLink = () => {
    if (isLinked || linking) return;
    setLinking(true);
    window.setTimeout(() => {
      onLink(integration.id);
      setLinking(false);
    }, 900);
  };

  const handleConnect = () => {
    if (connecting) return;
    setConnecting(true);
    window.setTimeout(() => setConnecting(false), 1200);
  };

  const initials = INTEGRATION_ICONS[integration.id] ?? integration.name.slice(0, 2).toUpperCase();
  const color = INTEGRATION_COLORS[integration.id] ?? "#78716C";

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -2 }}
      className="flex items-center gap-4 rounded-2xl border border-[rgba(26,22,18,0.08)] bg-white p-5 transition-colors hover:border-[rgba(26,22,18,0.14)]"
    >
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl font-mono text-[11px] font-semibold text-white"
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-sans text-[14px] font-medium text-[#1A1612]">{integration.name}</p>
        {integration.accountConnected && integration.lastSyncedAt ? (
          <p className="mt-0.5 font-mono text-[10px] tracking-[0.08em] text-[rgba(120,113,108,0.6)]">
            account connected · synced{" "}
            {new Intl.DateTimeFormat("en-AU", { day: "2-digit", month: "short" }).format(
              new Date(integration.lastSyncedAt)
            )}
          </p>
        ) : (
          <p className="mt-0.5 font-mono text-[10px] tracking-[0.08em] text-[rgba(120,113,108,0.6)]">
            not connected to account
          </p>
        )}
      </div>

      <div className="flex-shrink-0">
        {integration.accountConnected ? (
          isLinked ? (
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-[rgba(45,74,62,0.08)] px-3 py-1.5 font-sans text-[12px] font-medium text-[#2D4A3E]">
              <TbCheck size={13} strokeWidth={2.2} />
              Linked
            </div>
          ) : (
            <button
              type="button"
              onClick={handleLink}
              disabled={linking}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#B8543D] px-3 py-1.5 font-sans text-[12px] font-medium text-[#B8543D] transition-colors hover:bg-[#B8543D] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <TbLink size={13} strokeWidth={1.8} />
              {linking ? "Linking…" : "Link to project"}
            </button>
          )
        ) : (
          <button
            type="button"
            onClick={handleConnect}
            disabled={connecting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(26,22,18,0.16)] px-3 py-1.5 font-sans text-[12px] font-medium text-[#5A5450] transition-colors hover:border-[rgba(26,22,18,0.32)] hover:text-[#1A1612] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <TbPlugConnected size={13} strokeWidth={1.6} />
            {connecting ? "Connecting…" : "Connect"}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function ProjectConnectorsPage() {
  const { id = "1" } = useParams();
  const project = mockProjects.find((p) => p.id === id) ?? mockProjects[0];
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [linked, setLinked] = useState<Set<string>>(new Set());
  const [linkingAll, setLinkingAll] = useState(false);

  useEffect(() => {
    getIntegrationStatuses(id).then(setIntegrations);
  }, [id]);

  const accountIntegrations = integrations.filter((i) => i.accountConnected);
  const otherIntegrations = integrations.filter((i) => !i.accountConnected);
  const unlinkedAccountIntegrations = accountIntegrations.filter((i) => !linked.has(i.id));

  const handleLink = (integrationId: string) => {
    setLinked((prev) => new Set(prev).add(integrationId));
  };

  const handleLinkAll = () => {
    if (linkingAll || unlinkedAccountIntegrations.length === 0) return;
    setLinkingAll(true);
    window.setTimeout(() => {
      setLinked(new Set(accountIntegrations.map((i) => i.id)));
      setLinkingAll(false);
    }, 1000);
  };

  const allLinked = accountIntegrations.length > 0 && unlinkedAccountIntegrations.length === 0;

  return (
    <section className="h-full overflow-y-auto bg-bg px-8 py-10">
      <div className="mb-8">
        <p className="font-mono text-[11px] tracking-[0.18em] text-[#B8543D]">CONNECTORS</p>
        <h1 className="mt-2 font-sans text-[40px] font-light leading-none tracking-tight text-[#1A1612]">
          {project.name}
        </h1>
        <p className="mt-2 font-sans text-[13px] text-[#78716C]">
          Manage integrations and data sources linked to this project.
        </p>
      </div>

      {accountIntegrations.length > 0 && (
        <div className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-mono text-[11px] tracking-[0.14em] text-[#1A1612]">ACCOUNT INTEGRATIONS</p>
              <p className="mt-1 font-sans text-[12px] text-[#78716C]">
                Already authenticated — link them to this project with one click.
              </p>
            </div>
            {!allLinked && (
              <button
                type="button"
                onClick={handleLinkAll}
                disabled={linkingAll}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1A1612] px-4 py-2 font-sans text-[12px] font-medium text-[#FAF8F5] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <TbLink size={13} strokeWidth={1.8} />
                {linkingAll ? "Linking all…" : "Link all to project"}
              </button>
            )}
            {allLinked && (
              <div className="inline-flex items-center gap-1.5 font-sans text-[12px] text-[#2D4A3E]">
                <TbCheck size={14} strokeWidth={2.2} />
                All linked
              </div>
            )}
          </div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            className="space-y-3"
          >
            {accountIntegrations.map((integration) => (
              <ConnectorCard
                key={integration.id}
                integration={{ ...integration, linked: linked.has(integration.id) }}
                onLink={handleLink}
              />
            ))}
          </motion.div>
        </div>
      )}

      {otherIntegrations.length > 0 && (
        <div>
          <div className="mb-4">
            <p className="font-mono text-[11px] tracking-[0.14em] text-[#1A1612]">ADD MORE INTEGRATIONS</p>
            <p className="mt-1 font-sans text-[12px] text-[#78716C]">
              Connect additional services to your account first, then link them here.
            </p>
          </div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            className="space-y-3"
          >
            {otherIntegrations.map((integration) => (
              <ConnectorCard
                key={integration.id}
                integration={integration}
                onLink={handleLink}
              />
            ))}
          </motion.div>
        </div>
      )}
    </section>
  );
}

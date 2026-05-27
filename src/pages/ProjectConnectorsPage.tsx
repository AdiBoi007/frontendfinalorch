import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { TbBrandGmail, TbBrandSlack } from "react-icons/tb";
import { useParams } from "react-router-dom";
import { getIntegrationStatuses } from "../lib/api";
import { storeConnectedIntegrationId } from "../lib/integrationStorage";
import type { IntegrationStatus } from "../lib/types";

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const }
  }
};

const CONNECTOR_LOGOS: Record<string, React.ReactNode> = {
  Slack: <TbBrandSlack size={22} color="#4A154B" aria-hidden />,
  Gmail: <TbBrandGmail size={22} color="#EA4335" aria-hidden />,
  Fireflies: (
    <img src="https://cdn.simpleicons.org/fireflies/7B4DBE" alt="" className="h-[22px] w-[22px]" />
  ),
  GitHub: <img src="https://cdn.simpleicons.org/github/1A1612" alt="" className="h-[22px] w-[22px]" />,
  Jira: <img src="https://cdn.simpleicons.org/jira/0052CC" alt="" className="h-[22px] w-[22px]" />,
  ClickUp: <img src="https://cdn.simpleicons.org/clickup/7B68EE" alt="" className="h-[22px] w-[22px]" />,
  WhatsApp: <img src="https://cdn.simpleicons.org/whatsapp/25D366" alt="" className="h-[22px] w-[22px]" />,
  "Google Calendar": (
    <img src="https://cdn.simpleicons.org/googlecalendar/4285F4" alt="" className="h-[22px] w-[22px]" />
  )
};

function ConnectorTile({
  integration,
  connecting,
  onConnect
}: {
  integration: IntegrationStatus;
  connecting: boolean;
  onConnect: (id: string) => void;
}) {
  const logo = CONNECTOR_LOGOS[integration.name];
  const isConnected = integration.connected;

  return (
    <motion.div
      variants={cardVariants}
      className={[
        "rounded-xl border bg-white p-4",
        isConnected ? "border-[#2D4A3E]" : "border-[rgba(26,22,18,0.08)]"
      ].join(" ")}
    >
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#FAF8F5]">
          {logo ?? (
            <span className="font-mono text-[10px] font-medium text-[#78716C]">
              {integration.name.slice(0, 2).toUpperCase()}
            </span>
          )}
        </span>
        <p className="font-sans text-[14px] font-medium text-[#1A1612]">{integration.name}</p>
      </div>

      {isConnected ? (
        <p className="mt-3 font-sans text-[12px] text-[#2D4A3E]">Connected</p>
      ) : (
        <button
          type="button"
          disabled={connecting}
          className="orch-btn-secondary mt-3 w-full disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => onConnect(integration.id)}
        >
          {connecting ? "Connecting…" : "Connect"}
        </button>
      )}
    </motion.div>
  );
}

export function ProjectConnectorsPage() {
  const { id = "1" } = useParams();
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  useEffect(() => {
    void getIntegrationStatuses(id).then(setIntegrations);
  }, [id]);

  const handleConnect = (integrationId: string) => {
    console.log("TODO: connect integration", integrationId);
    setConnectingId(integrationId);

    window.setTimeout(() => {
      storeConnectedIntegrationId(id, integrationId);
      setIntegrations((current) =>
        current.map((integration) =>
          integration.id === integrationId
            ? {
                ...integration,
                connected: true,
                accountConnected: true,
                lastSyncedAt: new Date().toISOString()
              }
            : integration
        )
      );
      setConnectingId(null);
    }, 800);
  };

  return (
    <section className="h-full overflow-y-auto bg-bg px-8 py-10">
      <div className="mb-8 max-w-[640px]">
        <p className="font-mono text-[11px] tracking-[0.18em] text-[#B8543D]">CONNECTORS</p>
        <h1 className="mt-2 font-sans text-[40px] font-light leading-none tracking-tight text-[#1A1612]">Connectors</h1>
        <p className="mt-2 font-sans text-[13px] text-[#78716C]">
          Connect the tools Orchestra reads from to build your company knowledge base.
        </p>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {integrations.map((integration) => (
          <ConnectorTile
            key={integration.id}
            integration={integration}
            connecting={connectingId === integration.id}
            onConnect={handleConnect}
          />
        ))}
      </motion.div>
    </section>
  );
}

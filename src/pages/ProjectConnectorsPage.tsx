import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getIntegrationStatuses } from "../lib/api";
import { storeConnectedIntegrationId } from "../lib/integrationStorage";
import { WORKSPACE_ID } from "../lib/workspace";
import type { IntegrationStatus } from "../lib/types";

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const }
  }
};

const VS_CODE_LOGO = (
  <img src="https://cdn.simpleicons.org/visualstudiocode/007ACC" alt="" className="h-[22px] w-[22px]" />
);

function ConnectorTile({
  integration,
  connecting,
  onConnect
}: {
  integration: IntegrationStatus;
  connecting: boolean;
  onConnect: (id: string) => void;
}) {
  const isConnected = integration.connected;

  return (
    <motion.div
      variants={cardVariants}
      className={[
        "max-w-[320px] rounded-xl border bg-white p-5",
        isConnected ? "border-[#2D4A3E]" : "border-[rgba(26,22,18,0.08)]"
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#FAF8F5]">
          {VS_CODE_LOGO}
        </span>
        <div>
          <p className="font-sans text-[16px] font-medium text-[#1A1612]">{integration.name}</p>
          <p className="mt-0.5 font-sans text-[12px] text-[#78716C]">Sync workspace context from your editor</p>
        </div>
      </div>

      {isConnected ? (
        <p className="mt-4 font-sans text-[12px] text-[#2D4A3E]">Connected</p>
      ) : (
        <button
          type="button"
          disabled={connecting}
          className="orch-btn-secondary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => onConnect(integration.id)}
        >
          {connecting ? "Connecting…" : "Connect"}
        </button>
      )}
    </motion.div>
  );
}

export function ProjectConnectorsPage() {
  const id = WORKSPACE_ID;
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  useEffect(() => {
    void getIntegrationStatuses(id).then(setIntegrations);
  }, [id]);

  const handleConnect = (integrationId: string) => {
    console.log("TODO: connect VS Code extension", integrationId);
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

  const vscode = integrations.find((integration) => integration.id === "i-vscode") ?? integrations[0];

  return (
    <section className="h-full overflow-y-auto bg-bg px-8 py-10">
      <div className="mb-8 max-w-[640px]">
        <p className="font-mono text-[11px] tracking-[0.18em] text-[#B8543D]">CONNECTORS</p>
        <h1 className="mt-2 font-sans text-[40px] font-light leading-none tracking-tight text-[#1A1612]">Connectors</h1>
        <p className="mt-2 font-sans text-[13px] text-[#78716C]">
          Connect VS Code so Orchestra can read project context directly from your workspace.
        </p>
      </div>

      {vscode ? (
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
          <ConnectorTile
            integration={vscode}
            connecting={connectingId === vscode.id}
            onConnect={handleConnect}
          />
        </motion.div>
      ) : null}
    </section>
  );
}

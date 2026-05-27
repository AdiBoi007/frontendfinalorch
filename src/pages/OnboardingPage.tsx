import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { TbBrandGmail, TbBrandSlack } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { markOnboardingComplete } from "../lib/api";
import { storeConnectedIntegrationNames } from "../lib/integrationStorage";
import { useWorkspaceStore } from "../store/workspaceStore";

const cardTransition = {
  duration: 0.4,
  ease: [0.22, 1, 0.36, 1] as const
};

const INTEGRATIONS = [
  { name: "Slack", logo: <TbBrandSlack size={22} color="#4A154B" aria-hidden /> },
  { name: "Gmail", logo: <TbBrandGmail size={22} color="#EA4335" aria-hidden /> },
  {
    name: "Fireflies",
    logo: (
      <img
        src="https://cdn.simpleicons.org/fireflies/7B4DBE"
        alt=""
        className="h-[22px] w-[22px]"
      />
    )
  }
] as const;

export function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [workspaceName, setWorkspaceName] = useState("");
  const [newProjectId, setNewProjectId] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [pdfUploaded, setPdfUploaded] = useState(false);
  const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSetupWorkspace = workspaceName.trim().length > 0;
  const canGenerateSource = pdfUploaded || connectedIntegrations.length > 0;

  const handleSetupWorkspace = () => {
    if (!canSetupWorkspace) return;

    const name = workspaceName.trim();
    const id = Date.now().toString();
    useWorkspaceStore.getState().addProject({
      id,
      name,
      clientName: name,
      description: `${name} workspace`,
      deadline: "TBD",
      sprint: "1 of 1",
      progress: 0,
      health: "HEALTHY",
      color: "rgba(45,74,62,0.10)",
      lastActivity: "Just now",
      teamInitials: []
    });
    setNewProjectId(id);
    setStep(2);
  };

  const handleConnectIntegration = (name: string) => {
    if (connectedIntegrations.includes(name)) return;
    setConnectedIntegrations((prev) => [...prev, name]);
  };

  const handlePdfChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPdfFileName(file.name);
    setPdfUploaded(true);
  };

  useEffect(() => {
    if (step !== 3 || !newProjectId) return;

    if (connectedIntegrations.length > 0) {
      storeConnectedIntegrationNames(newProjectId, connectedIntegrations);
    }

    const timeout = window.setTimeout(() => {
      void markOnboardingComplete().then(() => {
        navigate(`/projects/${newProjectId}`);
      });
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [step, newProjectId, navigate, connectedIntegrations]);

  if (step === 3) {
    return (
      <main className="flex min-h-full items-center justify-center bg-bg px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={cardTransition}
          className="flex w-full max-w-[480px] flex-col items-center text-center"
        >
          <motion.div
            className="h-14 w-14 rounded-full bg-[#B8543D]"
            animate={{ scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <p className="mt-8 font-sans text-[20px] text-[#1A1612]">Orchestra is reading your sources...</p>
          <p className="mt-2 font-sans text-[13px] text-[#78716C]">
            Building your living document. This takes about 30 seconds.
          </p>
          <div className="mx-auto mt-8 h-1 w-full max-w-[320px] overflow-hidden rounded-full bg-[rgba(26,22,18,0.06)]">
            <motion.div
              className="h-full rounded-full bg-[#B8543D]"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: "linear" }}
            />
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="flex min-h-full items-center justify-center bg-bg px-6 py-10">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={cardTransition}
        className="solid-card w-full max-w-[480px] p-12"
      >
        <div className="text-center">
          <h1 className="font-sans text-[56px] leading-none text-[#1A1612]">Orchestra</h1>
        </div>

        {step === 1 ? (
          <div className="mt-10">
            <h2 className="text-center font-sans text-[22px] font-medium text-[#1A1612]">Set up your workspace</h2>

            <p className="mt-8 font-mono text-[10px] tracking-[3px] text-[rgba(120,113,108,0.6)]">WORKSPACE</p>

            <div className="mt-4">
              <label className="font-sans text-[12px] text-[#78716C]">Workspace name</label>
              <input
                required
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="e.g. Acme Product Team"
                className="mt-1.5 w-full rounded-xl border border-[rgba(26,22,18,0.08)] px-3.5 py-2.5 font-sans text-[13px] text-[#1A1612] outline-none transition-colors focus:border-[#B8543D]"
              />
            </div>

            <motion.button
              type="button"
              disabled={!canSetupWorkspace}
              whileHover={canSetupWorkspace ? { scale: 1.01 } : undefined}
              whileTap={canSetupWorkspace ? { scale: 0.98 } : undefined}
              onClick={handleSetupWorkspace}
              className={[
                "mt-8 flex h-[56px] w-full items-center justify-center rounded-2xl border border-[rgba(26,22,18,0.08)] font-sans text-[18px] tracking-[0.06em] transition-colors duration-200",
                canSetupWorkspace
                  ? "bg-[#B8543D] text-white hover:border-[#B8543D]"
                  : "cursor-not-allowed bg-white text-[#1A1612] opacity-40"
              ].join(" ")}
            >
              Continue
            </motion.button>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-10">
            <h2 className="text-center font-sans text-[22px] font-medium text-[#1A1612]">Connect your first source</h2>
            <p className="mt-2 text-center font-sans text-[13px] text-[#78716C]">
              Orchestra will build your company&apos;s knowledge base
            </p>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-8 w-full rounded-2xl border-2 border-dashed border-[rgba(26,22,18,0.15)] p-8 text-center transition-colors hover:border-[#B8543D]"
            >
              <p className="font-sans text-[13px] text-[#78716C]">Drop your SRS, PRD, or brief here</p>
              {pdfFileName ? (
                <p className="mt-2 font-sans text-[12px] font-medium text-[#1A1612]">{pdfFileName}</p>
              ) : null}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handlePdfChange}
            />

            <p className="mt-8 font-sans text-[14px] font-medium text-[#1A1612]">Or connect an integration</p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {INTEGRATIONS.map((integration) => {
                const connected = connectedIntegrations.includes(integration.name);
                return (
                  <div
                    key={integration.name}
                    className={[
                      "rounded-xl border bg-white p-4",
                      connected ? "border-[#2D4A3E]" : "border-[rgba(26,22,18,0.08)]"
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#FAF8F5]">
                        {integration.logo}
                      </span>
                      <p className="font-sans text-[14px] font-medium text-[#1A1612]">{integration.name}</p>
                    </div>
                    {connected ? (
                      <p className="mt-3 font-sans text-[12px] text-[#2D4A3E]">Connected</p>
                    ) : (
                      <button
                        type="button"
                        className="orch-btn-secondary mt-3 w-full"
                        onClick={() => handleConnectIntegration(integration.name)}
                      >
                        Connect
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <motion.button
              type="button"
              disabled={!canGenerateSource}
              whileHover={canGenerateSource ? { scale: 1.01 } : undefined}
              whileTap={canGenerateSource ? { scale: 0.98 } : undefined}
              onClick={() => setStep(3)}
              className={[
                "mt-8 flex h-[56px] w-full items-center justify-center rounded-2xl border border-[rgba(26,22,18,0.08)] font-sans text-[18px] tracking-[0.06em] transition-colors duration-200",
                canGenerateSource
                  ? "bg-[#B8543D] text-white hover:border-[#B8543D]"
                  : "cursor-not-allowed bg-white text-[#1A1612] opacity-40"
              ].join(" ")}
            >
              Generate Source of Truth
            </motion.button>
          </div>
        ) : null}
      </motion.section>
    </main>
  );
}

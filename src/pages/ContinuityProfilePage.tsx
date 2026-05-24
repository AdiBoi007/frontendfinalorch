import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Avatar from "../components/ui/Avatar";
import { AlertCircleIcon, ArrowRightIcon, CheckIcon, FileTextIcon } from "../components/ui/AppIcons";
import { getContinuityProfile } from "../lib/api";
import type { ContinuityGap, ContinuityProfile } from "../lib/types";

type DepartureMode = "living" | "planned" | "gone";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const } }
} as const;

function traceHref(projectId: string, href: string) {
  return `/projects/${projectId}${href}`;
}

function GapCard({ gap, personName, onCapture }: { gap: ContinuityGap; personName: string; onCapture: (gap: ContinuityGap) => void }) {
  return (
    <motion.article variants={itemVariants} className="rounded-[8px] border border-[rgba(184,84,61,0.32)] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-sans text-[16px] text-[#1A1612]">{gap.system}</p>
          <p className="mt-2 font-mono text-[11px] text-[#78716C]">{gap.ownership}</p>
        </div>
        <span className="rounded-full border border-[#B8543D] bg-[rgba(184,84,61,0.06)] px-2.5 py-1 font-mono text-[10px] text-[#B8543D]">
          {gap.coverage}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {gap.filePaths.map((path) => (
          <span key={path} className="rounded-full border border-[rgba(26,22,18,0.08)] px-2.5 py-1 font-mono text-[10px] text-[#5A5450]">
            {path}
          </span>
        ))}
      </div>

      <div className="mt-5 rounded-[8px] border border-[rgba(184,84,61,0.24)] bg-[rgba(184,84,61,0.04)] p-4">
        <p className="font-sans text-[13px] leading-6 text-[#5A5450]">{gap.askPrompt}</p>
        <button type="button" onClick={() => onCapture(gap)} className="mt-3 font-sans text-[12px] text-[#B8543D]">
          Ask {personName.split(" ")[0]} before departure → generate capture checklist
        </button>
      </div>
    </motion.article>
  );
}

function ModePanel({ profile, mode, selectedGap }: { profile: ContinuityProfile; mode: DepartureMode; selectedGap: ContinuityGap | null }) {
  if (mode === "living" && !selectedGap) {
    return null;
  }

  const title =
    mode === "planned"
      ? `Rationale pack before ${profile.plannedLastDay}`
      : mode === "gone"
        ? `Handover pack for ${profile.successor}`
        : `Capture checklist · ${selectedGap?.system}`;

  const lines =
    mode === "planned"
      ? [
          `${profile.capturedRationale.length} captured rationale items are ready for handoff.`,
          `${profile.gaps.length} gaps need direct questions before ${profile.plannedLastDay}.`,
          "Prioritize gaps with no recorded why before thin coverage."
        ]
      : mode === "gone"
        ? [
            `Successor: ${profile.successor}.`,
            "Use captured rationale as the authoritative handover pack.",
            "Treat gaps as unknowns and avoid changing those systems without fresh discovery."
          ]
        : [
            selectedGap?.askPrompt ?? "",
            "Ask for the decision trigger, rejected alternatives, rollback condition, and source of truth.",
            "Attach the answer to the matching trace once captured."
          ];

  return (
    <motion.aside
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[8px] border border-[rgba(26,22,18,0.08)] bg-white p-5"
    >
      <p className="font-sans text-[13px] tracking-[0.14em] text-[#1A1612]">{title}</p>
      <div className="mt-4 space-y-3">
        {lines.map((line) => (
          <div key={line} className="flex gap-3">
            <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#B8543D]" />
            <p className="font-sans text-[13px] leading-6 text-[#5A5450]">{line}</p>
          </div>
        ))}
      </div>
    </motion.aside>
  );
}

export function ContinuityProfilePage() {
  const { id = "1", personId = "sarah-kim" } = useParams();
  const [profile, setProfile] = useState<ContinuityProfile | null>(null);
  const [mode, setMode] = useState<DepartureMode>("living");
  const [selectedGap, setSelectedGap] = useState<ContinuityGap | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const payload = await getContinuityProfile(id, personId);
      if (!cancelled) {
        setProfile(payload);
        setSelectedGap(null);
        setMode("living");
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [id, personId]);

  const modeLabel = useMemo(() => {
    if (mode === "planned") {
      return "planned departure";
    }

    if (mode === "gone") {
      return "already gone";
    }

    return "living profile";
  }, [mode]);

  if (!profile) {
    return <section className="h-full bg-bg" />;
  }

  return (
    <section className="h-full overflow-y-auto bg-bg">
      <div className="mx-auto max-w-[1120px] px-10 py-10">
        <header className="mb-10 rounded-[8px] border border-[rgba(26,22,18,0.08)] bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <Avatar seed={profile.name} name={profile.name} size={52} />
              <div>
                <p className="font-mono text-[12px] text-[#78716C]">{modeLabel}</p>
                <h1 className="mt-2 font-sans text-[42px] leading-none text-[#1A1612]">{profile.name}</h1>
                <p className="mt-3 font-sans text-[14px] text-[#5A5450]">
                  {profile.role} · {profile.area} · {profile.lastActive}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[8px] border border-[rgba(26,22,18,0.08)] px-5 py-4">
                <p className="font-mono text-[28px] text-[#1A1612]">{profile.systemsAtRisk}</p>
                <p className="mt-1 font-sans text-[11px] tracking-[0.12em] text-[#78716C]">SYSTEMS AT RISK</p>
              </div>
              <div className="rounded-[8px] border border-[rgba(184,84,61,0.32)] bg-[rgba(184,84,61,0.04)] px-5 py-4">
                <p className="font-mono text-[28px] text-[#B8543D]">{profile.gapsCount}</p>
                <p className="mt-1 font-sans text-[11px] tracking-[0.12em] text-[#78716C]">MISSING WHY</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {(["living", "planned", "gone"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setMode(option);
                  setSelectedGap(null);
                }}
                className={[
                  "rounded-full border px-3 py-1.5 font-sans text-[12px] transition-colors",
                  mode === option
                    ? "border-[#B8543D] bg-[rgba(184,84,61,0.06)] text-[#1A1612]"
                    : "border-[rgba(26,22,18,0.08)] text-[#78716C] hover:text-[#1A1612]"
                ].join(" ")}
              >
                {option === "living" ? "Living" : option === "planned" ? "Planned departure" : "Already gone"}
              </button>
            ))}
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-12">
            <section>
              <h2 className="mb-4 font-sans text-[13px] tracking-[0.18em] text-[#1A1612]">CAPTURED RATIONALE</h2>
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-4">
                {profile.capturedRationale.map((item) => (
                  <motion.article key={item.id} variants={itemVariants} className="rounded-[8px] border border-[rgba(26,22,18,0.08)] bg-white p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-sans text-[16px] text-[#1A1612]">{item.system}</p>
                        <p className="mt-3 max-w-[760px] font-sans text-[14px] leading-7 text-[#5A5450]">{item.rationale}</p>
                      </div>
                      <span className="rounded-full border border-[rgba(26,22,18,0.08)] px-2.5 py-1 font-mono text-[10px] text-[#5A5450]">
                        captured
                      </span>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(26,22,18,0.08)] pt-3">
                      <span className="font-mono text-[11px] text-[#78716C]">{item.source}</span>
                      <Link to={traceHref(id, item.traceHref)} className="inline-flex items-center gap-1 font-sans text-[12px] text-[#B8543D]">
                        Trace <ArrowRightIcon className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            </section>

            <section>
              <div className="mb-4 flex items-center gap-2">
                <AlertCircleIcon className="h-4 w-4 text-[#B8543D]" />
                <h2 className="font-sans text-[13px] tracking-[0.18em] text-[#1A1612]">GAPS</h2>
              </div>
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-4">
                {profile.gaps.map((gap) => (
                  <GapCard
                    key={gap.id}
                    gap={gap}
                    personName={profile.name}
                    onCapture={(nextGap) => {
                      setSelectedGap(nextGap);
                      setMode("living");
                    }}
                  />
                ))}
              </motion.div>
            </section>

            <section>
              <div className="mb-4 flex items-center gap-2">
                <FileTextIcon className="h-4 w-4 text-[#78716C]" />
                <h2 className="font-sans text-[13px] tracking-[0.18em] text-[#1A1612]">OWNERSHIP / SCOPE</h2>
              </div>
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-3">
                {profile.scope.map((scope) => (
                  <motion.article
                    key={scope.id}
                    variants={itemVariants}
                    className="rounded-[8px] border border-[rgba(26,22,18,0.08)] bg-white p-4 opacity-90"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-sans text-[14px] text-[#1A1612]">{scope.system}</p>
                        <p className="mt-1 font-mono text-[11px] text-[#78716C]">{scope.repo} · {scope.ownership}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {scope.filePaths.map((path) => (
                        <span key={path} className="rounded-full border border-[rgba(26,22,18,0.08)] px-2.5 py-1 font-mono text-[10px] text-[#78716C]">
                          {path}
                        </span>
                      ))}
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            </section>
          </div>

          <div className="space-y-4">
            <ModePanel profile={profile} mode={mode} selectedGap={selectedGap} />
            <aside className="rounded-[8px] border border-[rgba(26,22,18,0.08)] bg-white p-5">
              <p className="font-sans text-[13px] tracking-[0.14em] text-[#1A1612]">PROFILE LINKS</p>
              <div className="mt-4 space-y-3">
                <Link to={`/projects/${id}/overview`} className="block font-sans text-[13px] text-[#5A5450] hover:text-[#1A1612]">
                  Codebase overview
                </Link>
                <Link to={`/projects/${id}/live-doc`} className="block font-sans text-[13px] text-[#5A5450] hover:text-[#1A1612]">
                  Context layer
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

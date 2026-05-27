import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRightIcon } from "../components/ui/AppIcons";
import { getChangelog, getIntegrationStatuses, getProjectDetail } from "../lib/api";
import type { ChangelogEntry, IntegrationStatus, ProjectDetail } from "../lib/types";

const pageVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

const sectionVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as const
    }
  }
};

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06
    }
  }
};

const listItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1] as const
    }
  }
};

export function ProjectDashboardPage() {
  const navigate = useNavigate();
  const { id = "1" } = useParams();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);

  useEffect(() => {
    let isMounted = true;

    Promise.all([getProjectDetail(id), getIntegrationStatuses(id), getChangelog(id)]).then(
      ([detail, nextIntegrations, changelogEntries]) => {
        if (!isMounted) return;
        setProject(detail);
        setIntegrations(nextIntegrations);
        setChangelog(changelogEntries);
      }
    );

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (!project) {
    return (
      <div className="h-full overflow-y-auto bg-bg px-10 pb-10 pl-8 pt-10">
        <p className="font-sans text-[14px] text-[#78716C]">Loading project…</p>
      </div>
    );
  }

  return (
    <>
      <motion.div initial="hidden" animate="visible" variants={pageVariants} className="h-full overflow-y-auto bg-bg px-10 pb-10 pl-8 pt-10">
        <motion.section variants={sectionVariants} className="mb-10">
          <div className="max-w-[640px]">
            <h1 className="font-sans text-[52px] leading-none text-[#1A1612]">{project.name}</h1>
            <p className="mt-2 max-w-[480px] font-sans text-[14px] leading-6 text-[#78716C]">{project.description}</p>

            <div className="mt-3 flex flex-wrap gap-5 font-mono text-[12px] text-[#78716C]">
              <span>DEADLINE: {project.deadline}</span>
              <span>SPRINT: {project.sprint}</span>
              <span>PROGRESS: {project.progress}%</span>
            </div>

            <div className="mt-5 h-1.5 max-w-[320px] overflow-hidden rounded-full bg-[#ecece7]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${project.progress}%` }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-[#B8543D]"
              />
            </div>

            {integrations.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {integrations.map((integration) => (
                  <div
                    key={integration.id}
                    title={integration.connected ? `${integration.name} · connected` : `${integration.name} · not connected`}
                    className="flex items-center gap-1.5 rounded-full border border-[rgba(26,22,18,0.08)] bg-white px-2.5 py-[5px]"
                  >
                    <span
                      className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: integration.connected ? "#2D4A3E" : "#9E3B2E" }}
                    />
                    <span className="font-mono text-[10px] text-[#78716C]">{integration.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.section>

        <motion.section variants={sectionVariants}>
          <div className="solid-card max-w-[400px] p-6">
            <div className="flex items-center">
              <p className="font-sans text-[11px] tracking-[0.16em] text-[rgba(120,113,108,0.6)]">RECENT CHANGES</p>
              <button type="button" onClick={() => navigate(`/projects/${id}/requests`)} className="ml-auto font-sans text-[11px] text-[#B8543D]">
                <span className="inline-flex items-center gap-1">View all<ArrowRightIcon className="h-[14px] w-[14px]" />
                </span>
              </button>
            </div>

            <motion.div initial="hidden" animate="visible" variants={listVariants} className="mt-2">
              {changelog.length > 0 ? (
                changelog.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    variants={listItemVariants}
                    className={index === changelog.length - 1 ? "py-3" : "border-b border-[#FAF8F5] py-3"}
                  >
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={[
                          "rounded-full px-2 py-0.5 font-mono text-[10px] font-medium",
                          entry.source === "manual"
                            ? "bg-[rgba(26,22,18,0.06)] text-[#78716C]"
                            : "bg-[rgba(184,84,61,0.08)] text-[#B8543D]"
                        ].join(" ")}
                      >
                        {entry.source.toUpperCase()}
                      </span>
                      <span className="font-mono text-[10px] text-[#78716C]">{entry.timestamp}</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                project.recentChanges.map((change, index) => (
                  <motion.div
                    key={change.id}
                    variants={listItemVariants}
                    className={index === project.recentChanges.length - 1 ? "py-3" : "border-b border-[#FAF8F5] py-3"}
                  >
                    <p className="truncate font-sans text-[13px] font-medium text-[#1A1612]">{change.title}</p>
                    <p className="mt-1 font-mono text-[11px] text-[#78716C]">{change.timeAgo}</p>
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>
        </motion.section>
      </motion.div>
    </>
  );
}

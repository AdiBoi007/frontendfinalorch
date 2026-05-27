import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TbBrandGmail, TbBrandSlack } from "react-icons/tb";
import { ArrowRightIcon } from "../components/ui/AppIcons";
import { getChangelog, getIntegrationStatuses, getProjectDetail } from "../lib/api";
import type { ChangelogEntry, ChangelogSource, IntegrationStatus, ProjectDetail } from "../lib/types";

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

const INTEGRATION_LOGOS: Record<string, React.ReactNode> = {
  Slack: <TbBrandSlack size={18} color="#4A154B" aria-hidden />,
  Gmail: <TbBrandGmail size={18} color="#EA4335" aria-hidden />,
  GitHub: (
    <img src="https://cdn.simpleicons.org/github/1A1612" alt="" className="h-[18px] w-[18px]" />
  ),
  Fireflies: (
    <img src="https://cdn.simpleicons.org/fireflies/7B4DBE" alt="" className="h-[18px] w-[18px]" />
  )
};

function changelogSourceForIntegration(name: string): ChangelogSource | null {
  const key = name.toLowerCase().replace(/[^a-z]/g, "");
  const map: Record<string, ChangelogSource> = {
    slack: "slack",
    gmail: "gmail",
    whatsapp: "whatsapp",
    github: "github"
  };
  return map[key] ?? null;
}

function IntegrationActivityCard({
  integration,
  entries,
  onViewAll
}: {
  integration: IntegrationStatus;
  entries: ChangelogEntry[];
  onViewAll: () => void;
}) {
  const logo = INTEGRATION_LOGOS[integration.name];

  return (
    <div className="solid-card p-6">
      <div className="flex items-center gap-2">
        {logo ? (
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#FAF8F5]">
            {logo}
          </span>
        ) : null}
        <p className="font-sans text-[11px] tracking-[0.16em] text-[rgba(120,113,108,0.6)]">{integration.name.toUpperCase()}</p>
        <button type="button" onClick={onViewAll} className="ml-auto font-sans text-[11px] text-[#B8543D]">
          <span className="inline-flex items-center gap-1">
            View all
            <ArrowRightIcon className="h-[14px] w-[14px]" />
          </span>
        </button>
      </div>

      <motion.div initial="hidden" animate="visible" variants={listVariants} className="mt-2">
        {entries.length > 0 ? (
          entries.map((entry, index) => (
            <motion.div
              key={entry.id}
              variants={listItemVariants}
              className={index === entries.length - 1 ? "py-3" : "border-b border-[#FAF8F5] py-3"}
            >
              <p className="font-sans text-[13px] font-medium leading-[1.5] text-[#1A1612]">{entry.description}</p>
              <p className="mt-1 font-mono text-[11px] text-[#78716C]">{entry.timestamp}</p>
            </motion.div>
          ))
        ) : (
          <p className="py-3 font-sans text-[13px] text-[#78716C]">No recent decisions from this source yet.</p>
        )}
      </motion.div>
    </div>
  );
}

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

  const connectedIntegrations = useMemo(
    () => integrations.filter((integration) => integration.connected),
    [integrations]
  );

  const changelogByIntegration = useMemo(() => {
    const grouped = new Map<string, ChangelogEntry[]>();

    for (const integration of connectedIntegrations) {
      const source = changelogSourceForIntegration(integration.name);
      const entries = source
        ? changelog.filter((entry) => entry.source === source)
        : changelog.filter((entry) => entry.source === integration.name.toLowerCase());
      grouped.set(integration.id, entries);
    }

    return grouped;
  }, [connectedIntegrations, changelog]);

  if (!project) {
    return (
      <div className="h-full overflow-y-auto bg-bg px-10 pb-10 pl-8 pt-10">
        <p className="font-sans text-[14px] text-[#78716C]">Loading project…</p>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={pageVariants} className="h-full overflow-y-auto bg-bg px-10 pb-10 pl-8 pt-10">
      <motion.section variants={sectionVariants} className="mb-10">
        <div className="max-w-[640px]">
          <h1 className="font-sans text-[52px] leading-none text-[#1A1612]">Dashboard</h1>
          <p className="mt-2 max-w-[480px] font-sans text-[14px] leading-6 text-[#78716C]">{project.description}</p>
          <p className="mt-3 font-mono text-[12px] text-[#78716C]">SPRINT: {project.sprint}</p>
        </div>
      </motion.section>

      {connectedIntegrations.length > 0 ? (
        <motion.section variants={sectionVariants} className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {connectedIntegrations.map((integration) => (
            <IntegrationActivityCard
              key={integration.id}
              integration={integration}
              entries={changelogByIntegration.get(integration.id) ?? []}
              onViewAll={() => navigate(`/projects/${id}/requests`)}
            />
          ))}
        </motion.section>
      ) : (
        <motion.section variants={sectionVariants}>
          <div className="solid-card max-w-[480px] p-6">
            <p className="font-sans text-[13px] text-[#78716C]">
              Connect Slack, Gmail, or other sources to see decisions and progress here.
            </p>
            <button
              type="button"
              onClick={() => navigate(`/projects/${id}/connectors`)}
              className="mt-4 font-sans text-[11px] text-[#B8543D]"
            >
              <span className="inline-flex items-center gap-1">
                Connect integrations
                <ArrowRightIcon className="h-[14px] w-[14px]" />
              </span>
            </button>
          </div>
        </motion.section>
      )}
    </motion.div>
  );
}

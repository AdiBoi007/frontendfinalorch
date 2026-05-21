import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRightIcon } from "../components/ui/AppIcons";
import { Badge } from "../components/ui/Badge";
import { mockProjects } from "../lib/mockData";
import type { ProjectCardItem } from "../lib/types";

const pageVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } }
};

const childVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }
  }
};

const healthBar: Record<ProjectCardItem["health"], string> = {
  HEALTHY:  "#2D4A3E",
  "AT RISK": "#8C5D1E",
  Critical:  "#9E3B2E"
};

function ProjectCard({ project, onClick }: { project: ProjectCardItem; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      variants={cardVariants}
      whileHover={{ y: -3 }}
      onClick={onClick}
      className="group w-full rounded-[20px] border border-[rgba(26,22,18,0.08)] bg-white p-7 text-left transition-colors hover:border-[rgba(26,22,18,0.16)] hover:shadow-[0_4px_20px_rgba(26,22,18,0.06)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: project.color }}
        >
          <span className="font-sans text-[15px] font-medium text-[#1A1612]">
            {project.name.charAt(0)}
          </span>
        </div>
        <Badge variant={project.health} />
      </div>

      <div className="mt-4">
        <p className="font-sans text-[20px] font-medium leading-[1.2] text-[#1A1612]">{project.name}</p>
        <p className="mt-0.5 font-mono text-[11px] tracking-[0.10em] text-[#78716C]">{project.clientName}</p>
      </div>

      <p className="mt-3 line-clamp-2 font-sans text-[13px] leading-[1.6] text-[#5A5450]">
        {project.description}
      </p>

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] text-[#78716C]">Progress</span>
          <span className="font-mono text-[11px] text-[#1A1612]">{project.progress}%</span>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[rgba(26,22,18,0.06)]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${project.progress}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full"
            style={{ backgroundColor: healthBar[project.health] }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-5 font-mono text-[10px] text-[#78716C]">
          <span>SPRINT {project.sprint}</span>
          <span>DUE {project.deadline}</span>
        </div>
        <span className="text-[#B8543D] opacity-0 transition-opacity group-hover:opacity-100">
          <ArrowRightIcon className="h-4 w-4" />
        </span>
      </div>
    </motion.button>
  );
}

export function ProjectsPage() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="h-full overflow-y-auto bg-bg px-10 pb-16 pt-12"
    >
      <motion.section variants={childVariants} className="mb-12">
        <div className="flex items-end justify-between gap-8">
          <div>
            <p className="section-label">Workspace</p>
            <h1 className="mt-3 font-sans text-[40px] font-light leading-[1.05] tracking-tight text-[#1A1612]">
              Projects
            </h1>
            <p className="mt-2 font-sans text-[13px] text-[#78716C]">
              {mockProjects.length} active project{mockProjects.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            type="button"
            className="border-b border-[#1A1612] bg-transparent px-0 py-1 font-sans text-[11px] tracking-[0.12em] text-[#1A1612] transition-opacity hover:opacity-60"
          >
            New project
          </button>
        </div>
      </motion.section>

      <motion.section
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {mockProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => navigate(`/projects/${project.id}`)}
            />
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { TbBrandSlack, TbBrandWhatsapp, TbMail } from "react-icons/tb";
import { CalendarCard } from "../components/dashboard/CalendarCard";
import Avatar from "../components/ui/Avatar";
import { PlusIcon } from "../components/ui/AppIcons";
import { mockCalendarEvents, mockDeadlines, mockProjects, mockRequests } from "../lib/mockData";
import type { RequestItem } from "../lib/types";

const pageVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06
    }
  }
};

const childVariants = {
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

const platformIcon: Record<RequestItem["platform"], React.ReactNode> = {
  slack:    <TbBrandSlack size={13} strokeWidth={1.6} />,
  email:    <TbMail size={13} strokeWidth={1.6} />,
  whatsapp: <TbBrandWhatsapp size={13} strokeWidth={1.6} />
};

const platformColor: Record<RequestItem["platform"], string> = {
  slack:    "#8B7FD4",
  email:    "#78716C",
  whatsapp: "#2D4A3E"
};

type TeamRole = "manager" | "dev" | "client";

const teamMembers = [
  { initials: "SC", role: "manager", name: "Sarah Chen" },
  { initials: "MT", role: "dev", name: "Marcus T" },
  { initials: "PK", role: "dev", name: "Priya K" },
  { initials: "JW", role: "dev", name: "James W" },
  { initials: "AP", role: "dev", name: "Alex P" },
  { initials: "LF", role: "client", name: "Lisa F" }
] as const satisfies ReadonlyArray<{ initials: string; role: TeamRole; name: string }>;

const teamRoleStyles: Record<TeamRole, { label: string }> = {
  manager: { label: "Manager" },
  dev: { label: "Dev" },
  client: { label: "Client" }
};

const teamSplit = [
  { label: "Managers", pct: "25%", color: "rgba(26,22,18,0.35)" },
  { label: "Devs", pct: "58%", color: "rgba(26,22,18,0.55)" },
  { label: "Clients", pct: "17%", color: "rgba(26,22,18,0.2)" }
] as const;

function getViewerName() {
  if (typeof window === "undefined") {
    return "Manager";
  }

  return window.localStorage.getItem("orchestra_role") ?? "manager";
}

function getTodayLabel() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date());
}

function TeamHeadcountCard() {
  return (
    <section className="border-t border-[rgba(26,22,18,0.06)] pt-10">
      <p className="section-label mb-8">Team</p>

      <div className="flex flex-col gap-10 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {teamMembers.map((member) => {
            const style = teamRoleStyles[member.role];

            return (
              <div key={member.initials} title={`${member.name} · ${style.label}`}>
                <Avatar seed={member.initials} name={member.name} role={style.label} size={36} />
              </div>
            );
          })}

          {Array.from({ length: 2 }).map((_, index) => (
            <button
              key={`open-slot-${index}`}
              type="button"
              aria-label="Add team member"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(26,22,18,0.1)] bg-transparent text-[rgba(120,113,108,0.5)] transition-colors hover:border-[rgba(26,22,18,0.2)] hover:text-[#1A1612]"
            >
              <PlusIcon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-end gap-12">
          <div className="flex gap-10">
            <div>
              <p className="font-sans text-[28px] font-light leading-none tracking-tight text-[#1A1612]">6</p>
              <p className="mt-1.5 font-sans text-[11px] text-[#78716C]">Active members</p>
            </div>
            <div>
              <p className="font-sans text-[28px] font-light leading-none tracking-tight text-[#78716C]">2</p>
              <p className="mt-1.5 font-sans text-[11px] text-[#78716C]">Open roles</p>
            </div>
          </div>

          <div className="min-w-[180px]">
            <div className="flex h-px w-full overflow-hidden">
              {teamSplit.map((item) => (
                <span key={item.label} style={{ width: item.pct, backgroundColor: item.color }} />
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
              {teamSplit.map((item) => (
                <span key={item.label} className="font-sans text-[10px] text-[#78716C]">
                  {item.label} {item.pct}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const projects = mockProjects;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="h-full overflow-y-auto bg-bg px-12 pb-16 pl-10 pt-12"
    >
      <motion.section variants={childVariants} className="mb-14">
        <header className="flex items-end justify-between gap-8">
          <div>
            <p className="section-label">Good morning</p>
            <h1 className="mt-3 font-sans text-[40px] font-light leading-[1.05] tracking-tight text-[#1A1612]">
              {getViewerName()}
            </h1>
            <p className="mt-2 font-sans text-[13px] font-normal text-[#78716C]">{getTodayLabel()}</p>
          </div>

          <button
            type="button"
            className="border-b border-[#1A1612] bg-transparent px-0 py-1 font-sans text-[11px] tracking-[0.12em] text-[#1A1612] transition-opacity hover:opacity-60"
          >
            New project
          </button>
        </header>
      </motion.section>

      <motion.section variants={childVariants} className="mb-14">
        <p className="section-label mb-8">Your projects</p>

        <div className="grid gap-0 divide-y divide-[rgba(26,22,18,0.06)] border-t border-[rgba(26,22,18,0.06)] xl:grid-cols-3 xl:divide-x xl:divide-y-0">
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => navigate(`/projects/${project.id}`)}
              className="group px-0 py-7 text-left transition-colors hover:bg-[rgba(26,22,18,0.02)] xl:px-8 xl:first:pl-0"
            >
              <p className="truncate font-sans text-[15px] font-normal text-[#1A1612]">{project.name}</p>

              <div className="mt-5 h-px overflow-hidden bg-[rgba(26,22,18,0.06)]">
                <div
                  className="h-full bg-[#1A1612] transition-all duration-500 group-hover:bg-[#B8543D]"
                  style={{ width: `${project.progress}%` }}
                />
              </div>

              <p className="mt-3 font-mono text-[11px] tracking-wide text-[#78716C]">{project.progress}%</p>
            </button>
          ))}
        </div>
      </motion.section>

      <motion.section variants={childVariants} className="mb-14">
        <div className="grid gap-12 xl:grid-cols-2">
          <div>
            <p className="section-label mb-8">Upcoming deadlines</p>
            <div className="divide-y divide-[rgba(26,22,18,0.06)]">
              {mockDeadlines.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-sans text-[13px] text-[#1A1612]">{item.task}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-[#78716C]">{item.project}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="font-mono text-[12px] text-[#1A1612]">{item.dueDate}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-[#78716C]">{item.daysLeft}d left</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="section-label mb-8">Recent requests</p>
            <div className="divide-y divide-[rgba(26,22,18,0.06)]">
              {mockRequests.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-start gap-3 py-4">
                  <span
                    className="mt-0.5 flex-shrink-0"
                    style={{ color: platformColor[item.platform] }}
                  >
                    {platformIcon[item.platform]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[11px] text-[#78716C]">{item.from}</p>
                    <p className="mt-0.5 line-clamp-1 font-sans text-[13px] text-[#1A1612]">{item.message}</p>
                  </div>
                  <span className="flex-shrink-0 font-mono text-[10px] text-[#78716C]">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.div variants={childVariants} className="mb-14">
        <TeamHeadcountCard />
      </motion.div>

      <motion.section variants={childVariants}>
        <p className="section-label mb-8">Schedule</p>
        <CalendarCard eventsByDate={mockCalendarEvents} />
      </motion.section>
    </motion.div>
  );
}

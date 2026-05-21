import type { ReactNode } from "react";
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Avatar from "../ui/Avatar";
import {
  ArrowLeftIcon,
  BooksIcon,
  FileDescriptionIcon,
  FoldersIcon,
  GitBranchIcon,
  Grid2x2Icon,
  LayoutDashboardIcon,
  MessageSquareIcon,
  SettingsIcon,
  SparklesIcon
} from "../ui/AppIcons";

export const NAV_BAR_WIDTH = 148;

type NavItem =
  | {
      key: string;
      kind?: "item";
      label: string;
      icon: ReactNode;
      route: string;
      active: boolean;
    }
  | {
      key: string;
      kind: "divider";
    };

const viewerByRole = {
  manager: { initials: "SC", label: "Manager", seed: "Sarah Chen" },
  dev: { initials: "MT", label: "Developer", seed: "Marcus Thompson" },
  client: { initials: "LF", label: "Client", seed: "Lisa Foster" }
} as const;

function getCurrentRole() {
  if (typeof window === "undefined") {
    return "manager";
  }

  const storedRole = window.localStorage.getItem("orchestra_role");
  if (storedRole === "dev" || storedRole === "client") {
    return storedRole;
  }

  return "manager";
}

function NavItemButton({ item, onClick }: { item: Extract<NavItem, { kind?: "item" }>; onClick: () => void }) {
  return (
    <button
      type="button"
      title={item.label}
      onClick={onClick}
      className={[
        "relative flex h-9 w-full items-center gap-2 px-3 text-left transition-colors",
        item.active ? "bg-[rgba(184,84,61,0.18)]" : "hover:bg-[rgba(255,255,255,0.06)]"
      ].join(" ")}
    >
      {item.active ? <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-[#B8543D]" /> : null}

      <span className={item.active ? "text-[#E8A090]" : "text-[rgba(250,248,245,0.45)]"}>{item.icon}</span>
      <span className="truncate font-sans text-[12px] text-[#FAF8F5]">{item.label}</span>
    </button>
  );
}

export function NavBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const role = getCurrentRole();
  const viewer = viewerByRole[role];

  const currentProjectId = useMemo(() => {
    const matchedProject = pathname.match(/^\/projects\/([^/]+)/);
    return matchedProject?.[1] ?? "1";
  }, [pathname]);

  const isProjectRoute = pathname.startsWith("/projects/");

  const generalItems: NavItem[] = [
    {
      key: "dashboard",
      label: "DASHBOARD",
      icon: <Grid2x2Icon />,
      route: "/dashboard",
      active: pathname === "/dashboard"
    },
    {
      key: "projects",
      label: "PROJECTS",
      icon: <FoldersIcon />,
      route: "/projects",
      active: pathname === "/projects"
    },
    {
      key: "settings",
      label: "SETTINGS",
      icon: <SettingsIcon />,
      route: "/settings",
      active: pathname === "/settings"
    }
  ];

  const projectItems: NavItem[] = [
    {
      key: "back",
      label: "BACK",
      icon: <ArrowLeftIcon />,
      route: "/projects",
      active: false
    },
    { key: "project-divider", kind: "divider" },
    {
      key: "overview",
      label: "OVERVIEW",
      icon: <LayoutDashboardIcon />,
      route: `/projects/${currentProjectId}`,
      active: new RegExp(`^/projects/${currentProjectId}$`).test(pathname)
    },
    {
      key: "brain",
      label: "BRAIN",
      icon: <SparklesIcon />,
      route: `/projects/${currentProjectId}/brain`,
      active: new RegExp(`^/projects/${currentProjectId}/brain$`).test(pathname)
    },
    {
      key: "flowchart",
      label: "FLOWCHART",
      icon: <GitBranchIcon />,
      route: `/projects/${currentProjectId}/flow`,
      active: new RegExp(`^/projects/${currentProjectId}/flow$`).test(pathname)
    },
    {
      key: "memory",
      label: "MEMORY",
      icon: <BooksIcon />,
      route: `/projects/${currentProjectId}/memory`,
      active: new RegExp(`^/projects/${currentProjectId}/(?:memory|docs(?:/.*)?)$`).test(pathname)
    },
    {
      key: "live-doc",
      label: "LIVE DOC",
      icon: <FileDescriptionIcon />,
      route: `/projects/${currentProjectId}/live-doc`,
      active: new RegExp(`^/projects/${currentProjectId}/live-doc$`).test(pathname)
    },
    {
      key: "connectors",
      label: "CONNECTORS",
      icon: <MessageSquareIcon />,
      route: `/projects/${currentProjectId}/connectors`,
      active: new RegExp(`^/projects/${currentProjectId}/connectors$`).test(pathname)
    }
  ];

  const items = isProjectRoute ? projectItems : generalItems;

  return (
    <aside
      style={{ width: NAV_BAR_WIDTH }}
      className="fixed left-0 top-0 z-50 flex h-screen flex-col overflow-hidden border-r border-[rgba(255,255,255,0.08)] bg-[#1A1612]"
    >
      <div className="flex h-12 items-center gap-2 px-3">
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#B8543D]">
          <span className="font-sans text-[13px] leading-none text-white">O</span>
        </div>

        <span className="truncate font-sans text-[13px] text-[#FAF8F5]">ORCHESTRA</span>
      </div>

      <div className="flex-1 pt-1">
        {items.map((item) => {
          if (item.kind === "divider") {
            return <div key={item.key} className="mx-3 my-1.5 h-px bg-[rgba(255,255,255,0.1)]" />;
          }

          return <NavItemButton key={item.key} item={item} onClick={() => navigate(item.route)} />;
        })}
      </div>

      <div className="mb-3 px-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex-shrink-0">
            <Avatar seed={viewer.seed} size={24} name={viewer.seed} role={viewer.label} />
          </div>

          <span className="truncate font-sans text-[11px] text-[rgba(250,248,245,0.5)]">{viewer.label}</span>
        </div>
      </div>
    </aside>
  );
}

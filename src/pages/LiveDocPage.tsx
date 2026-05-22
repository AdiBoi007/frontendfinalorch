import mermaid from "mermaid";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import Avatar from "../components/ui/Avatar";
import { ArrowRightIcon, GitBranchIcon, GitMergeIcon, UsersIcon } from "../components/ui/AppIcons";
import { getLiveDoc, saveLiveDocSection } from "../lib/api";
import type { LiveDocComment, LiveDocPayload, LiveDocSection } from "../lib/types";
import { useParams } from "react-router-dom";

type SectionDrafts = Record<string, string>;
type DiagramKey = "system" | "usecase" | "flowchart" | "sequence";
type DiagramStatus = "loading" | "done" | null;
type DiagramState = Record<DiagramKey, DiagramStatus>;
type DiagramTimestampState = Record<DiagramKey, string | null>;

const initialDiagramState: DiagramState = {
  system: "done",
  usecase: null,
  flowchart: null,
  sequence: null
};

const systemDiagram = `
graph TD
  A([Buyer App]) -->|places order| B[API Gateway]
  B --> C[Order Service]
  C -->|assigns| D[Driver Assignment]
  C -->|notifies| E[Florist Dashboard]
  C -->|charges| F([Stripe Connect])
  D -->|availability check| G([Driver API])
  E -->|confirms| D
  D -->|dispatched| H[Notifications]
  H -->|SMS/Push| A
  B -->|admin access| I[Admin Panel]
  I -->|approves| D
  
  style A fill:#E9EFEC,stroke:#B8543D,color:#1A1612
  style F fill:#E9EFEC,stroke:#B8543D,color:#1A1612
  style G fill:#F3E8D9,stroke:#B8543D,color:#1A1612
  style B fill:#E9EFEC,stroke:#B8543D,color:#1A1612
  style C fill:#E9EFEC,stroke:#B8543D,color:#1A1612
  style D fill:#F3E7E5,stroke:#9E3B2E,color:#1A1612
  style E fill:#E9EFEC,stroke:#B8543D,color:#1A1612
  style H fill:#E9EFEC,stroke:#B8543D,color:#1A1612
  style I fill:#EFEEEC,stroke:#5A5450,color:#1A1612
`;

const useCaseDiagram = `
graph LR
  Buyer([Buyer])
  Florist([Florist])
  Driver([Driver])
  Admin([Admin])
  
  subgraph BloomFast System
    UC1[Browse & Search]
    UC2[Place Order]
    UC3[Track Delivery]
    UC4[Make Payment]
    UC5[Manage Orders]
    UC6[Accept/Reject]
    UC7[View Inventory]
    UC8[Confirm Pickup]
    UC9[Update Location]
    UC10[Approve Assignment]
    UC11[Resolve Exceptions]
  end
  
  Buyer --> UC1
  Buyer --> UC2
  Buyer --> UC3
  Buyer --> UC4
  Florist --> UC5
  Florist --> UC6
  Florist --> UC7
  Florist --> UC8
  Driver --> UC8
  Driver --> UC9
  Admin --> UC10
  Admin --> UC11
  
  style UC2 fill:#E9EFEC,stroke:#B8543D
  style UC10 fill:#EFEEEC,stroke:#5A5450
  style UC11 fill:#F3E7E5,stroke:#9E3B2E
`;

const flowchartDiagram = `
flowchart TD
  A([Order Placed by Buyer]) --> B{Payment OK?}
  B -->|No| C[/Notify Buyer/]
  C --> A
  B -->|Yes| D[Create Order Record]
  D --> E{Driver Available?}
  E -->|No| F[Queue Order\nRetry every 2 min]
  F --> E
  E -->|Yes| G[Propose Assignment]
  G --> H{Manager Approval?}
  H -->|Rejected| I[Re-queue\nFind New Driver]
  I --> E
  H -->|Approved| J[Assign Driver]
  J --> K[Notify Florist]
  K --> L{Florist Confirms?}
  L -->|No| M[Escalate to Admin]
  L -->|Yes| N[Driver Dispatched]
  N --> O[Real-time Tracking Active]
  O --> P([Delivery Complete])
  
  style A fill:#E9EFEC,stroke:#B8543D
  style P fill:#E9EFEC,stroke:#B8543D
  style B fill:#F3E8D9,stroke:#B8543D
  style E fill:#F3E8D9,stroke:#B8543D
  style H fill:#F3E8D9,stroke:#B8543D
  style L fill:#F3E8D9,stroke:#B8543D
  style M fill:#F3E7E5,stroke:#9E3B2E
`;

const sequenceDiagram = `
sequenceDiagram
  autonumber
  actor B as Buyer
  participant API as API Gateway
  participant OS as Order Service
  participant S as Stripe
  participant F as Florist App
  participant DA as Driver Assignment
  participant D as Driver App
  
  B->>API: Place Order
  API->>S: Charge Payment
  S-->>API: Payment OK
  API->>OS: Create Order
  OS->>DA: Request Driver
  DA->>DA: Check Availability
  DA->>OS: Driver Found
  OS->>F: New Order Alert
  F-->>OS: Confirmed
  OS->>DA: Approve Assignment
  DA->>D: Dispatch Notification
  D-->>DA: En Route
  DA->>OS: Status Update
  OS->>B: SMS · Driver En Route
  D->>OS: Delivered
  OS->>B: SMS · Delivered
  OS->>S: Trigger Payout
`;

const sectionListVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.03
    }
  }
} as const;

const sectionItemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.24,
      ease: [0.22, 1, 0.36, 1] as const
    }
  }
} as const;

const commentListVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05
    }
  }
} as const;

const commentItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.22,
      ease: [0.22, 1, 0.36, 1] as const
    }
  }
} as const;

const sourceIndicatorMotion = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.15
    }
  }
} as const;

const diagramActions = [
  {
    key: "system" as const,
    label: "SYSTEM DIAGRAM",
    triggerLabel: "GENERATE SYSTEM DIAGRAM",
    subtitle: "Ask Socrates to render a system architecture diagram",
    chart: systemDiagram,
    accent: "#B8543D",
    icon: GitBranchIcon,
    hoverClass: "hover:border-[#B8543D] hover:bg-[rgba(184,84,61,0.04)]"
  },
  {
    key: "usecase" as const,
    label: "USE CASE DIAGRAM",
    triggerLabel: "GENERATE USE CASE DIAGRAM",
    subtitle: "Ask Socrates to render a use case diagram",
    chart: useCaseDiagram,
    accent: "#5A5450",
    icon: UsersIcon,
    hoverClass: "hover:border-[#5A5450] hover:bg-[#EFEEEC]"
  },
  {
    key: "flowchart" as const,
    label: "FLOWCHART",
    triggerLabel: "GENERATE FLOWCHART",
    subtitle: "Ask Socrates to render a process flowchart",
    chart: flowchartDiagram,
    accent: "#B8543D",
    icon: GitMergeIcon,
    hoverClass: "hover:border-[#B8543D] hover:bg-[rgba(184,84,61,0.04)]"
  },
  {
    key: "sequence" as const,
    label: "SEQUENCE DIAGRAM",
    triggerLabel: "GENERATE SEQUENCE DIAGRAM",
    subtitle: "Ask Socrates to render an interaction sequence diagram",
    chart: sequenceDiagram,
    accent: "#5A5450",
    icon: GitBranchIcon,
    hoverClass: "hover:border-[#5A5450] hover:bg-[#EFEEEC]"
  }
] as const;

function formatDiagramTimestamp() {
  return new Date()
    .toLocaleString("en-AU", {
      day: "2-digit",
      month: "short",
      hour: "numeric",
      minute: "2-digit"
    })
    ;
}

function sectionValue(section: LiveDocSection, drafts: SectionDrafts) {
  return drafts[section.id] ?? section.content;
}

function updateHighlight(section: LiveDocSection, content: string): LiveDocSection {
  if (!section.highlight) {
    return { ...section, content };
  }

  const nextStart = content.indexOf(section.highlight.text);
  if (nextStart === -1) {
    return { ...section, content };
  }

  return {
    ...section,
    content,
    highlight: {
      ...section.highlight,
      start: nextStart,
      end: nextStart + section.highlight.text.length
    }
  };
}

function MermaidDiagram({ chart, id }: { chart: string; id: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const renderIdRef = useRef(`diagram-${id}-${Math.random().toString(36).slice(2, 10)}`);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    let isCancelled = false;

    const renderDiagram = async () => {
      if (!ref.current) {
        return;
      }

      ref.current.innerHTML = "";

      try {
        const { svg, bindFunctions } = await mermaid.render(renderIdRef.current, chart);
        if (!ref.current || isCancelled) {
          return;
        }

        ref.current.innerHTML = svg;
        bindFunctions?.(ref.current);
      } catch (error) {
        if (ref.current && !isCancelled) {
          ref.current.innerHTML =
            '<div class="flex min-h-[200px] items-center justify-center font-mono text-[12px] text-[#78716C]">Unable to render diagram.</div>';
        }

        console.error("Mermaid render failed", error);
      }
    };

    void renderDiagram();

    return () => {
      isCancelled = true;
    };
  }, [chart]);

  return <div ref={ref} className="w-full overflow-x-auto [&_svg]:h-auto [&_svg]:w-full" style={{ minHeight: 200 }} />;
}

function renderHighlightedContent({
  section,
  value,
  tooltipSource,
  onHighlightClick
}: {
  section: LiveDocSection;
  value: string;
  tooltipSource: string | null;
  onHighlightClick: (event: ReactMouseEvent<HTMLSpanElement>) => void;
}) {
  if (!section.highlight) {
    return value;
  }

  let start = section.highlight.start;
  let end = section.highlight.end;

  if (value.slice(start, end) !== section.highlight.text) {
    const fallbackStart = value.indexOf(section.highlight.text);
    if (fallbackStart === -1) {
      return value;
    }

    start = fallbackStart;
    end = fallbackStart + section.highlight.text.length;
  }

  return (
    <>
      {value.slice(0, start)}
      <span
        data-source-tooltip-anchor="true"
        onClick={onHighlightClick}
        className="relative inline-block cursor-pointer rounded-[3px] bg-[#fff9c4] px-[2px] py-[1px] transition-colors hover:bg-[#fff3a0]"
      >
        {value.slice(start, end)}

        <AnimatePresence>
          {tooltipSource ? (
            <motion.span
              initial={{ opacity: 0, scale: 0.95, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 4 }}
              transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-[calc(100%+8px)] left-1/2 z-50 w-max max-w-[320px] -translate-x-1/2 rounded-lg bg-[#1A1612] px-[10px] py-[6px] text-center font-sans text-[11px] text-white"
            >
              SOURCE: {tooltipSource}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </span>
      {value.slice(end)}
    </>
  );
}

function DiagramLoadingCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 flex h-[200px] w-full items-center justify-center rounded-2xl border border-[rgba(26,22,18,0.08)] px-6"
      style={{
        background: "#FAF8F5",
        backgroundSize: "200% 100%",
        animation: "live-doc-diagram-shimmer 1.5s linear infinite"
      }}
    >
      <span className="font-mono text-[12px] text-[#78716C]">Generating diagram...</span>
    </motion.div>
  );
}

function DiagramCard({
  diagramKey,
  label,
  accent,
  icon: Icon,
  chart,
  timestamp,
  onRegenerate,
  onCopySvg,
  mermaidReady
}: {
  diagramKey: DiagramKey;
  label: string;
  accent: string;
  icon: typeof GitBranchIcon;
  chart: string;
  timestamp: string | null;
  onRegenerate: () => void;
  onCopySvg: (diagramKey: DiagramKey) => void;
  mermaidReady: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-5 overflow-hidden rounded-2xl border border-[rgba(26,22,18,0.08)] bg-white"
    >
      <div className="flex items-center justify-between border-b border-[#FAF8F5] px-5 py-[14px]">
        <div className="flex items-center gap-2">
          <span style={{ color: accent }}>
            <Icon className="h-4 w-4" />
          </span>
          <span className="font-sans text-[12px] tracking-[0.12em] text-[#1A1612]">{label}</span>
        </div>

        <div className="flex items-center">
          <button type="button" onClick={onRegenerate} className="font-sans text-[11px] text-[#78716C] transition-colors hover:text-[#B8543D]">
            REGENERATE
          </button>
          <button
            type="button"
            onClick={() => onCopySvg(diagramKey)}
            className="ml-2 rounded-lg border border-[rgba(26,22,18,0.08)] px-2 py-[3px] font-mono text-[10px] text-[#78716C]"
          >
            COPY SVG
          </button>
        </div>
      </div>

      <div id={`mermaid-container-${diagramKey}`} className="min-h-[220px] px-5 py-5">
        {mermaidReady ? <MermaidDiagram chart={chart} id={diagramKey} /> : <div className="min-h-[220px]" />}
      </div>

      <div className="flex items-center justify-between bg-[#FAF8F5] px-5 py-[10px]">
        <span className="font-mono text-[9px] tracking-[0.14em] text-[rgba(120,113,108,0.6)]">GENERATED FROM BRAIN + ACCEPTED CHANGES</span>
        <span className="font-mono text-[9px] text-[rgba(120,113,108,0.6)]">{timestamp}</span>
      </div>
    </motion.div>
  );
}

function CommentCard({
  comment,
  active,
  registerRef
}: {
  comment: LiveDocComment;
  active: boolean;
  registerRef: (id: string, node: HTMLDivElement | null) => void;
}) {
  return (
    <motion.div
      ref={(el) => registerRef(comment.id, el)}
      variants={commentItemVariants}
      animate={{ borderColor: active ? "#B8543D" : "rgba(26,22,18,0.08)" }}
      transition={{ duration: 0.2 }}
      className={[
        "rounded-2xl border bg-white p-4",
        active ? "" : ""
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        <div className="flex-shrink-0">
          <Avatar seed={comment.authorName} size={32} name={comment.authorName} />
        </div>

        <p className="min-w-0 flex-1 truncate font-sans text-[13px] font-medium text-[#1A1612]">{comment.authorName}</p>
        <p className="text-right font-mono text-[11px] text-[#78716C]">
          <span>{comment.time}</span>
          <br />
          <span>{comment.date}</span>
        </p>
      </div>

      <p className="mt-[10px] font-sans text-[13px] leading-[1.6] text-[#1A1612]">{comment.content}</p>

      <div className="mt-[10px]">
        <p className="font-mono text-[10px] text-[#78716C]">Source:</p>
        <p className="mt-1 font-mono text-[10px] italic text-[#78716C]">{comment.source}</p>
      </div>
    </motion.div>
  );
}

export function LiveDocPage() {
  const { id = "1" } = useParams();
  const [payload, setPayload] = useState<LiveDocPayload | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [drafts, setDrafts] = useState<SectionDrafts>({});
  const [focusedSectionId, setFocusedSectionId] = useState<string | null>(null);
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeComment, setActiveComment] = useState<string | null>(null);
  const [tooltipSectionId, setTooltipSectionId] = useState<string | null>(null);
  const [diagrams, setDiagrams] = useState<DiagramState>(initialDiagramState);
  const [diagramTimestamps, setDiagramTimestamps] = useState<DiagramTimestampState>({
    system: formatDiagramTimestamp(),
    usecase: null,
    flowchart: null,
    sequence: null
  });
  const [mermaidReady, setMermaidReady] = useState(false);
  const commentRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const diagramTimeoutsRef = useRef<Partial<Record<DiagramKey, number>>>({});

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "base",
      securityLevel: "loose",
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true
      },
      themeVariables: {
        primaryColor: "#E9EFEC",
        primaryTextColor: "#1A1612",
        primaryBorderColor: "#B8543D",
        lineColor: "#B8543D",
        secondaryColor: "#EFEEEC",
        tertiaryColor: "#F3E8D9",
        background: "#ffffff",
        mainBkg: "#E9EFEC",
        nodeBorder: "#B8543D",
        clusterBkg: "#FAF8F5",
        titleColor: "#1A1612",
        edgeLabelBackground: "#ffffff",
        fontFamily: "Geist Mono, ui-monospace, SF Mono, Menlo, monospace",
        fontSize: "13px"
      }
    });
    setMermaidReady(true);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      const nextPayload = await getLiveDoc(id);
      if (isCancelled) {
        return;
      }

      setPayload(nextPayload);
      setDrafts({});
      setEditMode(false);
      setFocusedSectionId(null);
      setHoveredSectionId(null);
      setActiveSection(null);
      setActiveComment(null);
      setTooltipSectionId(null);
      setDiagrams(initialDiagramState);
      setDiagramTimestamps({
        system: formatDiagramTimestamp(),
        usecase: null,
        flowchart: null,
        sequence: null
      });
    };

    void load();

    return () => {
      isCancelled = true;
    };
  }, [id]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest('[data-source-section="true"]')) {
        setActiveSection(null);
        setActiveComment(null);
      }

      if (!target?.closest('[data-source-tooltip-anchor="true"]')) {
        setTooltipSectionId(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(diagramTimeoutsRef.current).forEach((timeoutId) => {
        if (timeoutId) {
          window.clearTimeout(timeoutId);
        }
      });
    };
  }, []);

  const handleSectionChange = (sectionId: string, content: string) => {
    setDrafts((current) => ({
      ...current,
      [sectionId]: content
    }));
  };

  const handleSaveSection = async (sectionId: string) => {
    const section = payload?.sections.find((item) => item.id === sectionId);
    if (!section) {
      return;
    }

    const nextContent = sectionValue(section, drafts);
    await saveLiveDocSection(id, sectionId, nextContent);

    setPayload((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        sections: current.sections.map((item) => (item.id === sectionId ? updateHighlight(item, nextContent) : item))
      };
    });

    setDrafts((current) => {
      const nextDrafts = { ...current };
      delete nextDrafts[sectionId];
      return nextDrafts;
    });
    setFocusedSectionId(null);
  };

  const handleSectionSourceClick = (section: LiveDocSection) => {
    if (section.sourceIds.length === 0) {
      return;
    }

    const commentId = section.sourceIds[0];
    setActiveSection(section.id);
    setActiveComment(commentId);

    window.setTimeout(() => {
      commentRefs.current[commentId]?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }, 50);
  };

  const handleGenerateDiagram = (key: DiagramKey) => {
    const existingTimeout = diagramTimeoutsRef.current[key];
    if (existingTimeout) {
      window.clearTimeout(existingTimeout);
    }

    setDiagrams((current) => ({
      ...current,
      [key]: "loading"
    }));

    diagramTimeoutsRef.current[key] = window.setTimeout(() => {
      setDiagrams((current) => ({
        ...current,
        [key]: "done"
      }));
      setDiagramTimestamps((current) => ({
        ...current,
        [key]: formatDiagramTimestamp()
      }));
    }, 2000);
  };

  const handleCopySvg = async (key: DiagramKey) => {
    const svg = document.querySelector(`#mermaid-container-${key} svg`) as SVGElement | null;
    if (!svg || !navigator.clipboard) {
      return;
    }

    try {
      await navigator.clipboard.writeText(svg.outerHTML);
    } catch {
      // Ignore clipboard failures in the mock viewer.
    }
  };

  if (!payload) {
    return <section className="h-full bg-bg" />;
  }

  return (
    <section className="flex h-full flex-col overflow-hidden bg-[#E8E6E1]">
      <style>{`
        @keyframes live-doc-diagram-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .live-doc-scroll {
          flex: 1;
          min-width: 0;
          overflow: auto;
        }

        .live-doc-scroll-inner {
          display: flex;
          justify-content: center;
          box-sizing: border-box;
          min-height: 100%;
          width: max(100%, 864px);
          padding: 32px 24px;
        }

        .live-doc-page {
          width: 816px;
          min-width: 816px;
          max-width: 816px;
          flex: none;
          min-height: 1056px;
          background: #ffffff;
          box-shadow:
            0 1px 2px rgba(26, 22, 18, 0.06),
            0 6px 20px rgba(26, 22, 18, 0.08),
            0 20px 40px rgba(26, 22, 18, 0.05);
        }

        .live-doc-page-inner {
          padding: 56px 72px 80px;
          font-family: Arial, Helvetica, sans-serif;
          color: #1a1612;
        }

        .live-doc-title {
          margin: 0 0 20px;
          font-size: 26px;
          font-weight: 400;
          line-height: 1.25;
          color: #1a1612;
        }

        .live-doc-body {
          margin: 0 0 16px;
          font-size: 11pt;
          line-height: 1.65;
          color: #1a1612;
        }

        .live-doc-section-label {
          margin: 28px 0 8px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #78716c;
        }

        .live-doc-field {
          display: block;
          width: 100%;
          border: 0;
          background: transparent;
          color: inherit;
          font: inherit;
          line-height: inherit;
          outline: none;
          resize: vertical;
          padding: 4px 0;
          margin: 0 0 12px;
          border-radius: 2px;
        }

        .live-doc-field:focus {
          background: rgba(66, 133, 244, 0.06);
          box-shadow: inset 0 -1px 0 rgba(66, 133, 244, 0.5);
        }

        .live-doc-highlight {
          background: #fff59d;
          border-radius: 1px;
        }

        .live-doc-paragraph {
          position: relative;
        }
      `}</style>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="live-doc-scroll">
          <div className="live-doc-scroll-inner">
            <article className="live-doc-page overflow-visible">
              <div className="live-doc-page-inner">
                <div className="mb-8 flex items-center justify-between gap-4 border-b border-[rgba(26,22,18,0.08)] pb-4">
                  <p className="font-mono text-[11px] text-[#78716C]">
                    {payload.docType} · {payload.version} · {payload.status}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setEditMode((current) => !current);
                      setFocusedSectionId(null);
                      setTooltipSectionId(null);
                    }}
                    className={[
                      "rounded-md px-4 py-1.5 font-sans text-[12px] transition-colors",
                      editMode
                        ? "bg-[#1A1612] text-white"
                        : "border border-[rgba(26,22,18,0.15)] bg-white text-[#5A5450] hover:border-[#B8543D] hover:text-[#B8543D]"
                    ].join(" ")}
                  >
                    {editMode ? "Editing" : "Edit"}
                  </button>
                </div>

                <motion.div variants={sectionListVariants} initial="hidden" animate="visible">
              {payload.sections.map((section) => {
                const currentValue = sectionValue(section, drafts);
                const isFocused = focusedSectionId === section.id;
                const isActive = activeSection === section.id;
                const isClickable = section.sourceIds.length > 0 && !editMode;
                const isEditable = editMode && (section.type === "body" || section.type === "highlighted");
                const tooltipSource =
                  tooltipSectionId === section.id
                    ? payload.comments.find((comment) => comment.id === section.sourceIds[0])?.source ?? null
                    : null;

                if (section.type === "title") {
                  if (editMode) {
                    return (
                      <motion.div key={section.id} variants={sectionItemVariants}>
                        <input
                          value={currentValue}
                          onChange={(event) => handleSectionChange(section.id, event.target.value)}
                          className="live-doc-field live-doc-title"
                          aria-label="Document title"
                        />
                      </motion.div>
                    );
                  }

                  return (
                    <motion.h1 key={section.id} variants={sectionItemVariants} className="live-doc-title">
                      {currentValue}
                    </motion.h1>
                  );
                }

                if (section.type === "section-heading") {
                  return (
                    <motion.div key={section.id} variants={sectionItemVariants}>
                      <p className="live-doc-section-label">{section.sectionLabel}</p>

                      {section.anchorId === "diagrams" ? (
                        <div className="mt-3 space-y-3">
                          {diagramActions.map((action) => {
                            const Icon = action.icon;
                            const status = diagrams[action.key];

                            return (
                              <div key={action.key}>
                                {status === "done" ? (
                                  <DiagramCard
                                    diagramKey={action.key}
                                    label={action.label}
                                    accent={action.accent}
                                    icon={Icon}
                                    chart={action.chart}
                                    timestamp={diagramTimestamps[action.key]}
                                    onRegenerate={() => handleGenerateDiagram(action.key)}
                                    onCopySvg={handleCopySvg}
                                    mermaidReady={mermaidReady}
                                  />
                                ) : null}

                                <motion.button
                                  type="button"
                                  onClick={() => handleGenerateDiagram(action.key)}
                                  whileHover={{ scale: 1.01 }}
                                  whileTap={{ scale: 0.995 }}
                                  className={[
                                    "w-full text-left transition-colors",
                                    status === "done"
                                      ? "rounded-xl border border-[rgba(26,22,18,0.08)] bg-white px-4 py-3"
                                      : "rounded-xl border-[1.5px] border-dashed border-[rgba(26,22,18,0.20)] px-5 py-4",
                                    action.hoverClass
                                  ].join(" ")}
                                >
                                  <div className="flex items-start gap-3">
                                    <span className="mt-0.5" style={{ color: action.accent }}>
                                      <Icon className="h-[18px] w-[18px]" />
                                    </span>
                                    <div>
                                      <p className="font-sans text-[13px] text-[#5A5450]">
                                        {status === "done" ? `REGENERATE ${action.label}` : action.triggerLabel}
                                      </p>
                                      <p className="mt-1 font-mono text-[11px] text-[#78716C]">{action.subtitle}</p>
                                    </div>
                                  </div>
                                </motion.button>

                                {status === "loading" ? <DiagramLoadingCard /> : null}
                              </div>
                            );
                          })}
                        </div>
                      ) : null}
                    </motion.div>
                  );
                }

                return (
                  <motion.div key={section.id} variants={sectionItemVariants} className="relative mb-5">
                    {isEditable ? (
                      <div>
                        <textarea
                          value={currentValue}
                          onChange={(event) => handleSectionChange(section.id, event.target.value)}
                          onFocus={() => setFocusedSectionId(section.id)}
                          rows={Math.max(3, Math.ceil(currentValue.length / 80))}
                          className="live-doc-field live-doc-body"
                        />

                        <AnimatePresence>
                          {isFocused ? (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              className="mt-2 flex justify-end"
                            >
                              <button
                                type="button"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => void handleSaveSection(section.id)}
                                className="rounded-lg bg-[#B8543D] px-[10px] py-1 font-sans text-[11px] tracking-[0.08em] text-white"
                              >Save</button>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <motion.div
                        data-source-section={isClickable ? "true" : undefined}
                        onClick={() => {
                          if (!isClickable) {
                            return;
                          }

                          handleSectionSourceClick(section);
                          setTooltipSectionId(null);
                        }}
                        onMouseEnter={() => {
                          if (isClickable) {
                            setHoveredSectionId(section.id);
                          }
                        }}
                        onMouseLeave={() => {
                          if (hoveredSectionId === section.id) {
                            setHoveredSectionId(null);
                          }
                        }}
                        animate={
                          isActive
                            ? { backgroundColor: ["rgba(255,249,157,0.5)", "rgba(255,249,157,0.25)"] }
                            : { backgroundColor: "rgba(255,255,255,0)" }
                        }
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className={["live-doc-paragraph rounded-sm py-0.5", isClickable ? "cursor-pointer" : ""].join(" ")}
                        style={{
                          marginLeft: isActive ? -8 : 0,
                          marginRight: isActive ? -8 : 0,
                          paddingLeft: isActive ? 8 : 0,
                          paddingRight: isActive ? 8 : 0
                        }}
                      >
                        <div className="relative">
                          <p className="live-doc-body">
                            {section.type === "highlighted"
                              ? renderHighlightedContent({
                                  section,
                                  value: currentValue,
                                  tooltipSource,
                                  onHighlightClick: (event) => {
                                    event.stopPropagation();
                                    handleSectionSourceClick(section);
                                    setTooltipSectionId(section.id);
                                  }
                                })
                              : currentValue}
                          </p>

                          <AnimatePresence>
                            {isClickable && hoveredSectionId === section.id ? (
                              <motion.span
                                variants={sourceIndicatorMotion}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                className="pointer-events-none absolute right-full top-1/2 z-10 mr-3 inline-flex -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-[#1A1612] px-2.5 py-1 font-sans text-[10px] font-medium text-white shadow-sm"
                              >
                                VIEW SOURCE
                                <ArrowRightIcon className="h-3 w-3" />
                              </motion.span>
                            ) : null}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
                </motion.div>
              </div>
            </article>
          </div>
        </div>

        <aside className="w-[340px] flex-shrink-0 overflow-y-auto border-l border-[rgba(26,22,18,0.1)] bg-[#F0EEEA] px-5 py-6">
          <p className="mb-5 font-sans text-[11px] tracking-[0.18em] text-[rgba(120,113,108,0.6)]">COMMENTS</p>

          <motion.div variants={commentListVariants} initial="hidden" animate="visible" className="space-y-3">
            {payload.comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                active={activeComment === comment.id}
                registerRef={(commentId, node) => {
                  commentRefs.current[commentId] = node;
                }}
              />
            ))}
          </motion.div>
        </aside>
      </div>
    </section>
  );
}

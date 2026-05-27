import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, CloseIcon, FileTextIcon } from "../components/ui/AppIcons";
import { getAnchorProvenance, getDocViewer } from "../lib/api";
import { DEFAULT_WORKSPACE_NAME, WORKSPACE_ID } from "../lib/workspace";
import { useWorkspaceStore } from "../store/workspaceStore";
import type { AnchorProvenance, DocSection, DocViewerPayload } from "../lib/types";

type SectionDrafts = Record<string, string>;

const citedAnchorIds = ["driver-detail"];

const sectionStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.03
    }
  }
} as const;

const sectionItem = {
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

function platformBadge(platform: AnchorProvenance["linkedMessages"][number]["platform"]) {
  if (platform === "slack") {
    return {
      bg: "rgba(120,113,108,0.10)",
      text: "#5A5450",
      label: "S"
    };
  }

  if (platform === "email") {
    return {
      bg: "rgba(120,113,108,0.10)",
      text: "#5A5450",
      label: "G"
    };
  }

  return {
    bg: "rgba(120,113,108,0.10)",
    text: "#5A5450",
    label: "W"
  };
}

function renderHeadingLevel(level: number | undefined) {
  if (level === 1) {
    return "doc-h1";
  }

  return "doc-h2";
}

function countWords(sections: DocSection[], drafts: SectionDrafts) {
  return sections
    .reduce((total, section) => `${total} ${sectionValue(section, drafts)}`, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function applyDrafts(viewer: DocViewerPayload, drafts: SectionDrafts): DocViewerPayload {
  return {
    ...viewer,
    sections: viewer.sections.map((section) => {
      const nextContent = drafts[section.id];
      if (nextContent === undefined) {
        return section;
      }

      return {
        ...section,
        content: nextContent
      };
    })
  };
}

function sectionValue(section: DocSection, drafts: SectionDrafts) {
  return drafts[section.id] ?? section.content;
}

export function LiveDocViewerPage() {
  const navigate = useNavigate();
  const { docId = "1" } = useParams();
  const id = WORKSPACE_ID;
  const provenanceRequestRef = useRef(0);

  const storedWorkspaceName = useWorkspaceStore((state) => state.workspaceName);
  const [projectName, setProjectName] = useState(DEFAULT_WORKSPACE_NAME);
  const [viewer, setViewer] = useState<DocViewerPayload | null>(null);
  const [selectedAnchor, setSelectedAnchor] = useState<string | null>(null);
  const [provenance, setProvenance] = useState<AnchorProvenance | null>(null);
  const [isLoadingProvenance, setIsLoadingProvenance] = useState(false);
  const [editMode, setEditMode] = useState(true);
  const [drafts, setDrafts] = useState<SectionDrafts>({});

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      const payload = await getDocViewer(id, docId);
      if (isCancelled) {
        return;
      }

      setProjectName(storedWorkspaceName || DEFAULT_WORKSPACE_NAME);
      setViewer(payload);
      setSelectedAnchor(null);
      setProvenance(null);
      setEditMode(true);
      setDrafts({});
    };

    void load();

    return () => {
      isCancelled = true;
    };
  }, [docId, id, storedWorkspaceName]);

  useEffect(() => {
    if (!selectedAnchor) {
      setProvenance(null);
      setIsLoadingProvenance(false);
      return;
    }

    const requestId = provenanceRequestRef.current + 1;
    provenanceRequestRef.current = requestId;
    setIsLoadingProvenance(true);

    const load = async () => {
      const payload = await getAnchorProvenance(id, docId, selectedAnchor);
      if (provenanceRequestRef.current !== requestId) {
        return;
      }

      setProvenance(payload);
      setIsLoadingProvenance(false);
    };

    void load();
  }, [docId, id, selectedAnchor]);

  const activeSection = useMemo(
    () => viewer?.sections.find((section) => section.anchorId === selectedAnchor) ?? null,
    [selectedAnchor, viewer]
  );

  const handleSectionChange = (sectionId: string, value: string) => {
    setDrafts((current) => ({
      ...current,
      [sectionId]: value
    }));
  };

  const handleSave = () => {
    if (!viewer) {
      return;
    }

    // TODO: PATCH /v1/projects/:projectId/documents/:documentId
    setViewer(applyDrafts(viewer, drafts));
    setEditMode(false);
  };

  const wordCount = viewer ? countWords(viewer.sections, drafts) : 0;
  const hasUnsavedDrafts = Object.keys(drafts).length > 0;

  const renderSection = (section: DocSection) => {
    const currentValue = sectionValue(section, drafts);
    const isCited = citedAnchorIds.includes(section.anchorId);
    const isSelected = selectedAnchor === section.anchorId;
    const isChanged = section.hasChange;
    const changedClass = isChanged || isCited ? "doc-block--tracked" : "";

    if (section.type === "heading") {
      const Tag = section.level === 1 ? "h1" : "h2";

      if (editMode) {
        return (
          <Tag className={renderHeadingLevel(section.level)}>
            <input
              value={currentValue}
              onChange={(event) => handleSectionChange(section.id, event.target.value)}
              className={`doc-field doc-field--heading ${changedClass}`}
              aria-label={section.level === 1 ? "Document title" : "Section heading"}
            />
          </Tag>
        );
      }

      return <Tag className={renderHeadingLevel(section.level)}>{currentValue}</Tag>;
    }

    if (section.type === "paragraph") {
      const interactive = !editMode && isChanged;

      if (editMode) {
        return (
          <div className={`doc-paragraph-wrap ${changedClass}`}>
            <textarea
              value={currentValue}
              onChange={(event) => handleSectionChange(section.id, event.target.value)}
              rows={Math.max(3, Math.ceil(currentValue.length / 72))}
              className="doc-field doc-field--body"
              aria-label="Paragraph"
            />
          </div>
        );
      }

      return (
        <motion.div
          initial={isCited ? { backgroundColor: "rgba(255,249,196,0)" } : false}
          animate={isCited ? { backgroundColor: ["rgba(255,249,196,0)", "rgba(255,249,196,0.85)", "rgba(255,249,196,0.35)"] } : undefined}
          transition={isCited ? { duration: 1.2, times: [0, 0.45, 1] } : undefined}
          className={[
            "doc-paragraph-wrap",
            changedClass,
            interactive ? "doc-block--interactive cursor-pointer" : ""
          ].join(" ")}
          onClick={() => {
            if (!interactive) {
              return;
            }

            setSelectedAnchor(section.anchorId);
          }}
        >
          <p className="doc-body-text">{currentValue}</p>
          {isSelected ? <span className="doc-selection-ring" aria-hidden /> : null}
        </motion.div>
      );
    }

    if (section.type === "list") {
      if (editMode) {
        return (
          <div className={`doc-list-wrap ${changedClass}`}>
            <textarea
              value={currentValue}
              onChange={(event) => handleSectionChange(section.id, event.target.value)}
              rows={Math.max(3, currentValue.split("\n").length + 1)}
              className="doc-field doc-field--list"
              aria-label="List items, one per line"
            />
          </div>
        );
      }

      return (
        <ul className={`doc-list ${changedClass}`}>
          {currentValue.split("\n").map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    }

    if (editMode) {
      return (
        <textarea
          value={currentValue}
          onChange={(event) => handleSectionChange(section.id, event.target.value)}
          rows={6}
          className="doc-field doc-field--code"
          aria-label="Code block"
        />
      );
    }

    return <pre className={`doc-code ${changedClass}`}>{currentValue}</pre>;
  };

  return (
    <section className="doc-viewer-root relative flex h-full flex-col overflow-hidden bg-[#D8D4CC]">
      <style>{`
        .doc-page {
          width: 816px;
          min-width: 816px;
          max-width: 816px;
          flex: none;
          min-height: 1056px;
          background: #ffffff;
          box-shadow:
            0 1px 2px rgba(26, 22, 18, 0.06),
            0 8px 24px rgba(26, 22, 18, 0.08),
            0 24px 48px rgba(26, 22, 18, 0.06);
        }

        .doc-page-inner {
          padding: 72px 84px 96px;
          font-family: Georgia, "Times New Roman", Times, serif;
          color: #1a1612;
        }

        .doc-h1 {
          margin: 0 0 8px;
          font-size: 28px;
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }

        .doc-h2 {
          margin: 28px 0 10px;
          font-size: 18px;
          font-weight: 700;
          line-height: 1.3;
        }

        .doc-body-text,
        .doc-list {
          margin: 0 0 14px;
          font-size: 12pt;
          line-height: 1.65;
          text-align: justify;
        }

        .doc-list {
          padding-left: 1.25rem;
        }

        .doc-paragraph-wrap {
          position: relative;
          margin-bottom: 2px;
        }

        .doc-block--tracked {
          background: rgba(255, 249, 196, 0.45);
          border-radius: 2px;
        }

        .doc-block--interactive:hover {
          background: rgba(255, 249, 196, 0.7);
        }

        .doc-selection-ring {
          position: absolute;
          inset: -2px -4px;
          border: 1px solid rgba(184, 84, 61, 0.35);
          border-radius: 2px;
          pointer-events: none;
        }

        .doc-field {
          display: block;
          width: 100%;
          border: 0;
          background: transparent;
          color: inherit;
          font: inherit;
          line-height: inherit;
          letter-spacing: inherit;
          outline: none;
          resize: vertical;
          padding: 2px 0;
          margin: 0;
        }

        .doc-field:focus {
          background: rgba(184, 84, 61, 0.04);
          box-shadow: inset 0 -1px 0 rgba(184, 84, 61, 0.45);
        }

        .doc-field--heading {
          font-weight: 700;
        }

        .doc-field--body {
          min-height: 4.5em;
          text-align: justify;
        }

        .doc-field--list {
          min-height: 3em;
          font-family: Georgia, "Times New Roman", Times, serif;
        }

        .doc-field--code,
        .doc-code {
          font-family: "Geist Mono", ui-monospace, monospace;
          font-size: 10pt;
          line-height: 1.5;
        }

        .doc-code {
          margin: 0 0 14px;
          padding: 12px 14px;
          background: #f5f4f1;
          border: 1px solid rgba(26, 22, 18, 0.08);
          border-radius: 2px;
          overflow-x: auto;
        }

        .doc-ruler {
          height: 22px;
          border-bottom: 1px solid rgba(26, 22, 18, 0.08);
          background: linear-gradient(90deg, #faf9f7 0%, #faf9f7 84px, #fff 84px, #fff calc(100% - 84px), #faf9f7 calc(100% - 84px));
        }

        @media print {
          .doc-viewer-topbar,
          .doc-viewer-toolbar,
          .doc-viewer-provenance,
          .doc-status-bar {
            display: none !important;
          }

          .doc-viewer-root {
            background: white !important;
          }

          .doc-page {
            box-shadow: none !important;
            width: 100% !important;
            min-height: auto !important;
          }

          .doc-block--tracked {
            background: transparent !important;
          }
        }
      `}</style>

      <div className="doc-viewer-topbar z-20 flex h-[48px] flex-shrink-0 items-center gap-4 border-b border-[rgba(26,22,18,0.1)] bg-[#F3F1EC] px-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-[#78716C] transition-colors hover:text-[#1A1612]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </button>
          <span className="h-4 w-px bg-[rgba(26,22,18,0.12)]" />
          <p className="truncate font-sans text-[13px] text-[#1A1612]">{projectName}</p>
          <span className="font-sans text-[12px] text-[rgba(120,113,108,0.55)]">/</span>
          <p className="truncate font-sans text-[13px] text-[#1A1612]">{viewer?.title ?? "Document"}</p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {hasUnsavedDrafts ? (
            <span className="font-sans text-[11px] text-[#B8543D]">Unsaved changes</span>
          ) : null}
          <span className="font-mono text-[11px] text-[#78716C]">{viewer?.version ?? "v0.0"}</span>
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => setEditMode((current) => !current)}
            className={[
              "rounded-md px-3 py-1.5 font-sans text-[12px] transition-colors",
              editMode ? "bg-white text-[#1A1612] shadow-sm" : "text-[#5A5450] hover:bg-white/60"
            ].join(" ")}
          >
            {editMode ? "Editing" : "View"}
          </motion.button>
          {editMode ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="rounded-md bg-[#B8543D] px-3 py-1.5 font-sans text-[12px] text-white"
            >
              Save
            </motion.button>
          ) : null}
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md border border-[rgba(26,22,18,0.12)] bg-white px-3 py-1.5 font-sans text-[12px] text-[#5A5450] hover:border-[#B8543D] hover:text-[#B8543D]"
          >
            Export PDF
          </button>
        </div>
      </div>

      {editMode ? (
        <div className="doc-viewer-toolbar z-10 flex h-9 flex-shrink-0 items-center gap-1 border-b border-[rgba(26,22,18,0.08)] bg-white px-4 font-sans text-[12px] text-[#78716C]">
          <span className="mr-3 border-r border-[rgba(26,22,18,0.08)] pr-3 font-medium text-[#1A1612]">Body</span>
          <button type="button" className="rounded px-2 py-0.5 font-semibold text-[#1A1612] hover:bg-[#F3F1EC]">
            B
          </button>
          <button type="button" className="rounded px-2 py-0.5 italic hover:bg-[#F3F1EC]">
            I
          </button>
          <button type="button" className="rounded px-2 py-0.5 underline hover:bg-[#F3F1EC]">
            U
          </button>
          <span className="mx-2 text-[rgba(26,22,18,0.15)]">|</span>
          <span>12 pt</span>
          <span className="mx-2 text-[rgba(26,22,18,0.15)]">|</span>
          <span>1.65 line spacing</span>
        </div>
      ) : null}

      <div className={["flex min-h-0 flex-1", selectedAnchor ? "pr-[360px]" : ""].join(" ")}>
        <div className="doc-viewer-document flex-1 min-w-0 overflow-auto py-10">
          <div className="flex min-h-min justify-center px-6" style={{ width: "max(100%, 864px)", margin: "0 auto", boxSizing: "border-box" }}>
            <article className="doc-page shrink-0 grow-0" style={{ width: 816, minWidth: 816, maxWidth: 816 }}>
              <div className="doc-ruler" aria-hidden />
              <div className="doc-page-inner">
                <header className="mb-8 border-b border-[rgba(26,22,18,0.12)] pb-6 text-center">
                  <p className="mb-3 font-sans text-[10px] tracking-[0.2em] text-[#78716C]">
                    {viewer?.version ?? "DRAFT"} · {viewer?.uploadedAt ?? "—"}
                  </p>
                  {!editMode ? (
                    <>
                      <h1 className="doc-h1 text-center">{viewer?.title ?? "Loading document…"}</h1>
                      <p className="mt-3 font-sans text-[11px] text-[#78716C]">
                        {viewer?.uploadedBy ?? "Unknown"} · Page 1 of {viewer?.totalPages ?? 1}
                      </p>
                    </>
                  ) : (
                    <p className="font-sans text-[11px] text-[#78716C]">
                      {viewer?.uploadedBy ?? "Unknown"} · Page 1 of {viewer?.totalPages ?? 1}
                    </p>
                  )}
                </header>

                {!editMode ? (
                  <p className="mb-6 font-sans text-[11px] leading-relaxed text-[#78716C]">
                    Highlighted passages include accepted changes. Click a highlighted paragraph to open source evidence.
                  </p>
                ) : null}

                <motion.div initial="hidden" animate="visible" variants={sectionStagger} className="doc-body">
                  {viewer?.sections.map((section) => (
                    <motion.div key={section.id} variants={sectionItem}>
                      {renderSection(section)}
                    </motion.div>
                  ))}
                </motion.div>

                <footer className="doc-status-bar mt-16 flex items-center justify-between border-t border-[rgba(26,22,18,0.1)] pt-4 font-sans text-[10px] text-[#78716C]">
                  <span>
                    Page 1 of {viewer?.totalPages ?? 1}
                  </span>
                  <span>{wordCount.toLocaleString()} words</span>
                  <span className="flex items-center gap-1.5">
                    <FileTextIcon className="h-3 w-3" />
                    {editMode ? "Editing" : "Viewing"}
                  </span>
                </footer>
              </div>
            </article>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedAnchor ? (
          <motion.aside
            initial={{ x: 360, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 360, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={[
              "doc-viewer-provenance fixed bottom-0 right-0 z-30 w-[360px] overflow-y-auto border-l border-[rgba(0,0,0,0.08)] bg-[rgba(255,255,255,0.98)] px-6 py-5",
              editMode ? "top-[84px]" : "top-[48px]"
            ].join(" ")}
          >
            <div className="mb-5 flex items-center">
              <p className="font-sans text-[13px] tracking-[0.12em] text-[#1A1612]">SOURCE EVIDENCE</p>
              <button
                type="button"
                onClick={() => setSelectedAnchor(null)}
                className="ml-auto flex h-7 w-7 items-center justify-center rounded-full bg-[#FAF8F5] text-[#78716C] transition-colors hover:bg-[rgba(26,22,18,0.08)]"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            {isLoadingProvenance ? (
              <p className="font-sans text-[13px] text-[#78716C]">Loading source evidence…</p>
            ) : provenance ? (
              <>
                <div className="mb-5">
                  <p className="mb-2 font-sans text-[10px] tracking-[0.16em] text-[rgba(120,113,108,0.6)]">CITED TEXT</p>
                  <p className="mb-2 font-mono text-[11px] text-[rgba(120,113,108,0.6)]">{provenance.sourceDoc}</p>
                  <div className="rounded-r-lg bg-[rgba(184,84,61,0.04)] py-2 pl-3" style={{ borderLeft: "3px solid #B8543D" }}>
                    <p className="font-sans text-[13px] italic leading-6 text-[#5A5450]">{provenance.excerpt}</p>
                  </div>
                </div>

                <div>
                  <p className="mb-3 font-sans text-[10px] tracking-[0.16em] text-[rgba(120,113,108,0.6)]">SOURCE MESSAGES</p>
                  {provenance.linkedMessages.map((message) => {
                    const badge = platformBadge(message.platform);

                    return (
                      <div key={message.id} className="mb-[10px] rounded-2xl border border-[rgba(26,22,18,0.08)] bg-white p-[14px]">
                        <div className="flex items-center">
                          <div
                            className="flex h-7 w-7 items-center justify-center rounded-full font-sans text-[12px]"
                            style={{ background: badge.bg, color: badge.text }}
                          >
                            {badge.label}
                          </div>
                          <p className="ml-2 font-sans text-[12px] font-medium text-[#1A1612]">{message.from}</p>
                          <p className="ml-auto font-mono text-[11px] text-[#78716C]">{message.sentAt}</p>
                        </div>
                        <p
                          className="mt-2 font-sans text-[13px] italic leading-[1.6] text-[#5A5450]"
                          style={{
                            display: "-webkit-box",
                            overflow: "hidden",
                            WebkitBoxOrient: "vertical",
                            WebkitLineClamp: 4
                          }}
                        >
                          {message.content}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5">
                  <p className="mb-3 font-sans text-[10px] tracking-[0.16em] text-[rgba(120,113,108,0.6)]">ACCEPTED CHANGES</p>
                  {provenance.acceptedChanges.map((change) => (
                    <div key={change.id} className="mb-[10px] rounded-2xl border border-[rgba(184,84,61,0.2)] bg-[rgba(45,74,62,0.10)] p-[14px]">
                      <p className="font-sans text-[13px] font-medium text-[#1A1612]">{change.summary}</p>
                      <div className="mt-2 flex items-center">
                        <span className="font-sans text-[10px] tracking-[0.12em] text-[#B8543D]">Accepted</span>
                        <span className="ml-2 font-sans text-[11px] text-[#78716C]">{change.acceptedBy}</span>
                        <span className="ml-auto font-mono text-[11px] text-[#78716C]">{change.acceptedAt}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="mt-6 w-full rounded-xl border-[1.5px] border-dashed border-[rgba(26,22,18,0.20)] py-3 text-center font-sans text-[12px] text-[#78716C] transition-colors hover:border-[#B8543D] hover:bg-[rgba(184,84,61,0.04)] hover:text-[#B8543D]"
                >Ask Socrates about this section</button>
              </>
            ) : (
              <div>
                <p className="font-sans text-[13px] text-[#78716C]">No provenance available for this section.</p>
                {activeSection ? <p className="mt-2 font-sans text-[12px] text-[rgba(120,113,108,0.6)]">{activeSection.content}</p> : null}
              </div>
            )}
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

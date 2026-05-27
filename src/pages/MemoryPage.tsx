import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileTextIcon, SearchIcon } from "../components/ui/AppIcons";
import { getDocs, uploadDoc } from "../lib/api";
import { WORKSPACE_ID } from "../lib/workspace";
import type { Doc } from "../lib/types";

type MemoryTab = "all" | "source-docs" | "communications" | "decisions" | "changes";

type TypeVisual = {
  bg: string;
  iconColor: string;
};

const tabOptions: Array<{ id: MemoryTab; label: string }> = [
  { id: "all", label: "ALL" },
  { id: "source-docs", label: "SOURCE DOCS" },
  { id: "communications", label: "COMMUNICATIONS" },
  { id: "decisions", label: "DECISIONS" },
  { id: "changes", label: "Changes" }
];

const typeVisuals: Record<Doc["type"], TypeVisual> = {
  prd: { bg: "rgba(45,74,62,0.10)", iconColor: "#B8543D" },
  srs: { bg: "rgba(45,74,62,0.10)", iconColor: "#B8543D" },
  spec: { bg: "rgba(120,113,108,0.10)", iconColor: "#5A5450" },
  transcript: { bg: "rgba(194,136,64,0.12)", iconColor: "#B8543D" },
  audio: { bg: "rgba(194,136,64,0.12)", iconColor: "#B8543D" },
  image: { bg: "#fff0f8", iconColor: "#e05590" },
  change: { bg: "rgba(158,59,46,0.10)", iconColor: "#9E3B2E" },
  decision: { bg: "rgba(120,113,108,0.10)", iconColor: "#5A5450" },
  context: { bg: "rgba(120,113,108,0.10)", iconColor: "#5A5450" }
};

const extensionMap: Record<Doc["type"], string> = {
  prd: ".pdf",
  srs: ".pdf",
  spec: ".pdf",
  transcript: ".txt",
  audio: ".mp3",
  image: ".png",
  change: ".md",
  decision: ".txt",
  context: ".txt"
};

function getDocTab(doc: Doc): Exclude<MemoryTab, "all"> {
  if (doc.type === "change") {
    return "changes";
  }

  if (doc.type === "decision") {
    return "decisions";
  }

  if (doc.name === "Payment Flow Diagram") {
    return "changes";
  }

  if (doc.name === "Stakeholder Email Thread" || doc.name === "Client Kickoff Call") {
    return "decisions";
  }

  if (doc.type === "transcript" || doc.type === "audio") {
    return "communications";
  }

  return "source-docs";
}

function getFilename(doc: Doc) {
  return `${doc.name}${extensionMap[doc.type]}`;
}

export function MemoryPage() {
  const navigate = useNavigate();
  const id = WORKSPACE_ID;
  const quickFileRef = useRef<HTMLInputElement | null>(null);

  const [docs, setDocs] = useState<Doc[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<MemoryTab>("all");
  const [isUploading, setIsUploading] = useState(false);
  const [quickMode, setQuickMode] = useState<"pdf" | "md" | "context">("pdf");
  const [quickFile, setQuickFile] = useState<File | null>(null);
  const [contextText, setContextText] = useState("");
  const [contextTitle, setContextTitle] = useState("");

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      const docItems = await getDocs(id);
      if (isCancelled) {
        return;
      }

      setDocs(docItems.map((item) => ({ ...item })));
    };

    void load();

    return () => {
      isCancelled = true;
    };
  }, [id]);

  const visibleDocs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return docs.filter((doc) => {
      const matchesTab = activeTab === "all" ? true : getDocTab(doc) === activeTab;
      if (!matchesTab) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [doc.name, doc.excerpt, doc.uploadedBy, doc.uploadedAt].some((value) => value.toLowerCase().includes(query));
    });
  }, [activeTab, docs, searchQuery]);

  const handleQuickFileSelect = (file: File | null) => {
    if (!file) return;
    setQuickFile(file);
  };

  const handleQuickUpload = async () => {
    if (isUploading) return;

    setIsUploading(true);
    try {
      if (quickMode === "context") {
        const body = contextText.trim();
        if (!body) return;
        const title = (contextTitle.trim() || "Context note").slice(0, 80);
        const contextFile = new File([body], `${title}.txt`, { type: "text/plain" });
        const nextDoc = await uploadDoc(id, contextFile, "context");
        setDocs((current) => [{ ...nextDoc }, ...current]);
        setContextText("");
        setContextTitle("");
        return;
      }

      if (!quickFile) return;
      const type = quickMode === "pdf" ? ("spec" as const) : ("change" as const);
      const nextDoc = await uploadDoc(id, quickFile, type);
      setDocs((current) => [{ ...nextDoc }, ...current]);
      setQuickFile(null);
      if (quickFileRef.current) quickFileRef.current.value = "";
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="relative h-full overflow-y-auto bg-bg">
      <div className="flex min-h-full">
        <div className="flex-1 px-12 py-10">
          <div className="max-w-[920px]">
            <div>
              <p className="mb-2 font-sans text-[11px] tracking-[0.18em] text-[#5A5450]">MEMORY</p>
              <h1 className="font-sans text-[56px] leading-none text-[#1A1612]">Project memory</h1>
              <div className="mt-3 flex items-center gap-2">
                <span className="h-[3px] w-10 rounded-full bg-[#5A5450]" />
                <span className="h-[3px] w-5 rounded-full bg-[rgba(26,22,18,0.08)]" />
              </div>
              <p className="mb-10 mt-4 max-w-[760px] font-sans text-[15px] leading-7 text-[#78716C]">
                Search decisions, changes, client messages, briefs, and source material from one evidence trail.
              </p>
            </div>

            <div className="mb-10 rounded-[20px] border border-[rgba(26,22,18,0.08)] bg-white p-6 shadow-[0_4px_20px_rgba(26,22,18,0.04)]">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <p className="font-mono text-[11px] tracking-[0.16em] text-[rgba(120,113,108,0.65)]">UPLOAD</p>
                  <p className="mt-2 font-sans text-[18px] font-medium text-[#1A1612]">Add documents or context</p>
                  <p className="mt-2 max-w-[520px] font-sans text-[13px] leading-6 text-[#78716C]">
                    Upload PDFs, Markdown files, or paste free-form context to keep everything in one workspace memory.
                  </p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  {([
                    { id: "pdf" as const, label: "PDF" },
                    { id: "md" as const, label: "Markdown" },
                    { id: "context" as const, label: "Context" }
                  ] as const).map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setQuickMode(option.id);
                        setQuickFile(null);
                        if (quickFileRef.current) quickFileRef.current.value = "";
                      }}
                      className={[
                        "rounded-full px-3 py-1.5 font-sans text-[12px] transition-colors",
                        quickMode === option.id
                          ? "bg-[rgba(184,84,61,0.12)] text-[#B8543D]"
                          : "bg-[#FAF8F5] text-[#5A5450] hover:bg-[rgba(26,22,18,0.06)]"
                      ].join(" ")}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                {quickMode === "context" ? (
                  <div className="space-y-3">
                    <input
                      value={contextTitle}
                      onChange={(e) => setContextTitle(e.target.value)}
                      placeholder="Title (optional)"
                      className="w-full rounded-xl border border-[rgba(26,22,18,0.08)] bg-white px-4 py-3 font-sans text-[13px] text-[#1A1612] outline-none"
                    />
                    <textarea
                      value={contextText}
                      onChange={(e) => setContextText(e.target.value)}
                      placeholder="Paste context here (notes, constraints, snippets, decisions, etc.)"
                      rows={6}
                      className="w-full resize-none rounded-xl border border-[rgba(26,22,18,0.08)] bg-white px-4 py-3 font-sans text-[13px] leading-6 text-[#1A1612] outline-none"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                      ref={quickFileRef}
                      type="file"
                      accept={quickMode === "pdf" ? ".pdf,application/pdf" : ".md,text/markdown"}
                      onChange={(e) => handleQuickFileSelect(e.target.files?.[0] ?? null)}
                      className="w-full rounded-xl border border-[rgba(26,22,18,0.08)] bg-white px-4 py-3 font-sans text-[13px] text-[#1A1612]"
                    />
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <span className="truncate font-sans text-[12px] text-[#78716C]">
                        {quickFile ? quickFile.name : "No file selected"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-sans text-[12px] text-[#78716C]">
                  {quickMode === "pdf" ? "Saved as SPEC." : quickMode === "md" ? "Saved as CHANGE." : "Saved as CONTEXT."}
                </p>
                <button
                  type="button"
                  disabled={
                    isUploading ||
                    (quickMode === "context" ? contextText.trim().length === 0 : quickFile === null)
                  }
                  onClick={() => void handleQuickUpload()}
                  className="inline-flex items-center justify-center rounded-xl bg-[#1A1612] px-5 py-3 font-sans text-[13px] font-medium text-white transition-colors hover:bg-[#2A241F] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUploading ? "Uploading…" : "Upload"}
                </button>
              </div>
            </div>

            <div
              className="mb-10 flex h-16 items-center gap-4 rounded-[20px] border-[1.5px] border-[rgba(255,255,255,0.9)] bg-[rgba(255,255,255,0.7)] px-6"
            >
              <div className="flex-shrink-0 text-[rgba(120,113,108,0.6)]">
                <SearchIcon className="h-5 w-5" />
              </div>
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Ask anything about this project - decisions, changes, what the client said..."
                className="min-w-0 flex-1 bg-transparent font-sans text-[15px] text-[#1A1612] outline-none placeholder:text-[rgba(120,113,108,0.6)]"
              />
              <span className="rounded-lg border border-[rgba(26,22,18,0.08)] bg-[rgba(0,0,0,0.04)] px-[10px] py-1 font-mono text-[12px] text-[rgba(120,113,108,0.6)]">
                CMD K
              </span>
            </div>

            <div className="mb-6 flex overflow-x-auto border-b border-[rgba(26,22,18,0.08)]">
              {tabOptions.map((tab) => {
                const active = tab.id === activeTab;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={[
                      "border-b-2 px-5 py-3 font-sans text-[12px] tracking-[0.12em] transition-colors",
                      active ? "border-[#5A5450] text-[#1A1612]" : "border-transparent text-[#78716C] hover:text-[#1A1612]"
                    ].join(" ")}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <p className="mb-4 font-sans text-[11px] tracking-[0.18em] text-[#78716C]">SOURCE DOCUMENTS</p>

            <AnimatePresence mode="popLayout">
              {visibleDocs.length > 0 ? (
                <div>
                  {visibleDocs.map((doc, index) => {
                    const visual = typeVisuals[doc.type];
                    const roundedClass =
                      visibleDocs.length === 1
                        ? "rounded-[16px]"
                        : index === 0
                          ? "rounded-t-[16px]"
                          : index === visibleDocs.length - 1
                            ? "rounded-b-[16px]"
                            : "";

                    return (
                      <motion.article
                        key={doc.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.22, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
                        className={[
                          "relative cursor-pointer border border-[rgba(26,22,18,0.08)] bg-white px-6 py-5 transition-colors hover:bg-[#FAF8F5]",
                          roundedClass,
                          index > 0 ? "-mt-px" : ""
                        ].join(" ")}
                        onClick={() => navigate(`/memory/docs/${doc.id}/view`)}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
                            style={{ background: visual.bg, color: visual.iconColor }}
                          >
                            <FileTextIcon className="h-[18px] w-[18px]" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="min-w-0 truncate font-sans text-[15px] font-medium text-[#1A1612]">{doc.name}</p>
                              {doc.status === "processing" ? (
                                <motion.span
                                  className="ml-auto h-1.5 w-1.5 rounded-full bg-[#B8543D]"
                                  animate={{ scale: [1, 1.35, 1], opacity: [1, 0.55, 1] }}
                                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                                />
                              ) : (
                                <span
                                  className="ml-auto h-1.5 w-1.5 rounded-full"
                                  style={{ background: doc.status === "ready" ? "#B8543D" : "#9E3B2E" }}
                                />
                              )}
                            </div>

                            <div className="mt-1 flex flex-wrap items-center font-mono text-[12px] text-[#78716C]">
                              <span>{getFilename(doc)}</span>
                              <span className="mx-[6px]">·</span>
                              <span>{doc.uploadedAt}</span>
                            </div>

                            <p
                              className="mt-[10px] font-sans text-[13px] leading-[1.6] text-[#5A5450]"
                              style={{
                                display: "-webkit-box",
                                overflow: "hidden",
                                WebkitBoxOrient: "vertical",
                                WebkitLineClamp: 2
                              }}
                            >
                              {doc.excerpt}
                            </p>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[16px] border border-[rgba(26,22,18,0.08)] bg-white px-6 py-8"
                >
                  <p className="font-sans text-[16px] tracking-[0.08em] text-[#1A1612]">No memory found</p>
                  <p className="mt-2 font-sans text-[13px] text-[#78716C]">Try a different query or switch tabs.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

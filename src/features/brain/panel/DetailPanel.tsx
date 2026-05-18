import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { TbBookmark, TbExternalLink, TbX } from "react-icons/tb";
import { useReducedMotion } from "../lib/useReducedMotion";
import { useBrainStore } from "../state/brainStore";
import { brainTokens } from "../tokens";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function categoryLabel(category: string) {
  return category === "doc" ? "document" : category;
}

function panelTint(color: string) {
  return `${color}14`;
}

export function DetailPanel() {
  const node = useBrainStore((state) => state.selectedNode);
  const nodesSaved = useBrainStore((state) => state.savedNodeIds);
  const close = useBrainStore((state) => state.clearSelection);
  const save = useBrainStore((state) => state.saveSelectedNode);
  const reducedMotion = useReducedMotion();
  const color = node ? (node.featured ? brainTokens.pin.featured : brainTokens.pin[node.category]) : brainTokens.pin.doc;
  const isSaved = Boolean(node && nodesSaved.includes(node.id));
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (node) {
      closeButtonRef.current?.focus();
    }
  }, [node]);

  return (
    <AnimatePresence>
      {node && (
        <motion.aside
          initial={reducedMotion ? { opacity: 0 } : { x: 440, opacity: 0 }}
          animate={reducedMotion ? { opacity: 1 } : { x: 0, opacity: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { x: 440, opacity: 0 }}
          transition={reducedMotion ? { duration: 0.2, ease: "easeOut" } : { type: "spring", damping: 28, stiffness: 240 }}
          className="absolute bottom-0 right-0 top-0 z-30 flex w-[440px] flex-col border-l border-[#B8543D] bg-[#FAF8F5] text-[#1A1612]"
          aria-label={`${node.title} details`}
        >
          <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-[rgba(26,22,18,0.08)] px-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full" style={{ background: color }} />
              <span className="font-sans text-[12px] font-medium uppercase leading-[1.3] tracking-[0.08em] text-[#78716C]">{categoryLabel(node.category)}</span>
            </div>
            <button ref={closeButtonRef} type="button" onClick={close} className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(26,22,18,0.08)] text-[#78716C] transition-colors hover:border-[rgba(26,22,18,0.20)] hover:text-[#1A1612]" aria-label="Close detail panel">
              <TbX size={16} strokeWidth={1.6} />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-28 pt-6">
            <div className="flex h-[200px] items-center justify-center rounded-2xl border border-[rgba(26,22,18,0.08)]" style={{ background: panelTint(color) }}>
              <div className="h-14 w-14 rounded-full border border-current opacity-40" style={{ color }} />
            </div>

            <h2 className="mt-6 font-sans text-[24px] font-medium leading-[1.25] tracking-[-0.015em] text-[#1A1612]">{node.title}</h2>

            <dl className="mt-6 grid grid-cols-3 gap-4 border-y border-[rgba(26,22,18,0.08)] py-5">
              <div>
                <dt className="font-sans text-[12px] font-medium uppercase tracking-[0.08em] text-[#78716C]">Source</dt>
                <dd className="mt-2 truncate font-mono text-[13px] text-[#1A1612]">{node.source ?? "None"}</dd>
              </div>
              <div>
                <dt className="font-sans text-[12px] font-medium uppercase tracking-[0.08em] text-[#78716C]">Updated</dt>
                <dd className="mt-2 font-mono text-[13px] text-[#1A1612]">{formatDate(node.updatedAt)}</dd>
              </div>
              <div>
                <dt className="font-sans text-[12px] font-medium uppercase tracking-[0.08em] text-[#78716C]">Author</dt>
                <dd className="mt-2 truncate font-mono text-[13px] text-[#1A1612]">{node.author ?? "Unknown"}</dd>
              </div>
            </dl>

            <p className="mt-6 font-sans text-[16px] leading-[1.55] text-[#1A1612]">{node.description}</p>

            {node.connections?.length ? (
              <div className="mt-6">
                <p className="mb-3 font-sans text-[12px] font-medium uppercase tracking-[0.08em] text-[#78716C]">Connections</p>
                <div className="flex flex-wrap gap-2">
                  {node.connections.map((connection) => (
                    <span key={connection} className="rounded-full px-3 py-1 font-sans text-[11px] font-medium text-[#1A1612]" style={{ background: panelTint(color) }}>
                      {connection}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <footer className="absolute bottom-0 left-0 right-0 flex items-center gap-3 border-t border-[rgba(26,22,18,0.08)] bg-[#FAF8F5] p-6">
            <button type="button" onClick={save} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#B8543D] px-4 font-sans text-[14px] font-medium text-white transition-colors hover:bg-[#A04830]">
              <TbBookmark size={15} strokeWidth={1.7} />
              {isSaved ? "Saved" : "Save to project"}
            </button>
            <button type="button" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[rgba(26,22,18,0.08)] px-4 font-sans text-[14px] font-medium text-[#78716C] transition-colors hover:border-[rgba(26,22,18,0.20)] hover:text-[#1A1612]">
              <TbExternalLink size={15} strokeWidth={1.7} />
              Open in full
            </button>
          </footer>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

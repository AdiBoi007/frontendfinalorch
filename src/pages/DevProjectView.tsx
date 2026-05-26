import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getLiveDoc } from "../lib/api";
import type { LiveDocPayload, LiveDocSection } from "../lib/types";

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

function renderSectionContent(section: LiveDocSection) {
  if (section.type === "title") {
    return (
      <h2 className="font-sans text-[24px] font-medium leading-[1.2] text-[#1A1612]">{section.content}</h2>
    );
  }

  if (section.type === "section-heading" && section.sectionLabel) {
    return (
      <p className="font-mono text-[10px] tracking-[0.16em] text-[#B8543D] uppercase">{section.sectionLabel}</p>
    );
  }

  if (section.type === "highlighted" && section.highlight) {
    const { text, start, end } = section.highlight;
    let highlightStart = start;
    let highlightEnd = end;

    if (section.content.slice(start, end) !== text) {
      const fallbackStart = section.content.indexOf(text);
      if (fallbackStart === -1) {
        return <p className="font-sans text-[13px] leading-[1.6] text-[#5A5450]">{section.content}</p>;
      }
      highlightStart = fallbackStart;
      highlightEnd = fallbackStart + text.length;
    }

    return (
      <p className="font-sans text-[13px] leading-[1.6] text-[#5A5450]">
        {section.content.slice(0, highlightStart)}
        <span className="rounded bg-[rgba(184,84,61,0.08)] px-1">{section.content.slice(highlightStart, highlightEnd)}</span>
        {section.content.slice(highlightEnd)}
      </p>
    );
  }

  if (section.type === "body" || section.type === "highlighted") {
    return <p className="font-sans text-[13px] leading-[1.6] text-[#5A5450]">{section.content}</p>;
  }

  return null;
}

export function DevProjectView() {
  const { id = "1" } = useParams();
  const [liveDoc, setLiveDoc] = useState<LiveDocPayload | null>(null);

  useEffect(() => {
    let active = true;
    void getLiveDoc(id).then((doc) => {
      if (active) setLiveDoc(doc);
    });
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="flex h-full gap-6 overflow-hidden bg-bg px-10 pb-10 pl-8 pt-10"
    >
      <motion.section variants={sectionVariants} className="w-[60%] overflow-y-auto">
        <div className="solid-card p-7">
          <p className="font-sans text-[11px] tracking-[0.16em] text-[rgba(120,113,108,0.6)]">LIVING DOCUMENT</p>
          {liveDoc ? (
            <div className="mt-5 space-y-5">
              {liveDoc.sections.map((section) => {
                const content = renderSectionContent(section);
                if (!content) return null;
                return <div key={section.id}>{content}</div>;
              })}
            </div>
          ) : (
            <p className="mt-5 font-sans text-[13px] text-[#78716C]">Loading document...</p>
          )}
        </div>
      </motion.section>

      <motion.section variants={sectionVariants} className="w-[40%]">
        <div className="solid-card p-7">
          <p className="font-sans text-[11px] tracking-[0.16em] text-[rgba(120,113,108,0.6)]">SOCRATES</p>
          <p className="mt-4 font-sans text-[13px] leading-[1.6] text-[#5A5450]">
            Socrates is open in the panel on the left. Ask me anything about this project — decisions,
            requirements, or what changed last week.
          </p>
          <button
            type="button"
            onClick={() => console.log("TODO: focus Socrates panel")}
            className="mt-6 rounded-xl border border-[rgba(26,22,18,0.08)] bg-white px-4 py-2.5 font-sans text-[13px] text-[#1A1612] transition-colors hover:border-[#B8543D]"
          >
            Open Socrates
          </button>
        </div>
      </motion.section>
    </motion.div>
  );
}

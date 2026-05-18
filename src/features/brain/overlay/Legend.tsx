import type { BrainCategory } from "../brain.types";
import { brainTokens } from "../tokens";

const categories: Array<{ id: BrainCategory; label: string }> = [
  { id: "doc", label: "Docs" },
  { id: "decision", label: "Decisions" },
  { id: "comms", label: "Comms" },
  { id: "team", label: "Team" },
  { id: "change", label: "Changes" }
];

export function Legend({ active, onSelect }: { active: BrainCategory | null; onSelect: (category: BrainCategory) => void }) {
  return (
    <div className="pointer-events-auto flex flex-col gap-3">
      {categories.map((category) => (
        <button key={category.id} type="button" onClick={() => onSelect(category.id)} className={`flex items-center gap-3 text-left transition-opacity ${active && active !== category.id ? "opacity-40" : "opacity-100"}`}>
          <span className="h-2 w-2 rounded-full" style={{ background: brainTokens.pin[category.id] }} />
          <span className="font-sans text-[12px] font-medium uppercase tracking-[0.08em] text-[#FAF8F5]/65">{category.label}</span>
        </button>
      ))}
    </div>
  );
}

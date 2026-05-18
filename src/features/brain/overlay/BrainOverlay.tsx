import type { BrainData } from "../brain.types";

export function BrainOverlay({ data }: { data: BrainData }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div className="absolute left-6 top-5 font-sans text-[12px] font-medium uppercase tracking-[0.08em] text-[#FAF8F5]/60">
        {data.projectName} <span className="mx-2 text-[#78716C]">/</span> <span className="text-[#B8543D]">Brain</span>
      </div>
    </div>
  );
}

import type { BrainData } from "../brain.types";
import { useEffect, useRef, useState } from "react";
import { TbAdjustments, TbBoxMultiple, TbPlus } from "react-icons/tb";
import { useBrainStore } from "../state/brainStore";
import { brainTokens } from "../tokens";
import { CameraControlButtons } from "./CameraControls";
import { SearchBar } from "./SearchBar";

export function BrainOverlay({ data }: { data: BrainData }) {
  const [filterOpen, setFilterOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchQuery = useBrainStore((state) => state.searchQuery);
  const setSearchQuery = useBrainStore((state) => state.setSearchQuery);
  const clearSelection = useBrainStore((state) => state.clearSelection);
  const setRotationPaused = useBrainStore((state) => state.setRotationPaused);
  const activeFilter = useBrainStore((state) => state.activeFilter);
  const setFilter = useBrainStore((state) => state.setFilter);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
      if (event.key === "Escape") {
        setSearchQuery("");
        clearSelection();
        useBrainStore.setState({ activeFilter: null });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clearSelection, setSearchQuery]);

  const iconButtonClass = "flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(26,22,18,0.08)] bg-white text-[#1A1612] transition-colors hover:border-[#B8543D] hover:text-[#B8543D]";

  return (
    <>
      <div className="flex h-14 flex-shrink-0 items-center gap-4 border-b border-[rgba(26,22,18,0.08)] bg-[#FAF8F5] px-6">
        <div className="w-[260px] font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[#78716C]">
          {data.projectName} <span className="mx-1 text-[#78716C]/70">/</span> <span className="text-[#B8543D]">Brain</span>
        </div>
        <div className="flex flex-1 justify-center">
          <SearchBar ref={inputRef} value={searchQuery} onChange={setSearchQuery} onFocus={() => setRotationPaused(true)} onBlur={() => setRotationPaused(false)} />
        </div>
        <div className="flex w-[260px] justify-end gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((value) => !value)}
              className={`${iconButtonClass} ${activeFilter ? "border-[#B8543D] text-[#B8543D]" : ""}`}
              aria-label="Filter nodes"
            >
              <TbAdjustments size={17} strokeWidth={1.6} />
            </button>
            {filterOpen ? (
              <div className="absolute right-0 top-11 z-20 w-[160px] rounded-xl border border-[rgba(26,22,18,0.08)] bg-white py-1.5 shadow-[0_4px_16px_rgba(26,22,18,0.10)]">
                {(["doc", "decision", "comms", "team", "change"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setFilter(cat);
                      setFilterOpen(false);
                    }}
                    className={`flex h-8 w-full items-center gap-2.5 px-3.5 font-sans text-[13px] transition-colors hover:bg-[rgba(26,22,18,0.04)] ${activeFilter === cat ? "font-medium text-[#B8543D]" : "text-[#1A1612]"}`}
                  >
                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: brainTokens.pin[cat] }} />
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
                {activeFilter ? (
                  <button
                    type="button"
                    onClick={() => {
                      setFilter(null);
                      setFilterOpen(false);
                    }}
                    className="mt-1 flex h-8 w-full items-center gap-2.5 border-t border-[rgba(26,22,18,0.06)] px-3.5 font-sans text-[13px] text-[#78716C] transition-colors hover:text-[#1A1612]"
                  >
                    Clear filter
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
          <button type="button" className={iconButtonClass} aria-label="Add knowledge">
            <TbPlus size={17} strokeWidth={1.6} />
          </button>
          <button type="button" className={iconButtonClass} aria-label="Switch to 2D view">
            <TbBoxMultiple size={17} strokeWidth={1.6} />
          </button>
        </div>
      </div>

      <div className="pointer-events-auto absolute bottom-6 right-6 z-10">
        <CameraControlButtons
          onZoomIn={() => window.dispatchEvent(new CustomEvent("brain-camera-zoom", { detail: -0.6 }))}
          onZoomOut={() => window.dispatchEvent(new CustomEvent("brain-camera-zoom", { detail: 0.6 }))}
          onReset={() => {
            clearSelection();
            window.dispatchEvent(new CustomEvent("brain-camera-reset"));
          }}
        />
      </div>
    </>
  );
}

import type { BrainData } from "../brain.types";
import { useEffect, useRef } from "react";
import { TbAdjustments, TbBoxMultiple, TbPlus } from "react-icons/tb";
import { useBrainStore } from "../state/brainStore";
import { Breadcrumb } from "./Breadcrumb";
import { CameraControlButtons } from "./CameraControls";
import { Legend } from "./Legend";
import { SearchBar } from "./SearchBar";
import { StatusLine } from "./StatusLine";

export function BrainOverlay({ data }: { data: BrainData }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const filter = useBrainStore((state) => state.filter);
  const setFilter = useBrainStore((state) => state.setFilter);
  const searchQuery = useBrainStore((state) => state.searchQuery);
  const setSearchQuery = useBrainStore((state) => state.setSearchQuery);
  const clearSelection = useBrainStore((state) => state.clearSelection);
  const setRotationPaused = useBrainStore((state) => state.setRotationPaused);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
      if (event.key === "Escape") {
        setSearchQuery("");
        clearSelection();
        useBrainStore.setState({ filter: null });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clearSelection, setSearchQuery]);

  const iconButtonClass = "pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(250,248,245,0.12)] bg-[#241D17] text-[#FAF8F5]/65 transition-colors hover:border-[#B8543D] hover:text-[#B8543D]";

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div className="absolute left-6 top-5">
        <Breadcrumb projectName={data.projectName} />
      </div>

      <div className="absolute left-1/2 top-3 -translate-x-1/2">
        <SearchBar ref={inputRef} value={searchQuery} onChange={setSearchQuery} onFocus={() => setRotationPaused(true)} onBlur={() => setRotationPaused(false)} />
      </div>

      <div className="absolute right-6 top-4 flex gap-2">
        <button type="button" className={iconButtonClass} aria-label="Filter pins">
          <TbAdjustments size={17} strokeWidth={1.6} />
        </button>
        <button type="button" className={iconButtonClass} aria-label="Add knowledge">
          <TbPlus size={17} strokeWidth={1.6} />
        </button>
        <button type="button" className={iconButtonClass} aria-label="Switch to 2D view">
          <TbBoxMultiple size={17} strokeWidth={1.6} />
        </button>
      </div>

      <div className="absolute bottom-8 left-6">
        <Legend active={filter} onSelect={setFilter} />
      </div>

      <div className="absolute bottom-8 right-6">
        <CameraControlButtons
          onZoomIn={() => window.dispatchEvent(new CustomEvent("brain-camera-zoom", { detail: -0.6 }))}
          onZoomOut={() => window.dispatchEvent(new CustomEvent("brain-camera-zoom", { detail: 0.6 }))}
          onReset={() => {
            clearSelection();
            window.dispatchEvent(new CustomEvent("brain-camera-reset"));
          }}
        />
      </div>

      <div className="absolute bottom-7 left-1/2 -translate-x-1/2">
        <StatusLine count={data.nodes.length} syncedAt={data.syncedAt} />
      </div>
    </div>
  );
}

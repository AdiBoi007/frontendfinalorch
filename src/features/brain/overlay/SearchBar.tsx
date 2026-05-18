import { forwardRef } from "react";
import { TbSearch } from "react-icons/tb";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
};

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(function SearchBar({ value, onChange, onFocus, onBlur }, ref) {
  return (
    <label className="pointer-events-auto flex h-11 w-[480px] items-center gap-3 rounded-xl border border-[rgba(184,84,61,0.12)] bg-[#241D17] px-4 text-[#FAF8F5]">
      <TbSearch size={18} className="text-[#FAF8F5]/55" strokeWidth={1.6} />
      <input
        ref={ref}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder="Search the brain..."
        className="min-w-0 flex-1 bg-transparent font-sans text-[14px] text-[#FAF8F5] outline-none placeholder:text-[#FAF8F5]/40"
      />
      <span className="rounded-full border border-[rgba(250,248,245,0.12)] px-2 py-1 font-mono text-[11px] text-[#FAF8F5]/55">Cmd K</span>
    </label>
  );
});

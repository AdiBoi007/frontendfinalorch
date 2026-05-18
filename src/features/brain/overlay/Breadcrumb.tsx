export function Breadcrumb({ projectName }: { projectName: string }) {
  return (
    <div className="font-sans text-[12px] font-medium uppercase tracking-[0.08em] text-[#FAF8F5]/60">
      {projectName} <span className="mx-2 text-[#78716C]">/</span> <span className="text-[#B8543D]">Brain</span>
    </div>
  );
}

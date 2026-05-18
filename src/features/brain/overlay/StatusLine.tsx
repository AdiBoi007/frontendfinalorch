export function StatusLine({ count, syncedAt }: { count: number; syncedAt: string }) {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(syncedAt).getTime()) / 60000));

  return <div className="font-mono text-[13px] text-[#FAF8F5]/45">{count.toLocaleString()} pins · synced {minutes > 240 ? "recently" : `${minutes} min ago`}</div>;
}

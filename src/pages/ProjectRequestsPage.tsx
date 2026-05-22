import { useNavigate, useParams } from "react-router-dom";
import { ArrowRightIcon, CheckIcon, FileTextIcon, GitBranchIcon, MessageSquareIcon, SparklesNodeIcon } from "../components/ui/AppIcons";
import { mockProjects, mockRequests } from "../lib/mockData";

const platformLabels = {
  slack: "Slack",
  email: "Gmail",
  whatsapp: "WhatsApp"
} as const;

const platformStyles = {
  slack: "bg-[#4A154B] text-white",
  email: "bg-[#EA4335] text-white",
  whatsapp: "bg-[#25D366] text-[#123322]"
} as const;

const demoFlow = [
  {
    id: "request",
    eyebrow: "Captured request",
    title: "Promo code system requested",
    body: "Jack asks for checkout discounts in Slack. Orchestra keeps the original message attached instead of turning it into an orphan task.",
    meta: "Slack #bloomfast-client / 2h ago",
    icon: MessageSquareIcon
  },
  {
    id: "decision",
    eyebrow: "Decision record",
    title: "Pending scope decision",
    body: "Socrates identifies launch impact, assigns Sarah as approver, and preserves the reasoning trail before the team accepts or rejects it.",
    meta: "Owner Sarah Chen / needs scope call",
    icon: CheckIcon
  },
  {
    id: "doc",
    eyebrow: "Living docs",
    title: "PRD and flow update drafted",
    body: "The accepted change can update the V1 scope boundary and checkout requirements with the source citation still visible.",
    meta: "Generated from Brain + accepted changes",
    icon: FileTextIcon
  }
] as const;

const evidenceRows = [
  { label: "Source", value: "Slack #bloomfast-client / Jack" },
  { label: "Extracted ask", value: "Add promo codes to checkout for launch-week offers" },
  { label: "Risk", value: "Touches payment, order totals, admin permissions, and QA scope" },
  { label: "Next action", value: "Approve for v1, defer to v2, or convert to paid change order" }
];

export function ProjectRequestsPage() {
  const { id = "1" } = useParams();
  const navigate = useNavigate();
  const project = mockProjects.find((item) => item.id === id) ?? mockProjects[0];
  const projectToken = project.name.split(" ")[0];
  const requests = mockRequests.filter((item) => item.from.includes(projectToken) || item.message.includes(projectToken));

  return (
    <section className="h-full overflow-y-auto bg-bg px-8 py-10">
      <div className="mb-8">
        <p className="font-sans text-[12px] tracking-[0.18em] text-[#B8543D]">Requests</p>
        <h1 className="mt-2 font-sans text-[48px] leading-none text-[#1A1612]">{project.name}</h1>
        <p className="mt-2 max-w-[760px] font-sans text-[14px] leading-6 text-[#78716C]">
          Communication and change requests linked to this project, with the provenance needed to turn chat into a decision and keep the live docs honest.
        </p>
      </div>

      <div className="mb-8 border border-[#ecece7] bg-white shadow-[0_18px_50px_rgba(26,22,18,0.06)]">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="border-b border-[#ecece7] p-6 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F6E8E3] text-[#B8543D]">
                <SparklesNodeIcon className="h-4 w-4" />
              </span>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#B8543D]">Demo wedge</p>
            </div>
            <h2 className="mt-4 max-w-[620px] font-sans text-[30px] leading-[1.05] text-[#1A1612]">
              From informal client ask to traceable product change.
            </h2>
            <p className="mt-3 max-w-[640px] font-sans text-[14px] leading-6 text-[#5A5450]">
              Orchestra catches the moment a chat message becomes real work: it keeps the source, drafts the decision record, and prepares the doc update with a citation.
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {demoFlow.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div key={step.id} className="relative border border-[#ecece7] bg-[#FAFAF8] p-4">
                    {index < demoFlow.length - 1 ? (
                      <div className="pointer-events-none absolute right-[-18px] top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#ecece7] bg-white text-[#B8543D] md:flex">
                        <ArrowRightIcon className="h-4 w-4" />
                      </div>
                    ) : null}
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#B8543D] shadow-[0_6px_16px_rgba(26,22,18,0.06)]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.13em] text-[#78716C]">{step.eyebrow}</p>
                    <h3 className="mt-2 font-sans text-[15px] font-semibold leading-5 text-[#1A1612]">{step.title}</h3>
                    <p className="mt-2 min-h-[88px] font-sans text-[13px] leading-5 text-[#5A5450]">{step.body}</p>
                    <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.1em] text-[#B8543D]">{step.meta}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="bg-[#FAFAF8] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#78716C]">Evidence packet</p>
                <h3 className="mt-2 font-sans text-[20px] font-semibold text-[#1A1612]">Promo code request</h3>
              </div>
              <span className="rounded-full bg-[#FFF0EC] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#9E3B2E]">Pending</span>
            </div>

            <div className="mt-5 space-y-3">
              {evidenceRows.map((row) => (
                <div key={row.label} className="border-l-2 border-[#B8543D] bg-white px-4 py-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.13em] text-[#9A8F87]">{row.label}</p>
                  <p className="mt-1 font-sans text-[13px] leading-5 text-[#1A1612]">{row.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => navigate(`/projects/${id}/live-doc`)}
                className="inline-flex items-center gap-2 rounded-full bg-[#1A1612] px-4 py-2 font-sans text-[12px] font-medium text-white"
              >
                View live doc
                <ArrowRightIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate(`/projects/${id}/brain`)}
                className="inline-flex items-center gap-2 rounded-full border border-[#D8D3CD] bg-white px-4 py-2 font-sans text-[12px] font-medium text-[#1A1612]"
              >
                Open Brain
                <GitBranchIcon className="h-4 w-4" />
              </button>
            </div>
          </aside>
        </div>
      </div>

      <div className="space-y-4">
        {requests.map((request) => (
          <article
            key={request.id}
            className="border border-[#ecece7] bg-white p-6 shadow-[0_10px_30px_rgba(26,22,18,0.04)]"
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-start">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] ${platformStyles[request.platform]}`}>
                    {platformLabels[request.platform]}
                  </span>
                  <span className="rounded-full bg-[#F5F4F0] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#78716C]">
                    source retained
                  </span>
                </div>
                <p className="font-sans text-[16px] font-medium text-[#1A1612]">{request.from}</p>
                <p className="mt-2 font-sans text-[14px] leading-6 text-[#5A5450]">{request.message}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-[#ecece7] px-3 py-1 font-sans text-[12px] text-[#5A5450]">Decision candidate</span>
                  <span className="rounded-full border border-[#ecece7] px-3 py-1 font-sans text-[12px] text-[#5A5450]">Doc impact scanned</span>
                  <span className="rounded-full border border-[#ecece7] px-3 py-1 font-sans text-[12px] text-[#5A5450]">Citation ready</span>
                </div>
              </div>
              <div className="shrink-0 md:text-right">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#B8543D]">{request.status}</p>
                <p className="mt-1 font-sans text-[12px] text-[#78716C]">{request.time}</p>
              </div>
            </div>
          </article>
        ))}

        {requests.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-[rgba(26,22,18,0.12)] bg-white/70 p-6 font-sans text-[14px] text-[#78716C]">
            No requests are linked to this project in the current mock dataset.
          </div>
        ) : null}
      </div>
    </section>
  );
}

import { useParams } from "react-router-dom";
import { mockProjects, mockRequests } from "../lib/mockData";

export function ProjectRequestsPage() {
  const { id = "1" } = useParams();
  const project = mockProjects.find((item) => item.id === id) ?? mockProjects[0];
  const projectToken = project.name.split(" ")[0];
  const requests = mockRequests.filter((item) => item.from.includes(projectToken) || item.message.includes(projectToken));

  return (
    <section className="h-full overflow-y-auto bg-bg px-8 py-10">
      <div className="mb-8">
        <p className="font-sans text-[12px] tracking-[0.18em] text-[#B8543D]">Requests</p>
        <h1 className="mt-2 font-sans text-[48px] leading-none text-[#1A1612]">{project.name}</h1>
        <p className="mt-2 font-sans text-[14px] text-[#78716C]">Communication and change requests linked to this project.</p>
      </div>

      <div className="space-y-4">
        {requests.map((request) => (
          <article
            key={request.id}
            className="rounded-[20px] border border-[#ecece7] bg-white p-6"
          >
            <div className="flex items-start gap-4">
              <div>
                <p className="font-sans text-[16px] font-medium text-[#1A1612]">{request.from}</p>
                <p className="mt-2 font-sans text-[14px] leading-6 text-[#5A5450]">{request.message}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="font-sans text-[12px] tracking-[0.16em] text-[#B8543D]">{request.status}</p>
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

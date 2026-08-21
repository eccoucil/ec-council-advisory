import { notFound, redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AgendaDrilldown } from "@/components/agenda-drilldown";
import { formatCountdown } from "@/components/admin-dashboard";
import { loadAgendaSection } from "@/lib/pulse-metrics";
import { formatMytStamp, PULSE_WINDOW_CLOSES } from "@/lib/pulse-window";
import { getSession } from "@/lib/session";

export default async function AgendaSectionPage(
  props: PageProps<"/admin/agenda/[section]">,
) {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }
  if (session.role !== "ADMIN") {
    redirect("/board");
  }

  const { section } = await props.params;
  const data = await loadAgendaSection(Number(section));
  if (!data) {
    notFound();
  }

  return (
    <main className="flex min-h-dvh w-full bg-[#F4F3F0]">
      <AdminSidebar
        active="agenda"
        name={session.name}
        closesIn={formatCountdown(data.generatedAt, PULSE_WINDOW_CLOSES)}
        closesAt={formatMytStamp(PULSE_WINDOW_CLOSES)}
      />
      <AgendaDrilldown data={data} />
    </main>
  );
}

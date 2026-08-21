import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { formatCountdown } from "@/components/admin-dashboard";
import { RosterTable } from "@/components/roster-view";
import { loadRoster } from "@/lib/pulse-metrics";
import { formatMytStamp } from "@/lib/pulse-window";
import { getSession } from "@/lib/session";

export default async function RosterPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }
  if (session.role !== "ADMIN") {
    redirect("/board");
  }

  const data = await loadRoster();

  return (
    <main className="flex min-h-dvh w-full bg-[#F4F3F0]">
      <AdminSidebar
        active="roster"
        name={session.name}
        closesIn={formatCountdown(data.generatedAt, data.windowClosesAt)}
        closesAt={formatMytStamp(data.windowClosesAt)}
      />
      <RosterTable data={data} />
    </main>
  );
}

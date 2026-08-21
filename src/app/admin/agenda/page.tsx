import { redirect } from "next/navigation";
import { AGENDA_ITEMS } from "@/lib/pulse-metrics";

export default function AgendaIndexPage() {
  redirect(`/admin/agenda/${AGENDA_ITEMS[0].section}`);
}

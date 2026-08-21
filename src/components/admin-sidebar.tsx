import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import {
  FileDownIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  QuoteIcon,
  TagsIcon,
  UsersIcon,
} from "@/components/admin-icons";

type AdminSidebarProps = {
  name: string;
  closesIn: string;
  closesAt: string;
  active?: "overview" | "agenda" | "roster";
};

/**
 * The rail keeps the full console shape in the design order. Entries without
 * an href are planned sections, so they render as plain labels rather than
 * dead links.
 */
const NAV = [
  { key: "overview", label: "Overview", href: "/admin", Icon: LayoutDashboardIcon },
  { key: "agenda", label: "Agenda items", href: "/admin/agenda", Icon: ListChecksIcon },
  { key: "themes", label: "Themes & tagging", Icon: TagsIcon },
  { key: "verbatims", label: "Verbatims", Icon: QuoteIcon },
  { key: "roster", label: "Roster & invites", href: "/admin/roster", Icon: UsersIcon },
  { key: "export", label: "Export readout", Icon: FileDownIcon },
] as const;

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "EC";
}

export function AdminSidebar({
  name,
  closesIn,
  closesAt,
  active = "overview",
}: AdminSidebarProps) {
  return (
    <aside className="flex w-[236px] shrink-0 flex-col justify-between gap-[26px] bg-[#101317] px-4 py-[26px]">
      <div className="flex w-full flex-col gap-[26px]">
        <div className="flex flex-col gap-[5px] px-2 py-1">
          <p className="m-0 font-[family-name:var(--font-pulse-mono)] text-[10px] tracking-[1.2px] text-[#C4122F]">
            EC-COUNCIL
          </p>
          <p className="m-0 font-[family-name:var(--font-pulse-display)] text-[19px] font-semibold text-[#F2F1EE]">
            Pulse Dashboard
          </p>
        </div>

        <nav className="flex w-full flex-col gap-1">
          {NAV.map((item) => {
            const { key, label, Icon } = item;
            const href = "href" in item ? item.href : undefined;

            if (key === active) {
              return (
                <div
                  key={key}
                  className="w-full overflow-hidden rounded-[3px] bg-[#C4122F] pl-[3px]"
                >
                  <div
                    aria-current="page"
                    className="flex items-center gap-[11px] bg-[#1B1F25] px-[14px] py-[11px]"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-[#F2F1EE]" />
                    <span className="flex-1 text-[13.5px] font-semibold text-[#F2F1EE]">
                      {label}
                    </span>
                  </div>
                </div>
              );
            }

            const body = (
              <>
                <Icon className="h-4 w-4 shrink-0 text-[#8A9099]" />
                <span className="flex-1 text-[13.5px] text-[#8A9099]">{label}</span>
              </>
            );

            return href ? (
              <Link
                key={key}
                className="flex items-center gap-[11px] rounded-[3px] py-[11px] pl-[17px] pr-[14px] hover:bg-[#1B1F25]"
                href={href}
              >
                {body}
              </Link>
            ) : (
              <div
                key={key}
                className="flex items-center gap-[11px] py-[11px] pl-[17px] pr-[14px]"
                title="Planned section"
              >
                {body}
              </div>
            );
          })}
        </nav>

        <div className="w-full overflow-hidden rounded-[3px] bg-[#C4122F] pt-[3px]">
          <div className="flex w-full flex-col gap-[6px] bg-[#1B1F25] px-4 py-[14px]">
            <p className="m-0 font-[family-name:var(--font-pulse-mono)] text-[9.5px] tracking-[0.8px] text-[#8A9099]">
              WINDOW CLOSES IN
            </p>
            <p className="m-0 font-[family-name:var(--font-pulse-display)] text-[24px]/[24px] font-semibold text-[#F2F1EE]">
              {closesIn}
            </p>
            <p className="m-0 text-[11px] text-[#8A9099]">{closesAt}</p>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center gap-[10px] border-t border-[#2A2F36] px-[10px] py-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1B1F25] text-[11px] font-semibold text-[#F2F1EE]">
          {initials(name)}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
          <span className="truncate text-[12.5px] text-[#F2F1EE]" title={name}>
            {name}
          </span>
          <span className="flex items-center gap-[10px]">
            <span className="font-[family-name:var(--font-pulse-mono)] text-[9.5px] tracking-[0.6px] text-[#8A9099]">
              ADMIN
            </span>
            <form action={signOut}>
              <button
                className="cursor-pointer border-0 bg-transparent p-0 text-[10.5px] text-[#8A9099] underline-offset-2 hover:text-[#F2F1EE] hover:underline"
                type="submit"
              >
                Sign out
              </button>
            </form>
          </span>
        </span>
      </div>
    </aside>
  );
}

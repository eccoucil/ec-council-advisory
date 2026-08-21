import { DatabaseIcon, LockIcon, ShieldCheckIcon } from "@/components/admin-icons";
import { RosterActions } from "@/components/roster-actions";
import {
  formatMytShort,
  ROSTER_STATUS_ORDER,
  type RosterMember,
  type RosterStatus,
  type RosterView,
} from "@/lib/pulse-metrics";
import { formatMytStamp } from "@/lib/pulse-window";

const RULE = "#E4E3DE";
const INK = "#14161A";
const GREEN = "#0F6E5C";
const AMBER = "#B87514";
const CRIMSON = "#C4122F";
const BODY = "#5A6069";

const STATUS_STYLE: Record<
  RosterStatus,
  { label: string; fg: string; bg: string }
> = {
  submitted: { label: "Submitted", fg: GREEN, bg: "#E8F2EE" },
  in_progress: { label: "In progress", fg: AMBER, bg: "#FBF1E2" },
  not_started: { label: "Not started", fg: BODY, bg: "#F4F3F0" },
  never_opened: { label: "Never opened", fg: CRIMSON, bg: "#FAEDEF" },
};

const KPI: Record<RosterStatus, { label: string; accent: string; sub: string }> = {
  submitted: { label: "SUBMITTED", accent: GREEN, sub: "target ≥70%" },
  in_progress: {
    label: "IN PROGRESS",
    accent: AMBER,
    sub: "started, not submitted",
  },
  not_started: {
    label: "NOT STARTED",
    accent: CRIMSON,
    sub: "code issued, no answers",
  },
  never_opened: {
    label: "NEVER OPENED",
    accent: INK,
    sub: "never requested a code",
  },
};

const POLICIES = [
  {
    title: "Closing the window",
    accent: CRIMSON,
    Icon: LockIcon,
    body: (closesAt: string, closedAt: string | null) =>
      closedAt
        ? `The window was closed early on ${closedAt}. Responses are locked and the survey redirects members to the board page. Reopening is a database change, not a console action.`
        : `Closing locks every response and turns each access code into a thank-you page. It is scheduled for ${closesAt}, and closing early cannot be undone from the console.`,
  },
  {
    title: "Retention & erasure",
    accent: GREEN,
    Icon: DatabaseIcon,
    body: () =>
      "Raw responses are retained 12 months (D6), then aggregate-only. Right-to-erasure is honoured on request; deleting a member cascades their answers and rescales every aggregate.",

  },
  {
    title: "Attribution in force",
    accent: "#4A83C7",
    Icon: ShieldCheckIcon,
    body: () =>
      "Attributed-internal, anonymous-external (D3). This roster shows member identity; the dashboard shows verbatims by seat number and every export strips it.",
  },
];

function ProgressCell({
  member,
  total,
}: {
  member: RosterMember;
  total: number;
}) {
  const share = total === 0 ? 0 : (member.answered / total) * 100;
  const fill =
    member.status === "submitted"
      ? GREEN
      : member.status === "in_progress"
        ? AMBER
        : "#CFCEC8";

  return (
    <span className="flex items-center gap-2">
      <span className="flex h-[6px] w-[78px] overflow-hidden rounded-[2px] bg-[#E4E3DE]">
        <span className="h-[6px]" style={{ width: `${share}%`, backgroundColor: fill }} />
      </span>
      <span className="font-[family-name:var(--font-pulse-mono)] text-[11px] text-[#5A6069]">
        {member.answered}/{total}
      </span>
    </span>
  );
}

export function RosterTable({ data }: { data: RosterView }) {
  const submittedPct =
    data.seated === 0
      ? 0
      : Math.round((data.counts.submitted / data.seated) * 100);

  return (
    <div className="flex flex-1 flex-col bg-[#F4F3F0]">
      <header className="flex w-full flex-wrap items-start justify-between gap-6 border-b border-[#E4E3DE] bg-white px-8 py-6">
        <div className="flex min-w-[280px] flex-1 flex-col gap-[5px]">
          <h1 className="m-0 font-[family-name:var(--font-pulse-display)] text-[24px] font-semibold text-[#14161A]">
            Roster &amp; invites
          </h1>
          <p className="m-0 text-[13px] text-[#5A6069]">
            {data.seated} of {data.target} seats filled · one-time-code access,
            no self-registration
          </p>
          {data.withoutEmail > 0 ? (
            <span
              className="mt-1 flex w-fit items-center gap-2 rounded-[6px] px-[10px] py-[5px]"
              style={{ backgroundColor: "#FAEDEF" }}
            >
              <span
                className="h-[6px] w-[6px] rounded-full"
                style={{ backgroundColor: CRIMSON }}
              />
              <span
                className="text-[12px] font-medium"
                style={{ color: CRIMSON }}
              >
                {data.withoutEmail} cannot be reached — no email on file
              </span>
            </span>
          ) : null}
        </div>
        <RosterActions
          closed={data.windowClosedAt !== null}
          closesAt={formatMytStamp(data.windowClosesAt)}
          pending={data.pending}
        />
      </header>

      <div className="flex w-full flex-col gap-5 px-8 pb-9 pt-6">
        <div className="flex w-full flex-wrap gap-4">
          {ROSTER_STATUS_ORDER.map((status) => (
            <div
              key={status}
              className="min-w-[190px] flex-1 overflow-hidden rounded-[3px] border-x border-b pt-[3px]"
              style={{ backgroundColor: KPI[status].accent, borderColor: RULE }}
            >
              <div className="flex h-full w-full flex-col gap-2 bg-white px-5 pb-5 pt-[18px]">
                <p className="m-0 font-[family-name:var(--font-pulse-mono)] text-[10px] tracking-[0.8px] text-[#8E949C]">
                  {KPI[status].label}
                </p>
                <p className="m-0 font-[family-name:var(--font-pulse-display)] text-[34px]/[34px] font-semibold text-[#14161A]">
                  {data.counts[status]}
                </p>
                <p className="m-0 text-[12px]/[17px] text-[#5A6069]">
                  {status === "submitted"
                    ? `${submittedPct}% · ${KPI[status].sub}`
                    : KPI[status].sub}
                </p>
              </div>
            </div>
          ))}
        </div>

        <section
          className="w-full overflow-hidden rounded-[3px] border-x border-b pt-[3px]"
          style={{ backgroundColor: INK, borderColor: RULE }}
        >
          <div className="w-full overflow-x-auto bg-white">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="bg-[#F4F3F0]">
                  {["MEMBER", "TITLE", "EMAIL", "STATUS", "PROGRESS", "LAST ACTIVITY"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="border-b px-4 py-[13px] text-left font-[family-name:var(--font-pulse-mono)] text-[9.5px] font-normal tracking-[0.8px] text-[#8E949C]"
                        style={{ borderColor: RULE }}
                        scope="col"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {data.members.map((member) => {
                  const style = STATUS_STYLE[member.status];
                  return (
                    <tr key={member.id} className="border-b" style={{ borderColor: RULE }}>
                      <td className="px-4 py-[13px]">
                        <span className="flex items-center gap-2">
                          <span
                            className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border bg-[#F4F3F0] text-[9.5px] font-semibold text-[#5A6069]"
                            style={{ borderColor: "#CFCEC8" }}
                          >
                            {member.initials}
                          </span>
                          <span className="text-[13px] font-medium text-[#14161A]">
                            {member.name}
                          </span>
                        </span>
                      </td>
                      <td className="max-w-[280px] px-4 py-[13px] text-[13px] text-[#5A6069]">
                        {member.title}
                      </td>
                      <td className="px-4 py-[13px] text-[13px] text-[#5A6069]">
                        {member.email ?? (
                          <span style={{ color: CRIMSON }}>none on file</span>
                        )}
                      </td>
                      <td className="px-4 py-[13px]">
                        <span
                          className="inline-flex items-center gap-[6px] rounded-[3px] px-[10px] py-[5px]"
                          style={{ backgroundColor: style.bg }}
                        >
                          <span
                            className="h-[6px] w-[6px] rounded-full"
                            style={{ backgroundColor: style.fg }}
                          />
                          <span
                            className="whitespace-nowrap text-[11.5px] font-medium"
                            style={{ color: style.fg }}
                          >
                            {style.label}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-[13px]">
                        <ProgressCell member={member} total={data.totalQuestions} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-[13px] font-[family-name:var(--font-pulse-mono)] text-[11px] text-[#8E949C]">
                        {member.activity.at
                          ? `${member.activity.label} ${formatMytShort(member.activity.at)}`
                          : member.activity.label}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div
            className="flex w-full flex-wrap items-center justify-between gap-3 border-t bg-[#F4F3F0] px-4 py-[13px]"
            style={{ borderColor: RULE }}
          >
            <span className="text-[12px] text-[#8E949C]">
              Showing all {data.members.length} members
            </span>
            <span className="font-[family-name:var(--font-pulse-mono)] text-[11px] text-[#8E949C]">
              CSV columns: name, title, email
            </span>
          </div>
        </section>

        <div className="flex w-full flex-col gap-5 lg:flex-row">
          {POLICIES.map(({ title, accent, Icon, body }) => (
            <section
              key={title}
              className="flex-1 overflow-hidden rounded-[3px] border-y border-r pl-[4px]"
              style={{ backgroundColor: accent, borderColor: RULE }}
            >
              <div className="flex h-full w-full flex-col gap-[10px] bg-white px-[22px] py-5">
                <header className="flex w-full items-center gap-[9px]">
                  <Icon className="h-4 w-4 shrink-0" style={{ color: accent }} />
                  <h2 className="m-0 flex-1 font-[family-name:var(--font-pulse-display)] text-[17px] font-semibold text-[#14161A]">
                    {title}
                  </h2>
                </header>
                <p className="m-0 text-[13px]/[21px] text-[#5A6069]">
                  {body(
                    formatMytStamp(data.windowClosesAt),
                    data.windowClosedAt
                      ? formatMytStamp(data.windowClosedAt)
                      : null,
                  )}
                </p>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

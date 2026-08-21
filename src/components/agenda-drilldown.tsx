import Link from "next/link";
import type { ReactNode } from "react";
import { formatRelative } from "@/components/admin-dashboard";
import {
  ChevronDownIcon,
  QuoteIcon,
  ShieldCheckIcon,
} from "@/components/admin-icons";
import type {
  AgendaSection,
  LaneKey,
  MemberCell,
  QuestionBreakdown,
  SectionKpi,
  SectionMemberRow,
  SectionVerbatim,
  Tone,
} from "@/lib/pulse-metrics";

const TONE_HEX: Record<Tone, string> = {
  crimson: "#C4122F",
  blue: "#4A83C7",
  gold: "#D9922F",
  teal: "#2FA98A",
  violet: "#9B7BD4",
  ink: "#14161A",
};

const INK = "#14161A";
const GREEN = "#0F6E5C";
const AMBER = "#B87514";
const RULE = "#E4E3DE";
const DIM = "#8E949C";
const BODY = "#5A6069";

const LANES: Array<{
  key: LaneKey;
  title: string;
  hex: string;
}> = [
  { key: "liked", title: "LIKED", hex: GREEN },
  { key: "disliked", title: "DISLIKED", hex: AMBER },
  { key: "gaps", title: "GAPS", hex: "#C4122F" },
];

function statusHex(status: SectionKpi["status"]) {
  return status === "good" ? GREEN : status === "warn" ? AMBER : INK;
}

function Panel({
  accent,
  title,
  sub,
  children,
}: {
  accent: string;
  title: string;
  sub?: string;
  children: ReactNode;
}) {
  return (
    <section
      className="w-full overflow-hidden rounded-[3px] border-x border-b pt-[3px]"
      style={{ backgroundColor: accent, borderColor: RULE }}
    >
      <div className="flex w-full flex-col gap-[18px] bg-white px-[22px] pb-6 pt-[22px]">
        <header className="flex w-full flex-col gap-1">
          <h2 className="m-0 font-[family-name:var(--font-pulse-display)] text-[18px] font-semibold text-[#14161A]">
            {title}
          </h2>
          {sub ? <p className="m-0 text-[12px] text-[#8E949C]">{sub}</p> : null}
        </header>
        {children}
      </div>
    </section>
  );
}

function QuestionRow({
  question,
  last,
}: {
  question: QuestionBreakdown;
  last: boolean;
}) {
  const total = question.segments.reduce(
    (sum, segment) => sum + segment.count,
    0,
  );

  return (
    <div
      className={`flex w-full flex-col gap-[10px] ${last ? "" : "border-b pb-4"}`}
      style={last ? undefined : { borderColor: RULE }}
    >
      <div className="flex w-full flex-wrap items-center gap-3">
        <span className="w-[26px] shrink-0 font-[family-name:var(--font-pulse-mono)] text-[11px] text-[#8E949C]">
          {question.code}
        </span>
        <span className="min-w-[240px] flex-1 text-[13.5px] text-[#14161A]">
          {question.prompt}
        </span>
        <span className="font-[family-name:var(--font-pulse-mono)] text-[10px] text-[#8E949C]">
          {question.kind}
        </span>
        <span className="font-[family-name:var(--font-pulse-display)] text-[15px] font-semibold text-[#14161A]">
          {question.stat}
        </span>
      </div>

      <div className="flex h-[26px] w-full overflow-hidden rounded-[2px] bg-[#E4E3DE]">
        {total === 0
          ? null
          : question.segments.map((segment) => {
              if (segment.count === 0) {
                return null;
              }
              const share = (segment.count / total) * 100;
              return (
                <span
                  key={segment.label}
                  className="flex h-[26px] items-center justify-center overflow-hidden"
                  style={{ width: `${share}%`, backgroundColor: segment.hex }}
                  title={segment.label}
                >
                  {share >= 12 ? (
                    <span className="whitespace-nowrap px-1 font-[family-name:var(--font-pulse-mono)] text-[10px] text-white">
                      {segment.label}
                    </span>
                  ) : null}
                </span>
              );
            })}
      </div>
    </div>
  );
}

const CELL_TONE: Record<MemberCell["tone"], { color: string; background: string }> = {
  good: { color: GREEN, background: "#E8F2EE" },
  warn: { color: AMBER, background: "#FBF1E2" },
  bad: { color: "#B4483C", background: "#FAEDEF" },
  neutral: { color: BODY, background: "#F4F3F0" },
};

function MemberTable({
  codes,
  rows,
  silent,
}: {
  codes: string[];
  rows: SectionMemberRow[];
  silent: number;
}) {
  if (rows.length === 0) {
    return (
      <p className="m-0 text-[13px] text-[#8E949C]">
        No member has answered this section yet.
      </p>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="bg-[#F4F3F0]">
              <th
                className="border-b px-3 py-[11px] text-left font-[family-name:var(--font-pulse-mono)] text-[9.5px] font-normal tracking-[0.8px] text-[#8E949C]"
                style={{ borderColor: RULE }}
                scope="col"
              >
                BOARD MEMBER
              </th>
              {codes.map((code) => (
                <th
                  key={code}
                  className="border-b px-3 py-[11px] text-left font-[family-name:var(--font-pulse-mono)] text-[9.5px] font-normal tracking-[0.8px] text-[#8E949C]"
                  style={{ borderColor: RULE }}
                  scope="col"
                >
                  {code}
                </th>
              ))}
              <th
                className="border-b px-3 py-[11px] text-left font-[family-name:var(--font-pulse-mono)] text-[9.5px] font-normal tracking-[0.8px] text-[#8E949C]"
                style={{ borderColor: RULE }}
                scope="col"
              >
                WHAT IS MISSING
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.memberId} className="border-b" style={{ borderColor: RULE }}>
                <td className="px-3 py-[11px]">
                  <span className="flex items-center gap-2">
                    <span
                      className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border bg-[#F4F3F0] text-[9.5px] font-semibold text-[#5A6069]"
                      style={{ borderColor: "#CFCEC8" }}
                    >
                      {row.initials}
                    </span>
                    <span className="flex flex-col">
                      <span className="whitespace-nowrap text-[13px] font-medium text-[#14161A]">
                        {row.name}
                      </span>
                      <span
                        className="font-[family-name:var(--font-pulse-mono)] text-[9.5px] tracking-[0.6px]"
                        style={{ color: row.submitted ? GREEN : AMBER }}
                      >
                        {row.submitted ? "SUBMITTED" : "IN PROGRESS"}
                      </span>
                    </span>
                  </span>
                </td>
                {row.cells.map((cell) => (
                  <td key={cell.code} className="px-3 py-[11px]">
                    {cell.display === null ? (
                      <span className="text-[12.5px] text-[#8E949C]">—</span>
                    ) : (
                      <span
                        className="inline-block whitespace-nowrap rounded-[3px] px-[9px] py-[4px] text-[11.5px] font-medium"
                        style={{
                          color: CELL_TONE[cell.tone].color,
                          backgroundColor: CELL_TONE[cell.tone].background,
                        }}
                      >
                        {cell.display}
                      </span>
                    )}
                  </td>
                ))}
                <td className="px-3 py-[11px] text-[12.5px] text-[#5A6069]">
                  {row.gaps.length > 0 ? row.gaps.join(", ") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.some((row) => row.liked || row.disliked || row.comments.length > 0) ? (
        <div className="flex w-full flex-col gap-[10px]">
          {rows
            .filter((row) => row.liked || row.disliked || row.comments.length > 0)
            .map((row) => (
              <div
                key={row.memberId}
                className="flex w-full flex-col gap-2 rounded-[3px] border bg-[#F4F3F0] px-4 py-3"
                style={{ borderColor: RULE }}
              >
                <p className="m-0 text-[12.5px] font-semibold text-[#14161A]">
                  {row.name}
                </p>
                {row.liked ? (
                  <p className="m-0 text-[12.5px]/[19px] text-[#5A6069]">
                    <span
                      className="font-[family-name:var(--font-pulse-mono)] text-[9.5px] tracking-[0.8px]"
                      style={{ color: GREEN }}
                    >
                      LIKED{" "}
                    </span>
                    {row.liked}
                  </p>
                ) : null}
                {row.disliked ? (
                  <p className="m-0 text-[12.5px]/[19px] text-[#5A6069]">
                    <span
                      className="font-[family-name:var(--font-pulse-mono)] text-[9.5px] tracking-[0.8px]"
                      style={{ color: AMBER }}
                    >
                      DISLIKED{" "}
                    </span>
                    {row.disliked}
                  </p>
                ) : null}
                {row.comments.map((comment) => (
                  <p
                    key={comment.code}
                    className="m-0 text-[12.5px]/[19px] text-[#5A6069]"
                  >
                    <span className="font-[family-name:var(--font-pulse-mono)] text-[9.5px] tracking-[0.8px] text-[#8E949C]">
                      {comment.code}{" "}
                    </span>
                    {comment.text}
                  </p>
                ))}
              </div>
            ))}
        </div>
      ) : null}

      {silent > 0 ? (
        <p className="m-0 text-[11.5px] text-[#8E949C]">
          {silent} member{silent === 1 ? " has" : "s have"} not answered this
          section.
        </p>
      ) : null}
    </div>
  );
}

function Lane({
  title,
  hex,
  items,
  total,
}: {
  title: string;
  hex: string;
  items: SectionVerbatim[];
  total: number;
}) {
  return (
    <section
      className="flex-1 overflow-hidden rounded-[3px] border-x border-b pt-[3px]"
      style={{ backgroundColor: hex, borderColor: RULE }}
    >
      <div className="flex h-full w-full flex-col gap-[14px] bg-white px-5 pb-[22px] pt-5">
        <header className="flex w-full items-center gap-[9px]">
          <QuoteIcon className="h-[15px] w-[15px] shrink-0" />
          <span
            className="flex-1 font-[family-name:var(--font-pulse-mono)] text-[11px] tracking-[0.9px]"
            style={{ color: hex }}
          >
            {title}
          </span>
          <span className="text-[11.5px] text-[#8E949C]">
            {total} verbatim{total === 1 ? "" : "s"}
          </span>
        </header>

        {items.length === 0 ? (
          <p className="m-0 text-[13px] text-[#8E949C]">Nothing recorded yet.</p>
        ) : (
          items.map((item) => (
            <figure
              key={item.id}
              className="m-0 flex w-full flex-col gap-3 rounded-[2px] border bg-[#F4F3F0] px-4 py-[15px]"
              style={{ borderColor: RULE }}
            >
              <figcaption
                className="font-[family-name:var(--font-pulse-mono)] text-[10px] tracking-[0.8px]"
                style={{ color: hex }}
              >
                {title}
              </figcaption>
              <blockquote className="m-0 text-[13px]/[21px] text-[#14161A]">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <p className="m-0 font-[family-name:var(--font-pulse-mono)] text-[10px] text-[#8E949C]">
                {item.member} · {item.code}
              </p>
            </figure>
          ))
        )}

        {total > items.length ? (
          <p className="m-0 text-[12px] text-[#5A6069]">
            Showing {items.length} of {total}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function AgendaDrilldown({ data }: { data: AgendaSection }) {
  const accent = TONE_HEX[data.tone];

  return (
    <div className="flex flex-1 flex-col bg-[#F4F3F0]">
      <header className="flex w-full flex-col gap-[14px] border-b border-[#E4E3DE] bg-white px-8 pb-5 pt-[22px]">
        <nav className="flex items-center gap-2 text-[12px]">
          <Link className="text-[#8E949C] hover:underline" href="/admin">
            Overview
          </Link>
          <ChevronDownIcon className="h-[13px] w-[13px] -rotate-90 text-[#8E949C]" />
          <Link className="text-[#8E949C] hover:underline" href="/admin/agenda">
            Agenda items
          </Link>
          <ChevronDownIcon className="h-[13px] w-[13px] -rotate-90 text-[#8E949C]" />
          <span className="text-[#14161A]">
            {data.mark} {data.title}
          </span>
        </nav>

        <div className="flex w-full flex-wrap items-center justify-between gap-6">
          <div className="flex flex-1 flex-col gap-[6px]">
            <div className="flex w-full flex-wrap items-center gap-3">
              <span
                className="h-[26px] w-[4px] shrink-0 rounded-[2px]"
                style={{ backgroundColor: accent }}
              />
              <h1 className="m-0 font-[family-name:var(--font-pulse-display)] text-[26px] font-semibold text-[#14161A]">
                {data.title}
              </h1>
              {data.anchors.length > 0 ? (
                <span className="flex-1 font-[family-name:var(--font-pulse-mono)] text-[10.5px] text-[#8E949C]">
                  {data.anchors.join(" · ")}
                </span>
              ) : null}
            </div>
            <p className="m-0 text-[12.5px] text-[#5A6069]">
              {data.responses} of {data.invited} responses · {data.questionCount}{" "}
              questions · {formatRelative(data.lastUpdatedAt, data.generatedAt)}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-[10px]">
            {data.previous ? (
              <Link
                className="flex h-9 items-center gap-[7px] rounded-[6px] border px-[13px] text-[12.5px] text-[#5A6069] hover:border-[#8E949C]"
                style={{ borderColor: "#CFCEC8" }}
                href={`/admin/agenda/${data.previous.section}`}
              >
                <ChevronDownIcon className="h-[14px] w-[14px] rotate-90 text-[#8E949C]" />
                {data.previous.title}
              </Link>
            ) : null}
            {data.next ? (
              <Link
                className="flex h-9 items-center gap-[7px] rounded-[6px] border px-[13px] text-[12.5px] text-[#5A6069] hover:border-[#8E949C]"
                style={{ borderColor: "#CFCEC8" }}
                href={`/admin/agenda/${data.next.section}`}
              >
                {data.next.title}
                <ChevronDownIcon className="h-[14px] w-[14px] -rotate-90 text-[#8E949C]" />
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      <div className="flex w-full flex-col gap-5 px-8 pb-9 pt-6">
        <div className="flex w-full flex-wrap gap-4">
          {data.kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="min-w-[210px] flex-1 overflow-hidden rounded-[3px] border-x border-b pt-[3px]"
              style={{
                backgroundColor:
                  kpi.status === "neutral" ? accent : statusHex(kpi.status),
                borderColor: RULE,
              }}
            >
              <div className="flex h-full w-full flex-col gap-2 bg-white px-5 pb-5 pt-[18px]">
                <p className="m-0 font-[family-name:var(--font-pulse-mono)] text-[10px] tracking-[0.8px] text-[#8E949C]">
                  {kpi.label}
                </p>
                <p className="m-0 font-[family-name:var(--font-pulse-display)] text-[34px]/[34px] font-semibold text-[#14161A]">
                  {kpi.value}
                </p>
                <p className="m-0 text-[12px]/[17px] text-[#5A6069]">{kpi.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex w-full flex-col gap-5 xl:flex-row">
          <div className="flex-1">
            <Panel
              accent={accent}
              title="Question by question"
              sub={`Scored questions in this section · ${data.responses} respondent${data.responses === 1 ? "" : "s"}`}
            >
              <div className="flex w-full flex-col gap-4">
                {data.questions.map((question, index) => (
                  <QuestionRow
                    key={question.code}
                    question={question}
                    last={index === data.questions.length - 1}
                  />
                ))}
              </div>
            </Panel>
          </div>

          <div className="flex w-full flex-col gap-5 xl:w-[380px] xl:shrink-0">
            <Panel
              accent={AMBER}
              title="What is missing or weakest"
              sub={`multi-select · counts of ${data.weaknessResponses} respondent${data.weaknessResponses === 1 ? "" : "s"}`}
            >
              {data.weaknesses.length === 0 ? (
                <p className="m-0 text-[13px] text-[#8E949C]">
                  No gap selections yet.
                </p>
              ) : (
                <div className="flex w-full flex-col gap-[9px]">
                  {data.weaknesses.map((option, position) => {
                    const top = data.weaknesses[0]?.count ?? 1;
                    return (
                      <div
                        key={option.id}
                        className="flex w-full flex-col gap-[5px]"
                      >
                        <div className="flex w-full items-start justify-between gap-[10px]">
                          <span className="flex-1 text-[12.5px] text-[#14161A]">
                            {option.label}
                          </span>
                          <span className="font-[family-name:var(--font-pulse-mono)] text-[11.5px] text-[#5A6069]">
                            {option.count}
                          </span>
                        </div>
                        <div className="flex h-[6px] w-full overflow-hidden rounded-[2px] bg-[#E4E3DE]">
                          <span
                            className="h-[6px]"
                            style={{
                              width: `${top === 0 ? 0 : (option.count / top) * 100}%`,
                              backgroundColor: position === 0 ? AMBER : DIM,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>

            <section
              className="w-full overflow-hidden rounded-[3px] border-y border-r pl-[4px]"
              style={{ backgroundColor: "#C4122F", borderColor: RULE }}
            >
              <div className="flex w-full flex-col gap-[11px] bg-white px-[22px] py-5">
                <header className="flex w-full items-center gap-[9px]">
                  <ShieldCheckIcon className="h-4 w-4 shrink-0 text-[#C4122F]" />
                  <h2 className="m-0 flex-1 font-[family-name:var(--font-pulse-display)] text-[17px] font-semibold text-[#14161A]">
                    Decision signal
                  </h2>
                </header>
                <p className="m-0 text-[13px]/[21px] text-[#5A6069]">
                  {data.decision}
                </p>
              </div>
            </section>
          </div>
        </div>

        <Panel
          accent={TONE_HEX[data.tone]}
          title="Responses by board member"
          sub="Attributed internally (D3); exports strip identity"
        >
          <MemberTable
            codes={data.scoredCodes}
            rows={data.memberRows}
            silent={data.silent}
          />
        </Panel>

        <div className="flex w-full flex-col gap-5 xl:flex-row">
          {LANES.map((lane) => (
            <Lane
              key={lane.key}
              title={lane.title}
              hex={lane.hex}
              items={data.lanes[lane.key].slice(0, 2)}
              total={data.laneTotals[lane.key]}
            />
          ))}
        </div>

      </div>
    </div>
  );
}

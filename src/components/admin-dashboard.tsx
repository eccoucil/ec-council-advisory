import Link from "next/link";
import type { ReactNode } from "react";
import {
  CONSENSUS_THRESHOLD,
  LIKERT_HEX,
  PMF_STRONG_THRESHOLD,
  RESPONSE_RATE_TARGET,
  type AgendaMetric,
  type PulseDashboard,
  type Tone,
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

export function formatCountdown(from: Date, to: Date) {
  const ms = to.getTime() - from.getTime();
  if (ms <= 0) {
    return "Closed";
  }

  const hours = Math.floor(ms / 3_600_000);
  const days = Math.floor(hours / 24);
  const restHours = hours % 24;

  if (days === 0) {
    return `${restHours}h ${Math.floor((ms % 3_600_000) / 60_000)}m`;
  }

  return `${days} ${days === 1 ? "day" : "days"} ${String(restHours).padStart(2, "0")}h`;
}

export function formatRelative(at: Date | null, now: Date) {
  if (!at) {
    return "no responses yet";
  }

  const minutes = Math.max(0, Math.round((now.getTime() - at.getTime()) / 60_000));
  if (minutes < 1) {
    return "last response just now";
  }
  if (minutes < 60) {
    return `last response ${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 48) {
    return `last response ${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  return `last response ${Math.round(hours / 24)} days ago`;
}

function Panel({
  accent,
  title,
  sub,
  action,
  children,
}: {
  accent: string;
  title: string;
  sub: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      className="w-full overflow-hidden rounded-[3px] border-x border-b pt-[3px]"
      style={{ backgroundColor: accent, borderColor: RULE }}
    >
      <div className="flex w-full flex-col gap-4 bg-white px-[22px] pb-6 pt-[22px]">
        <header className="flex w-full items-center justify-between gap-4">
          <div className="flex flex-1 flex-col gap-1">
            <h2 className="m-0 font-[family-name:var(--font-pulse-display)] text-[18px] font-semibold text-[#14161A]">
              {title}
            </h2>
            <p className="m-0 text-[12px]/[17px] text-[#8E949C]">{sub}</p>
          </div>
          {action}
        </header>
        {children}
      </div>
    </section>
  );
}

function Kpi({
  accent,
  label,
  value,
  sub,
}: {
  accent: string;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div
      className="flex-1 overflow-hidden rounded-[3px] border-x border-b pt-[3px]"
      style={{ backgroundColor: accent, borderColor: RULE }}
    >
      <div className="flex h-full w-full flex-col gap-2 bg-white px-5 pb-5 pt-[18px]">
        <p className="m-0 font-[family-name:var(--font-pulse-mono)] text-[10px] tracking-[0.8px] text-[#8E949C]">
          {label}
        </p>
        <p className="m-0 font-[family-name:var(--font-pulse-display)] text-[34px]/[34px] font-semibold text-[#14161A]">
          {value}
        </p>
        <p className="m-0 text-[12px]/[17px] text-[#5A6069]">{sub}</p>
      </div>
    </div>
  );
}

function AlignmentRow({ item }: { item: AgendaMetric }) {
  const accent = TONE_HEX[item.tone];
  const total = item.distribution.reduce((sum, count) => sum + count, 0);

  return (
    <Link
      className="block w-full overflow-hidden rounded-[3px] border-y border-r pl-[3px] transition-shadow hover:shadow-[0_2px_10px_rgba(11,11,12,0.08)]"
      href={`/admin/agenda/${item.section}`}
      style={{ backgroundColor: accent, borderColor: RULE }}
    >
      <div className="flex w-full flex-col gap-[11px] bg-white px-[18px] py-[14px]">
        <div className="flex w-full items-center gap-3">
          <span
            className="w-5 shrink-0 font-[family-name:var(--font-pulse-mono)] text-[11px]"
            style={{ color: accent }}
          >
            {item.ordinal}
          </span>
          <span className="flex-1 text-[14.5px] font-semibold text-[#14161A]">
            {item.title}
          </span>
          <span
            className="text-[12.5px]"
            style={{
              color:
                item.consensusYesPct === null
                  ? "#8E949C"
                  : item.consensusYesPct >= CONSENSUS_THRESHOLD
                    ? GREEN
                    : AMBER,
            }}
          >
            {item.consensusYesPct === null
              ? "No verdict yet"
              : `${item.consensusYesPct}% Yes`}
          </span>
          <span className="h-[14px] w-px shrink-0 bg-[#CFCEC8]" />
          <span className="flex w-16 shrink-0 items-center justify-end gap-[3px]">
            <span className="font-[family-name:var(--font-pulse-display)] text-[22px]/[22px] font-semibold text-[#14161A]">
              {item.index ?? "—"}
            </span>
            <span className="font-[family-name:var(--font-pulse-mono)] text-[10px] text-[#8E949C]">
              /100
            </span>
          </span>
        </div>

        <div className="flex h-3 w-full overflow-hidden rounded-[2px] bg-[#E4E3DE]">
          {total > 0
            ? item.distribution.map((count, level) =>
                count === 0 ? null : (
                  <span
                    key={level}
                    className="h-3"
                    style={{
                      width: `${(count / total) * 100}%`,
                      backgroundColor: LIKERT_HEX[level],
                    }}
                    title={`${count} scored ${level + 1}/5`}
                  />
                ),
              )
            : null}
        </div>
        <p className="m-0 font-[family-name:var(--font-pulse-mono)] text-[10px] text-[#8E949C]">
          n={item.responses}
        </p>
      </div>
    </Link>
  );
}

export function PulseDashboardView({ data }: { data: PulseDashboard }) {
  const {
    alignmentItems,
    consensusYesPct,
    consensusResponses,
    followUps,
    funnel,
    generatedAt,
    lastResponseAt,
    meanAlignmentIndex,
    painPoints,
    painPointResponses,
    pmf,
    responseRatePct,
    seated,
    sessionLabel,
    submitted,
    target,
    verbatims,
    windowClosesAt,
  } = data;

  const scoredItems = alignmentItems.filter((item) => item.index !== null).length;
  const funnelMax = Math.max(...funnel.map((step) => step.value), 1);
  const painMax = Math.max(...painPoints.map((entry) => entry.count), 1);
  const windowOpen = windowClosesAt.getTime() > generatedAt.getTime();

  return (
    <div className="flex flex-1 flex-col bg-[#F4F3F0]">
      <header className="flex w-full items-center justify-between gap-6 border-b border-[#E4E3DE] bg-white px-8 py-6">
        <div className="flex flex-1 flex-col gap-[5px]">
          <h1 className="m-0 font-[family-name:var(--font-pulse-display)] text-[24px] font-semibold text-[#14161A]">
            {sessionLabel}
          </h1>
          <p className="m-0 text-[13px] text-[#5A6069]">
            {windowOpen ? "Live" : "Window closed"} ·{" "}
            {formatRelative(lastResponseAt, generatedAt)} · {seated} members on
            the roster
            {seated === target ? null : ` of ${target} planned`}
          </p>
        </div>
        <span
          className="flex shrink-0 items-center gap-2 rounded-[6px] border px-[13px] py-2"
          style={{ borderColor: "#CFCEC8" }}
        >
          <span
            className="h-[6px] w-[6px] rounded-full"
            style={{ backgroundColor: windowOpen ? GREEN : "#8E949C" }}
          />
          <span className="font-[family-name:var(--font-pulse-mono)] text-[11px] tracking-[0.6px] text-[#5A6069]">
            {submitted} SUBMITTED
          </span>
        </span>
      </header>

      <div className="flex w-full flex-col gap-[22px] px-8 pb-9 pt-[26px]">
        <div className="flex w-full flex-wrap gap-4">
          <Kpi
            accent={responseRatePct >= RESPONSE_RATE_TARGET ? GREEN : AMBER}
            label="RESPONSE RATE"
            value={`${submitted} / ${seated}`}
            sub={`${responseRatePct}% complete · target ≥${RESPONSE_RATE_TARGET}%`}
          />
          <Kpi
            accent={
              consensusYesPct !== null && consensusYesPct >= CONSENSUS_THRESHOLD
                ? GREEN
                : AMBER
            }
            label="BOARD CONSENSUS"
            value={consensusYesPct === null ? "—" : `${consensusYesPct}%`}
            sub={`Yes on 6.2 · n=${consensusResponses} · threshold ≥${CONSENSUS_THRESHOLD}%`}
          />
          <Kpi
            accent={INK}
            label="MEAN ALIGNMENT INDEX"
            value={meanAlignmentIndex === null ? "—" : String(meanAlignmentIndex)}
            sub={`across ${scoredItems} agenda item${scoredItems === 1 ? "" : "s"} (0–100)`}
          />
          <Kpi
            accent="#4A83C7"
            label="FOLLOW-UP PIPELINE"
            value={String(followUps)}
            sub="opted in to a 30-min call"
          />
        </div>

        <div className="flex w-full flex-col gap-5 xl:flex-row">
          <div className="flex-1">
            <Panel
              accent={INK}
              title="Alignment by agenda item"
              sub="Likert x.1 rescaled 0–100, paired with %Yes on the item's consensus question"
              action={
                <div className="flex shrink-0 items-center gap-[10px]">
                  {LIKERT_HEX.map((hex, index) => (
                    <span key={hex} className="flex items-center gap-[5px]">
                      <span
                        className="h-[9px] w-[9px] rounded-[2px]"
                        style={{ backgroundColor: hex }}
                      />
                      <span className="font-[family-name:var(--font-pulse-mono)] text-[10px] text-[#8E949C]">
                        {index + 1}
                      </span>
                    </span>
                  ))}
                </div>
              }
            >
              <div className="flex w-full flex-col gap-[10px]">
                {alignmentItems.map((item) => (
                  <AlignmentRow key={item.section} item={item} />
                ))}
              </div>
            </Panel>
          </div>

          <div className="flex w-full flex-col gap-5 xl:w-[380px] xl:shrink-0">
            <Panel
              accent={INK}
              title="Product-market fit"
              sub={`% answering "very disappointed" · ≥${PMF_STRONG_THRESHOLD}% = strong signal`}
            >
              <div className="flex w-full flex-col gap-[14px]">
                {pmf.map((entry) => {
                  const strong =
                    entry.veryPct !== null &&
                    entry.veryPct >= PMF_STRONG_THRESHOLD;
                  return (
                    <div key={entry.section} className="flex w-full flex-col gap-[7px]">
                      <div className="flex w-full items-center justify-between gap-[10px]">
                        <span className="flex-1 text-[13.5px] font-medium text-[#14161A]">
                          {entry.product}
                        </span>
                        <span className="flex shrink-0 items-center gap-[7px]">
                          <span
                            className="font-[family-name:var(--font-pulse-display)] text-[17px] font-semibold"
                            style={{
                              color:
                                entry.veryPct === null
                                  ? "#8E949C"
                                  : strong
                                    ? GREEN
                                    : AMBER,
                            }}
                          >
                            {entry.veryPct === null ? "—" : `${entry.veryPct}%`}
                          </span>
                          {entry.veryPct === null ? null : (
                            <span
                              className="rounded-[3px] px-[7px] py-[3px]"
                              style={{
                                backgroundColor: strong ? "#E8F2EE" : "#FBF1E2",
                              }}
                            >
                              <span
                                className="font-[family-name:var(--font-pulse-mono)] text-[9px] tracking-[0.5px]"
                                style={{ color: strong ? GREEN : AMBER }}
                              >
                                {strong ? "STRONG" : "WEAK"}
                              </span>
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex h-2 w-full overflow-hidden rounded-[2px] bg-[#E4E3DE]">
                        <span
                          className="h-2"
                          style={{
                            width: `${entry.veryPct ?? 0}%`,
                            backgroundColor: TONE_HEX[entry.tone],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="m-0 text-[11.5px]/[17px] text-[#8E949C]">
                Threshold line at {PMF_STRONG_THRESHOLD}% (Sean Ellis). Anything
                below it needs a drill-down before the readout goes out.
              </p>
            </Panel>

            <Panel
              accent={GREEN}
              title="Completion funnel"
              sub="Invite sent at meeting close · access by one-time code"
            >
              <div className="flex w-full flex-col gap-[10px]">
                {funnel.map((step) => (
                  <div key={step.label} className="flex w-full items-center gap-3">
                    <span className="w-[88px] shrink-0 text-[12.5px] text-[#5A6069]">
                      {step.label}
                    </span>
                    <span className="flex h-5 flex-1 overflow-hidden rounded-[2px] bg-[#E4E3DE]">
                      <span
                        className="h-5"
                        style={{
                          width: `${(step.value / funnelMax) * 100}%`,
                          backgroundColor: step.emphasis ? GREEN : INK,
                        }}
                      />
                    </span>
                    <span className="w-[26px] shrink-0 text-right font-[family-name:var(--font-pulse-mono)] text-[12px] text-[#14161A]">
                      {step.value}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>

        <div className="flex w-full flex-col gap-5 xl:flex-row">
          <div className="flex-1">
            <Panel
              accent="#C4122F"
              title="Pain-point leaderboard"
              sub={`Taxonomy selections on 6.3 · n=${painPointResponses}`}
            >
              {painPoints.length === 0 ? (
                <p className="m-0 text-[13px] text-[#8E949C]">
                  No pain points selected yet.
                </p>
              ) : (
                <div className="flex w-full flex-col gap-[11px]">
                  {painPoints.map((entry, position) => (
                    <div
                      key={entry.id}
                      className="flex w-full items-center gap-[14px]"
                    >
                      <span className="w-[42px] shrink-0 font-[family-name:var(--font-pulse-mono)] text-[11px] text-[#8E949C]">
                        {entry.id}
                      </span>
                      <span className="flex-1 text-[13px] text-[#14161A]">
                        {entry.label}
                      </span>
                      <span className="flex h-2 w-[220px] shrink-0 overflow-hidden bg-[#E4E3DE]">
                        <span
                          className="h-2"
                          style={{
                            width: `${(entry.count / painMax) * 100}%`,
                            backgroundColor: position === 0 ? "#C4122F" : INK,
                          }}
                        />
                      </span>
                      <span className="w-6 shrink-0 text-right font-[family-name:var(--font-pulse-mono)] text-[12px] text-[#14161A]">
                        {entry.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>

          <div className="flex w-full flex-col gap-5 xl:w-[380px] xl:shrink-0">
            <Panel
              accent={INK}
              title="Latest verbatims"
              sub="Shown by seat number · analyst review before any quote leaves"
            >
              {verbatims.length === 0 ? (
                <p className="m-0 text-[13px] text-[#8E949C]">
                  No free-text responses yet.
                </p>
              ) : (
                <div className="flex w-full flex-col gap-[11px]">
                  {verbatims.map((entry) => {
                    const laneHex =
                      entry.lane === "LIKED"
                        ? GREEN
                        : entry.lane === "GAP"
                          ? AMBER
                          : "#B4483C";
                    return (
                      <div
                        key={entry.id}
                        className="w-full overflow-hidden rounded-[3px] border-y border-r pl-[3px]"
                        style={{ backgroundColor: laneHex, borderColor: RULE }}
                      >
                        <div className="flex w-full flex-col gap-3 bg-[#F4F3F0] px-4 py-[15px]">
                          <span
                            className="font-[family-name:var(--font-pulse-mono)] text-[10px] tracking-[0.8px]"
                            style={{ color: laneHex }}
                          >
                            {entry.lane}
                          </span>
                          <p className="m-0 text-[13px]/[20px] text-[#14161A]">
                            &ldquo;{entry.quote}&rdquo;
                          </p>
                          <p className="m-0 font-[family-name:var(--font-pulse-mono)] text-[10px] text-[#8E949C]">
                            {entry.member} · {entry.code}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}

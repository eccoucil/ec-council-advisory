import {
  PAIN_TAXONOMY,
  pulseSections,
  type PulseQuestionSeed,
  pulseQuestions,
} from "@/lib/pulse-instrument";
import {
  PULSE_ROSTER_SIZE,
  PULSE_SESSION_DATE,
  PULSE_WINDOW_CLOSES,
  pulseWindowClosedAt,
} from "@/lib/pulse-window";
import { prisma } from "@/lib/prisma";

/** Sections that carry a product or framework verdict, in agenda order. */
const AGENDA_SECTIONS = [1, 2, 3, 4, 5];
const PRODUCT_SECTIONS = [2, 3, 4, 5];

/** Sean Ellis threshold: at or above this, PMF reads as a strong signal. */
export const PMF_STRONG_THRESHOLD = 40;
export const RESPONSE_RATE_TARGET = 70;
export const CONSENSUS_THRESHOLD = 66;

export type Tone = "crimson" | "blue" | "gold" | "teal" | "violet" | "ink";

export type AgendaMetric = {
  section: number;
  ordinal: string;
  title: string;
  tone: Tone;
  /** Mean of the section's x.1 Likert rescaled to 0–100, or null when unanswered. */
  index: number | null;
  consensusYesPct: number | null;
  /** Counts for Likert 1..5, index 0 holds "strongly disagree". */
  distribution: number[];
  responses: number;
};

export type PmfMetric = {
  section: number;
  product: string;
  tone: Tone;
  veryPct: number | null;
  responses: number;
};

export type FunnelStep = {
  label: string;
  value: number;
  emphasis?: boolean;
};

export type PainPoint = {
  id: string;
  label: string;
  count: number;
};

export type Verbatim = {
  id: string;
  lane: "LIKED" | "DISLIKED" | "GAP";
  quote: string;
  member: string;
  code: string;
  at: Date;
};

export type PulseDashboard = {
  sessionLabel: string;
  /** Members on the roster right now. Every rate is computed against this. */
  seated: number;
  /** Planned roster size, shown only as the target to fill against. */
  target: number;
  submitted: number;
  responseRatePct: number;
  lastResponseAt: Date | null;
  consensusYesPct: number | null;
  consensusResponses: number;
  meanAlignmentIndex: number | null;
  alignmentItems: AgendaMetric[];
  followUps: number;
  pmf: PmfMetric[];
  funnel: FunnelStep[];
  painPoints: PainPoint[];
  painPointResponses: number;
  verbatims: Verbatim[];
  windowClosesAt: Date;
  generatedAt: Date;
};

type AnswerRow = {
  memberId: number;
  questionId: string;
  valueJson: unknown;
  commentText: string | null;
  updatedAt: Date;
};

const questionById = new Map<string, PulseQuestionSeed>(
  pulseQuestions.map((question) => [question.id, question]),
);

const questionByCode = new Map<string, PulseQuestionSeed>(
  pulseQuestions.map((question) => [question.code, question]),
);

function pct(part: number, whole: number) {
  return whole === 0 ? null : Math.round((part / whole) * 100);
}

function answersFor(rows: AnswerRow[], code: string) {
  const question = questionByCode.get(code);
  return question ? rows.filter((row) => row.questionId === question.id) : [];
}

function yesPct(rows: AnswerRow[], code: string) {
  const answered = answersFor(rows, code).filter(
    (row) => row.valueJson === "YES" || row.valueJson === "NO",
  );
  return {
    pct: pct(
      answered.filter((row) => row.valueJson === "YES").length,
      answered.length,
    ),
    responses: answered.length,
  };
}

function likertMetrics(rows: AnswerRow[], code: string) {
  const distribution = [0, 0, 0, 0, 0];
  let total = 0;
  let responses = 0;

  for (const row of answersFor(rows, code)) {
    const value = row.valueJson;
    if (typeof value !== "number" || value < 1 || value > 5) {
      continue;
    }
    distribution[value - 1] += 1;
    total += value;
    responses += 1;
  }

  // Likert 1–5 rescaled so 1 reads as 0 and 5 as 100.
  const index =
    responses === 0 ? null : Math.round(((total / responses - 1) / 4) * 100);

  return { distribution, index, responses };
}

function toneFor(section: number): Tone {
  return pulseSections.find((meta) => meta.id === section)?.tone ?? "ink";
}

function titleFor(section: number) {
  return (
    pulseSections.find((meta) => meta.id === section)?.title ??
    `Section ${section}`
  );
}

function collectVerbatims(rows: AnswerRow[], memberLabels: Map<number, string>) {
  const verbatims: Verbatim[] = [];

  for (const row of rows) {
    const question = questionById.get(row.questionId);
    if (!question) {
      continue;
    }

    const member = memberLabels.get(row.memberId) ?? "Member";

    if (question.type === "DUAL_TEXT" && isDualText(row.valueJson)) {
      const { liked, disliked } = row.valueJson;
      if (liked.trim()) {
        verbatims.push({
          id: `${row.questionId}-${row.memberId}-liked`,
          lane: "LIKED",
          quote: liked.trim(),
          member,
          code: question.code,
          at: row.updatedAt,
        });
      }
      if (disliked.trim()) {
        verbatims.push({
          id: `${row.questionId}-${row.memberId}-disliked`,
          lane: "DISLIKED",
          quote: disliked.trim(),
          member,
          code: question.code,
          at: row.updatedAt,
        });
      }
      continue;
    }

    // 6.4 asks what today's solutions miss, so it reads as a gap.
    if (question.code === "6.4" && typeof row.valueJson === "string") {
      const quote = row.valueJson.trim();
      if (quote) {
        verbatims.push({
          id: `${row.questionId}-${row.memberId}`,
          lane: "GAP",
          quote,
          member,
          code: question.code,
          at: row.updatedAt,
        });
      }
    }
  }

  return verbatims.sort((a, b) => b.at.getTime() - a.at.getTime());
}

function isDualText(value: unknown): value is { liked: string; disliked: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "liked" in value &&
    "disliked" in value &&
    typeof (value as { liked: unknown }).liked === "string" &&
    typeof (value as { disliked: unknown }).disliked === "string"
  );
}

export async function loadPulseDashboard(): Promise<PulseDashboard> {
  const [rawAnswers, submissions, members, requestedAccess] = await Promise.all([
    prisma.pulseAnswer.findMany({
      select: {
        memberId: true,
        questionId: true,
        valueJson: true,
        commentText: true,
        updatedAt: true,
      },
    }),
    prisma.pulseSubmission.findMany({ select: { submittedAt: true } }),
    prisma.advisoryBoardMember.findMany({
      where: { role: "MEMBER" },
      select: { id: true },
      orderBy: { name: "asc" },
    }),
    prisma.otpChallenge.findMany({
      select: { memberId: true },
      distinct: ["memberId"],
    }),
  ]);

  const rows = rawAnswers as AnswerRow[];

  // Verbatims are shown to analysts by seat number, never by name.
  const memberLabels = new Map(
    members.map((member, index) => [
      member.id,
      `Member ${String(index + 1).padStart(2, "0")}`,
    ]),
  );

  const consensus = yesPct(rows, "6.2");
  const followUps = answersFor(rows, "6.5").filter(
    (row) => row.valueJson === "YES",
  ).length;

  const alignmentItems: AgendaMetric[] = AGENDA_SECTIONS.map(
    (section, position) => {
      const likert = likertMetrics(rows, `${section}.1`);
      return {
        section,
        ordinal: String(position + 1).padStart(2, "0"),
        title: titleFor(section),
        tone: toneFor(section),
        index: likert.index,
        consensusYesPct: yesPct(rows, `${section}.2`).pct,
        distribution: likert.distribution,
        responses: likert.responses,
      };
    },
  );

  const scored = alignmentItems.filter((item) => item.index !== null);
  const meanAlignmentIndex =
    scored.length === 0
      ? null
      : Math.round(
          scored.reduce((total, item) => total + (item.index ?? 0), 0) /
            scored.length,
        );

  const pmf: PmfMetric[] = PRODUCT_SECTIONS.map((section) => {
    const answered = answersFor(rows, `${section}.3`).filter(
      (row) =>
        row.valueJson === "VERY" ||
        row.valueJson === "SOMEWHAT" ||
        row.valueJson === "NOT",
    );
    return {
      section,
      product: titleFor(section),
      tone: toneFor(section),
      veryPct: pct(
        answered.filter((row) => row.valueJson === "VERY").length,
        answered.length,
      ),
      responses: answered.length,
    };
  });

  const painCounts = new Map<string, number>();
  const painResponders = new Set<number>();
  for (const row of answersFor(rows, "6.3")) {
    if (!Array.isArray(row.valueJson)) {
      continue;
    }
    painResponders.add(row.memberId);
    for (const id of row.valueJson) {
      if (typeof id === "string") {
        painCounts.set(id, (painCounts.get(id) ?? 0) + 1);
      }
    }
  }

  const painPoints = PAIN_TAXONOMY.map((entry) => ({
    id: entry.id,
    label: entry.label,
    count: painCounts.get(entry.id) ?? 0,
  }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id))
    .slice(0, 6);

  const started = new Set(rows.map((row) => row.memberId)).size;
  const lastResponseAt = rows.reduce<Date | null>((latest, row) => {
    return !latest || row.updatedAt > latest ? row.updatedAt : latest;
  }, null);

  return {
    sessionLabel: `Board Pulse — ${new Intl.DateTimeFormat("en-GB", {
      timeZone: "UTC",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(PULSE_SESSION_DATE)}`,
    seated: members.length,
    target: PULSE_ROSTER_SIZE,
    submitted: submissions.length,
    responseRatePct: pct(submissions.length, members.length) ?? 0,
    lastResponseAt,
    consensusYesPct: consensus.pct,
    consensusResponses: consensus.responses,
    meanAlignmentIndex,
    alignmentItems,
    followUps,
    pmf,
    funnel: [
      { label: "On the roster", value: members.length },
      { label: "Requested access", value: requestedAccess.length },
      { label: "Started", value: started },
      { label: "Submitted", value: submissions.length, emphasis: true },
    ],
    painPoints,
    painPointResponses: painResponders.size,
    verbatims: collectVerbatims(rows, memberLabels).slice(0, 4),
    windowClosesAt: PULSE_WINDOW_CLOSES,
    generatedAt: new Date(),
  };
}

/* ------------------------------------------------------------------ *
 * Agenda item drill-down
 * ------------------------------------------------------------------ */

const ORDINAL_MARKS = ["①", "②", "③", "④", "⑤"];

/** Likert 1..5, warm-to-cool as agreement rises. */
export const LIKERT_HEX = [
  "#B4483C",
  "#CE8A5C",
  "#C9C6BE",
  "#6FA48F",
  "#0F6E5C",
];

const YESNO_HEX = { yes: "#0F6E5C", no: "#C9C6BE" };
const PMF_HEX = { VERY: "#0F6E5C", SOMEWHAT: "#6FA48F", NOT: "#C9C6BE" };

export type Segment = {
  label: string;
  count: number;
  hex: string;
};

export type QuestionBreakdown = {
  code: string;
  prompt: string;
  kind: string;
  stat: string;
  segments: Segment[];
  responses: number;
};

export type SectionKpi = {
  label: string;
  value: string;
  sub: string;
  status: "good" | "warn" | "neutral";
};

export type WeaknessOption = {
  id: string;
  label: string;
  count: number;
};

export type LaneKey = "liked" | "disliked" | "gaps";

export type SectionVerbatim = {
  id: string;
  quote: string;
  member: string;
  code: string;
};

export type AgendaNeighbour = { section: number; title: string };

export type AgendaSection = {
  section: number;
  mark: string;
  title: string;
  tone: Tone;
  anchors: string[];
  responses: number;
  invited: number;
  questionCount: number;
  lastUpdatedAt: Date | null;
  kpis: SectionKpi[];
  questions: QuestionBreakdown[];
  weaknesses: WeaknessOption[];
  weaknessResponses: number;
  lanes: Record<LaneKey, SectionVerbatim[]>;
  laneTotals: Record<LaneKey, number>;
  decision: string;
  previous: AgendaNeighbour | null;
  next: AgendaNeighbour | null;
  generatedAt: Date;
};

export const AGENDA_ITEMS = AGENDA_SECTIONS.map((section, position) => ({
  section,
  mark: ORDINAL_MARKS[position],
  title: titleFor(section),
  tone: toneFor(section),
}));

export function isAgendaSection(value: number) {
  return AGENDA_SECTIONS.includes(value);
}

function mean(values: number[]) {
  return values.length === 0
    ? null
    : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function likertBreakdown(rows: AnswerRow[], question: PulseQuestionSeed) {
  const { distribution, responses } = likertMetrics(rows, question.code);
  const values = distribution.flatMap((count, level) =>
    Array.from({ length: count }, () => level + 1),
  );
  const average = mean(values);

  return {
    code: question.code,
    prompt: question.prompt,
    kind: "Likert 1–5",
    stat: average === null ? "no responses" : `mean ${average.toFixed(2)} / 5`,
    segments: distribution.map((count, level) => ({
      label:
        level === 3 ? "4 · agree" : level === 4 ? "5 · strongly" : String(level + 1),
      count,
      hex: LIKERT_HEX[level],
    })),
    responses,
  };
}

function yesNoBreakdown(rows: AnswerRow[], question: PulseQuestionSeed) {
  const answered = answersFor(rows, question.code).filter(
    (row) => row.valueJson === "YES" || row.valueJson === "NO",
  );
  const yes = answered.filter((row) => row.valueJson === "YES").length;
  const no = answered.length - yes;

  return {
    code: question.code,
    prompt: question.prompt,
    kind: "Yes / No",
    stat:
      answered.length === 0 ? "no responses" : `${pct(yes, answered.length)}% Yes`,
    segments: [
      { label: `Yes · ${yes}`, count: yes, hex: YESNO_HEX.yes },
      { label: `No · ${no}`, count: no, hex: YESNO_HEX.no },
    ],
    responses: answered.length,
  };
}

function pmfBreakdown(rows: AnswerRow[], question: PulseQuestionSeed) {
  const answered = answersFor(rows, question.code).filter(
    (row) =>
      row.valueJson === "VERY" ||
      row.valueJson === "SOMEWHAT" ||
      row.valueJson === "NOT",
  );
  const count = (key: keyof typeof PMF_HEX) =>
    answered.filter((row) => row.valueJson === key).length;

  return {
    code: question.code,
    prompt: question.prompt,
    kind: "Sean Ellis",
    stat:
      answered.length === 0
        ? "no responses"
        : `PMF ${pct(count("VERY"), answered.length)}%`,
    segments: [
      { label: `Very · ${count("VERY")}`, count: count("VERY"), hex: PMF_HEX.VERY },
      {
        label: `Somewhat · ${count("SOMEWHAT")}`,
        count: count("SOMEWHAT"),
        hex: PMF_HEX.SOMEWHAT,
      },
      { label: `Not · ${count("NOT")}`, count: count("NOT"), hex: PMF_HEX.NOT },
    ],
    responses: answered.length,
  };
}

function kpiLabel(question: PulseQuestionSeed, isProduct: boolean) {
  if (question.type === "PMF") {
    return `PMF SCORE (${question.code})`;
  }
  if (isProduct && question.code.endsWith(".2")) {
    return `CONSENSUS (${question.code})`;
  }
  if (isProduct && question.code.endsWith(".4")) {
    return `ADVOCACY (${question.code})`;
  }
  if (question.code.endsWith(".2")) {
    return `CONSENSUS (${question.code})`;
  }
  return `YES RATE (${question.code})`;
}

function anchorsFor(section: number) {
  const anchors = pulseSections.find((meta) => meta.id === section)?.anchors;
  return (anchors ?? []).map((anchor) =>
    anchor.code === "FAM" ? anchor.label : `${anchor.code} ${anchor.label}`,
  );
}

function decisionSignal(
  title: string,
  consensus: number | null,
  pmfScore: number | null,
  topWeakness: WeaknessOption | undefined,
  responses: number,
  invited: number,
) {
  const parts: string[] = [];

  if (consensus === null) {
    parts.push(`${title} has no verdict yet — the consensus question is unanswered.`);
  } else if (consensus >= CONSENSUS_THRESHOLD && pmfScore === null) {
    parts.push(
      `${title} clears the consensus bar at ${consensus}% (threshold ≥${CONSENSUS_THRESHOLD}%).`,
    );
  } else if (consensus >= CONSENSUS_THRESHOLD && pmfScore !== null) {
    parts.push(
      pmfScore >= PMF_STRONG_THRESHOLD
        ? `${title} clears both thresholds — ${consensus}% consensus and ${pmfScore}% PMF.`
        : `${title} carries the room on direction (${consensus}% consensus) but sits under the PMF bar at ${pmfScore}%.`,
    );
  } else {
    parts.push(
      `${title} has not cleared the consensus bar — ${consensus}% against a ≥${CONSENSUS_THRESHOLD}% threshold.`,
    );
  }

  if (topWeakness) {
    parts.push(
      `The weakness signal points at ${topWeakness.label.toLowerCase()} (${topWeakness.count} selection${topWeakness.count === 1 ? "" : "s"}).`,
    );
  }

  parts.push(`Read on ${responses} of ${invited} responses.`);
  return parts.join(" ");
}

export async function loadAgendaSection(
  section: number,
): Promise<AgendaSection | null> {
  if (!isAgendaSection(section)) {
    return null;
  }

  const sectionQuestions = pulseQuestions.filter(
    (question) => question.section === section,
  );
  const questionIds = new Set(sectionQuestions.map((question) => question.id));

  const [rawAnswers, members] = await Promise.all([
    prisma.pulseAnswer.findMany({
      where: { questionId: { in: [...questionIds] } },
      select: {
        memberId: true,
        questionId: true,
        valueJson: true,
        commentText: true,
        updatedAt: true,
      },
    }),
    prisma.advisoryBoardMember.findMany({
      where: { role: "MEMBER" },
      select: { id: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const rows = rawAnswers as AnswerRow[];
  const memberLabels = new Map(
    members.map((member, index) => [
      member.id,
      `Member ${String(index + 1).padStart(2, "0")}`,
    ]),
  );

  const isProduct = PRODUCT_SECTIONS.includes(section);
  const scored = sectionQuestions.filter((question) =>
    ["LIKERT", "YESNO", "PMF"].includes(question.type),
  );

  const questions: QuestionBreakdown[] = scored.map((question) => {
    if (question.type === "LIKERT") {
      return likertBreakdown(rows, question);
    }
    if (question.type === "PMF") {
      return pmfBreakdown(rows, question);
    }
    return yesNoBreakdown(rows, question);
  });

  // Rank this item's alignment index against the other agenda items.
  const allIndexes = await Promise.all(
    AGENDA_SECTIONS.map(async (id) => ({
      section: id,
      index: likertMetrics(
        id === section
          ? rows
          : ((await prisma.pulseAnswer.findMany({
              where: {
                questionId: questionByCode.get(`${id}.1`)?.id ?? "__none__",
              },
              select: {
                memberId: true,
                questionId: true,
                valueJson: true,
                commentText: true,
                updatedAt: true,
              },
            })) as AnswerRow[]),
        `${id}.1`,
      ).index,
    })),
  );

  const ownIndex = allIndexes.find((entry) => entry.section === section)?.index ?? null;
  const ranked = allIndexes
    .filter((entry) => entry.index !== null)
    .sort((a, b) => (b.index ?? 0) - (a.index ?? 0));
  const rank = ranked.findIndex((entry) => entry.section === section) + 1;

  const likert = likertMetrics(rows, `${section}.1`);
  const likertMean = mean(
    likert.distribution.flatMap((count, level) =>
      Array.from({ length: count }, () => level + 1),
    ),
  );

  const kpis: SectionKpi[] = [
    {
      label: "ALIGNMENT INDEX",
      value: ownIndex === null ? "—" : String(ownIndex),
      sub:
        likertMean === null
          ? `${section}.1 · no responses`
          : `${section}.1 mean ${likertMean.toFixed(2)}/5 · rank ${rank} of ${ranked.length}`,
      status: "neutral",
    },
  ];

  for (const question of scored.slice(1, 4)) {
    const breakdown = questions.find((entry) => entry.code === question.code);
    if (!breakdown) {
      continue;
    }

    if (question.type === "PMF") {
      const very = breakdown.segments[0]?.count ?? 0;
      const score = pct(very, breakdown.responses);
      kpis.push({
        label: kpiLabel(question, isProduct),
        value: score === null ? "—" : `${score}%`,
        sub: `very disappointed · ≥${PMF_STRONG_THRESHOLD}% strong`,
        status:
          score === null ? "neutral" : score >= PMF_STRONG_THRESHOLD ? "good" : "warn",
      });
      continue;
    }

    const yes = breakdown.segments[0]?.count ?? 0;
    const rate = pct(yes, breakdown.responses);
    kpis.push({
      label: kpiLabel(question, isProduct),
      value: rate === null ? "—" : `${rate}%`,
      sub:
        rate === null
          ? "no responses"
          : `Yes · ${yes} of ${breakdown.responses} · threshold ≥${CONSENSUS_THRESHOLD}%`,
      status:
        rate === null ? "neutral" : rate >= CONSENSUS_THRESHOLD ? "good" : "warn",
    });
  }

  const gapQuestion = sectionQuestions.find(
    (question) => question.type === "MULTI",
  );
  const weaknessCounts = new Map<string, number>();
  const weaknessResponders = new Set<number>();
  if (gapQuestion) {
    for (const row of answersFor(rows, gapQuestion.code)) {
      if (!Array.isArray(row.valueJson)) {
        continue;
      }
      weaknessResponders.add(row.memberId);
      for (const id of row.valueJson) {
        if (typeof id === "string") {
          weaknessCounts.set(id, (weaknessCounts.get(id) ?? 0) + 1);
        }
      }
    }
  }

  const weaknesses: WeaknessOption[] = (gapQuestion?.options ?? [])
    .map((option) => ({
      id: option.id,
      label: option.label,
      count: weaknessCounts.get(option.id) ?? 0,
    }))
    .sort((a, b) => b.count - a.count);

  const lanes: Record<LaneKey, SectionVerbatim[]> = {
    liked: [],
    disliked: [],
    gaps: [],
  };

  for (const row of rows) {
    const question = questionById.get(row.questionId);
    if (!question) {
      continue;
    }
    const member = memberLabels.get(row.memberId) ?? "Member";

    if (question.type === "DUAL_TEXT" && isDualText(row.valueJson)) {
      if (row.valueJson.liked.trim()) {
        lanes.liked.push({
          id: `${row.questionId}-${row.memberId}-liked`,
          quote: row.valueJson.liked.trim(),
          member,
          code: question.code,
        });
      }
      if (row.valueJson.disliked.trim()) {
        lanes.disliked.push({
          id: `${row.questionId}-${row.memberId}-disliked`,
          quote: row.valueJson.disliked.trim(),
          member,
          code: question.code,
        });
      }
    }

    if (question.type === "TEXT" && typeof row.valueJson === "string") {
      const quote = row.valueJson.trim();
      if (quote) {
        lanes.gaps.push({
          id: `${row.questionId}-${row.memberId}`,
          quote,
          member,
          code: question.code,
        });
      }
    }

    // Comments left on a scored question read as gaps too.
    if (row.commentText?.trim()) {
      lanes.gaps.push({
        id: `${row.questionId}-${row.memberId}-comment`,
        quote: row.commentText.trim(),
        member,
        code: question.code,
      });
    }
  }

  const position = AGENDA_SECTIONS.indexOf(section);
  const neighbour = (offset: number): AgendaNeighbour | null => {
    const id = AGENDA_SECTIONS[position + offset];
    return id === undefined ? null : { section: id, title: titleFor(id) };
  };

  const consensusBreakdown = questions.find(
    (entry) => entry.code === `${section}.2`,
  );
  const consensusRate = consensusBreakdown
    ? pct(consensusBreakdown.segments[0]?.count ?? 0, consensusBreakdown.responses)
    : null;
  const pmfBreakdownEntry = questions.find(
    (entry) => entry.kind === "Sean Ellis",
  );
  const pmfScore = pmfBreakdownEntry
    ? pct(pmfBreakdownEntry.segments[0]?.count ?? 0, pmfBreakdownEntry.responses)
    : null;

  const responders = new Set(rows.map((row) => row.memberId));

  return {
    section,
    mark: ORDINAL_MARKS[position],
    title: titleFor(section),
    tone: toneFor(section),
    anchors: anchorsFor(section),
    responses: responders.size,
    invited: PULSE_ROSTER_SIZE,
    questionCount: sectionQuestions.length,
    lastUpdatedAt: rows.reduce<Date | null>(
      (latest, row) => (!latest || row.updatedAt > latest ? row.updatedAt : latest),
      null,
    ),
    kpis,
    questions,
    weaknesses,
    weaknessResponses: weaknessResponders.size,
    lanes,
    laneTotals: {
      liked: lanes.liked.length,
      disliked: lanes.disliked.length,
      gaps: lanes.gaps.length,
    },
    decision: decisionSignal(
      titleFor(section),
      consensusRate,
      pmfScore,
      weaknesses.find((entry) => entry.count > 0),
      responders.size,
      PULSE_ROSTER_SIZE,
    ),
    previous: neighbour(-1),
    next: neighbour(1),
    generatedAt: new Date(),
  };
}

/* ------------------------------------------------------------------ *
 * Roster & invites
 * ------------------------------------------------------------------ */

export type RosterStatus =
  | "submitted"
  | "in_progress"
  | "not_started"
  | "never_opened";

export type RosterActivity = {
  label: string;
  at: Date | null;
};

export type RosterMember = {
  id: number;
  name: string;
  initials: string;
  title: string;
  email: string | null;
  status: RosterStatus;
  answered: number;
  activity: RosterActivity;
};

export type RosterView = {
  seated: number;
  target: number;
  totalQuestions: number;
  counts: Record<RosterStatus, number>;
  withoutEmail: number;
  /** Reachable by email and yet to submit — the reminder audience. */
  pending: number;
  members: RosterMember[];
  windowClosesAt: Date;
  windowClosedAt: Date | null;
  generatedAt: Date;
};

export const ROSTER_STATUS_ORDER: RosterStatus[] = [
  "submitted",
  "in_progress",
  "not_started",
  "never_opened",
];

function initialsFor(name: string) {
  const parts = name
    .replace(/^(Dr|Dr\.|Mr|Ms|Mrs)\.?\s+/i, "")
    .trim()
    .split(/\s+/)
    .filter((part) => /[A-Za-z]/.test(part))
    .slice(0, 2);
  return parts.map((part) => part[0]!.toUpperCase()).join("") || "??";
}

export function formatMytShort(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kuala_Lumpur",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${read("day")} ${read("month")} · ${read("hour")}:${read("minute")}`;
}

export async function loadRoster(): Promise<RosterView> {
  const [members, answerStats, submissions, challenges, windowClosedAt] =
    await Promise.all([
    prisma.advisoryBoardMember.findMany({
      where: { role: "MEMBER" },
      select: { id: true, name: true, title: true, email: true },
      orderBy: { name: "asc" },
    }),
    prisma.pulseAnswer.groupBy({
      by: ["memberId"],
      _count: { _all: true },
      _max: { updatedAt: true },
    }),
    prisma.pulseSubmission.findMany({
      select: { memberId: true, submittedAt: true },
    }),
      prisma.otpChallenge.groupBy({
        by: ["memberId"],
        _max: { createdAt: true },
      }),
      pulseWindowClosedAt(),
    ]);

  const answersBy = new Map(
    answerStats.map((row) => [
      row.memberId,
      { count: row._count._all, at: row._max.updatedAt },
    ]),
  );
  const submittedBy = new Map(
    submissions.map((row) => [row.memberId, row.submittedAt]),
  );
  const invitedBy = new Map(
    challenges.map((row) => [row.memberId, row._max.createdAt]),
  );

  const counts: Record<RosterStatus, number> = {
    submitted: 0,
    in_progress: 0,
    not_started: 0,
    never_opened: 0,
  };

  const rows: RosterMember[] = members.map((member) => {
    const answers = answersBy.get(member.id);
    const submittedAt = submittedBy.get(member.id);
    const invitedAt = invitedBy.get(member.id);
    const answered = answers?.count ?? 0;

    let status: RosterStatus;
    let activity: RosterActivity;

    if (submittedAt) {
      status = "submitted";
      activity = { label: "submitted", at: submittedAt };
    } else if (answered > 0) {
      status = "in_progress";
      activity = { label: "last answer", at: answers?.at ?? null };
    } else if (invitedAt) {
      status = "not_started";
      activity = { label: "code sent", at: invitedAt };
    } else {
      status = "never_opened";
      activity = {
        label: member.email ? "no code requested" : "no email on file",
        at: null,
      };
    }

    counts[status] += 1;

    return {
      id: member.id,
      name: member.name,
      initials: initialsFor(member.name),
      title: member.title,
      email: member.email,
      status,
      answered,
      activity,
    };
  });

  return {
    seated: members.length,
    target: PULSE_ROSTER_SIZE,
    totalQuestions: pulseQuestions.length,
    counts,
    withoutEmail: members.filter((member) => !member.email).length,
    pending: rows.filter(
      (row) => row.email !== null && row.status !== "submitted",
    ).length,
    members: rows,
    windowClosesAt: PULSE_WINDOW_CLOSES,
    windowClosedAt,
    generatedAt: new Date(),
  };
}

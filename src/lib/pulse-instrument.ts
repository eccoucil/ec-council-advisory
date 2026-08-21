export const PAIN_TAXONOMY = [
  { id: "PP-01", label: "No inventory of AI systems / shadow AI usage unknown" },
  { id: "PP-02", label: "No named ownership or accountability per AI system" },
  { id: "PP-03", label: "Mapping one control set to many regulations" },
  { id: "PP-04", label: "Producing audit-grade evidence without manual effort" },
  { id: "PP-05", label: "Runtime visibility: drift, abuse, agent actions" },
  { id: "PP-06", label: "AI-specific incident detection & response" },
  { id: "PP-07", label: "Employee misuse / lack of AI awareness" },
  { id: "PP-08", label: "Third-party / vendor AI risk & shared responsibility" },
  { id: "PP-09", label: "Data governance for AI: lineage, entitlement, retention" },
  { id: "PP-10", label: "Skills gap: practitioners who can implement AI governance" },
  { id: "PP-11", label: "Board reporting: translating AI risk for directors" },
  { id: "PP-12", label: "Cost/justification: funding governance before an incident" },
  { id: "PP-13", label: "Agentic-specific risk (tool access, multi-agent, autonomy)" },
  { id: "PP-14", label: "Other" },
] as const;

export const GAP_OPTIONS = [
  { id: "coverage", label: "Coverage / depth" },
  { id: "integration", label: "Integration with existing stack" },
  { id: "evidence", label: "Evidence & reporting" },
  { id: "pricing", label: "Pricing-model clarity" },
  { id: "deployment", label: "Deployment model" },
  { id: "regulatory", label: "Regulatory defensibility" },
  { id: "differentiation", label: "Differentiation vs incumbents" },
  { id: "nothing", label: "Nothing major" },
] as const;

export const LIKERT_LABELS = [
  "Strongly disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly agree",
] as const;

export const PMF_OPTIONS = [
  { id: "VERY", label: "Very disappointed" },
  { id: "SOMEWHAT", label: "Somewhat disappointed" },
  { id: "NOT", label: "Not disappointed — it isn't that useful" },
] as const;

export type PulseQuestionType =
  | "LIKERT"
  | "YESNO"
  | "PMF"
  | "MULTI"
  | "TEXT"
  | "DUAL_TEXT";

export type PulseOption = { id: string; label: string };

export type PulseQuestionSeed = {
  id: string;
  section: number;
  code: string;
  sortOrder: number;
  type: PulseQuestionType;
  prompt: string;
  required: boolean;
  maxSelect?: number;
  options?: PulseOption[];
};

export type PulseSectionMeta = {
  id: number;
  title: string;
  railTitle: string;
  eyebrow: string;
  description: string;
  questionLabel: string;
  optional?: boolean;
  requiredSection?: boolean;
  tone: "crimson" | "blue" | "gold" | "teal" | "violet" | "ink";
  anchors?: Array<{ code: string; label: string }>;
};

export const pulseSections: PulseSectionMeta[] = [
  {
    id: 0,
    title: "Pre-read pulse",
    railTitle: "Pre-read pulse",
    eyebrow: "Optional · before the session",
    description:
      "Two questions to capture what is already acute in the market. Skip if you are starting after the demos.",
    questionLabel: "2 questions · optional",
    optional: true,
    tone: "teal",
  },
  {
    id: 1,
    title: "ADG V1 → ADG V2 Scale Up",
    railTitle: "ADG V1 → ADG V2 Scale Up",
    eyebrow: "Agenda item ① · Framework",
    description:
      "From 12 minimum controls to 12 control families, with the obligation and clauses highlighted per AI use case. Score the direction, not a product.",
    questionLabel: "5 questions",
    tone: "crimson",
  },
  {
    id: 2,
    title: "ComplyX",
    railTitle: "ComplyX",
    eyebrow: "Agenda item ② · Demo 1 of 4",
    description:
      "Walks an organisation through AI compliance end to end. Score it against the market you actually see — not the demo you just watched.",
    questionLabel: "6 questions",
    tone: "blue",
    anchors: [
      { code: "MC-02", label: "Risk Classification" },
      { code: "FAM", label: "Regulatory Mapping" },
      { code: "FAM", label: "Assurance & Audit" },
    ],
  },
  {
    id: 3,
    title: "AwareX",
    railTitle: "AwareX",
    eyebrow: "Agenda item ③ · Demo 2 of 4",
    description:
      "End-user awareness, phishing and social-engineering simulation and training. Score the market problem, not the slide.",
    questionLabel: "6 questions",
    tone: "gold",
    anchors: [{ code: "LENS", label: "People · human-risk controls" }],
  },
  {
    id: 4,
    title: "AI SOC",
    railTitle: "AI SOC",
    eyebrow: "Agenda item ④ · Demo 3 of 4",
    description:
      "An AI-based Security Operations Center. Score whether this is a real operating gap you see.",
    questionLabel: "6 questions",
    tone: "teal",
    anchors: [
      { code: "MC-08", label: "Runtime Monitoring" },
      { code: "MC-09", label: "Incident Response" },
    ],
  },
  {
    id: 5,
    title: "Shadow AI",
    railTitle: "Shadow AI",
    eyebrow: "Agenda item ⑤ · Demo 4 of 4",
    description:
      "Endpoint discovery of AI tools in use. Agents they cannot list, owned by people they cannot name.",
    questionLabel: "6 questions",
    tone: "violet",
    anchors: [{ code: "MC-01", label: "AI System Inventory" }],
  },
  {
    id: 6,
    title: "Cross-portfolio",
    railTitle: "Cross-portfolio",
    eyebrow: "Section 6 · required sign-off",
    description:
      "Taken together: the Protocol plus the four products. This section is required to count as a complete submission.",
    questionLabel: "5 questions · required",
    requiredSection: true,
    tone: "ink",
  },
];

function productBlock(section: number, prefix: string): PulseQuestionSeed[] {
  return [
    {
      id: `${prefix}-1`,
      section,
      code: `${section}.1`,
      sortOrder: 1,
      type: "LIKERT",
      prompt:
        "The demo convinced me this product solves a real, common problem.",
      required: true,
    },
    {
      id: `${prefix}-2`,
      section,
      code: `${section}.2`,
      sortOrder: 2,
      type: "YESNO",
      prompt:
        "Does this address a pain point you see in the market, or face internally in general terms?",
      required: true,
    },
    {
      id: `${prefix}-3`,
      section,
      code: `${section}.3`,
      sortOrder: 3,
      type: "PMF",
      prompt:
        "If this product were not available to the market, how would you feel?",
      required: true,
      options: [...PMF_OPTIONS],
    },
    {
      id: `${prefix}-4`,
      section,
      code: `${section}.4`,
      sortOrder: 4,
      type: "YESNO",
      prompt: "Would you recommend this approach to a peer CISO or CAIO?",
      required: true,
    },
    {
      id: `${prefix}-5`,
      section,
      code: `${section}.5`,
      sortOrder: 5,
      type: "MULTI",
      prompt: "What is missing or weakest?",
      required: false,
      options: [...GAP_OPTIONS],
    },
    {
      id: `${prefix}-6`,
      section,
      code: `${section}.6`,
      sortOrder: 6,
      type: "DUAL_TEXT",
      prompt: "One thing you liked. One thing you disliked.",
      required: false,
    },
  ];
}

export const pulseQuestions: PulseQuestionSeed[] = [
  {
    id: "s0-1",
    section: 0,
    code: "0.1",
    sortOrder: 1,
    type: "MULTI",
    prompt:
      "Which of these AI-governance challenges is most acute in the market right now?",
    required: false,
    maxSelect: 3,
    options: [...PAIN_TAXONOMY],
  },
  {
    id: "s0-2",
    section: 0,
    code: "0.2",
    sortOrder: 2,
    type: "YESNO",
    prompt:
      'Is "unknown/unowned AI in production" a top-3 risk in organisations you observe?',
    required: false,
  },
  {
    id: "s1-1",
    section: 1,
    code: "1.1",
    sortOrder: 1,
    type: "LIKERT",
    prompt:
      "The evolution from 12 minimum controls to 12 control families, highlighting the obligation and clauses per AI use case, is the right direction for ADG.",
    required: true,
  },
  {
    id: "s1-2",
    section: 1,
    code: "1.2",
    sortOrder: 2,
    type: "YESNO",
    prompt:
      "Does extending crosswalk reach towards 50+ standards, highlighting the obligation and clauses, materially reduce compliance burden for adopters?",
    required: true,
  },
  {
    id: "s1-3",
    section: 1,
    code: "1.3",
    sortOrder: 3,
    type: "YESNO",
    prompt:
      "Does ADG V2's agentic coverage (MCP / ACP / A2A, Intent Classification, runtime loop, autonomy tiers) address where AI risk is actually heading in your view?",
    required: true,
  },
  {
    id: "s1-4",
    section: 1,
    code: "1.4",
    sortOrder: 4,
    type: "YESNO",
    prompt:
      "Is the depth of ADG V2 achievable for small and mid-market organisations, not only enterprises?",
    required: true,
  },
  {
    id: "s1-5",
    section: 1,
    code: "1.5",
    sortOrder: 5,
    type: "TEXT",
    prompt:
      "Which AI governance and compliance pain points are you facing today — which of them does ADG V2 cover, and which does it miss? Keep to general industry terms: no internal systems, architecture, data flows or IP.",
    required: false,
  },
  ...productBlock(2, "s2"),
  ...productBlock(3, "s3"),
  ...productBlock(4, "s4"),
  ...productBlock(5, "s5"),
  {
    id: "s6-1",
    section: 6,
    code: "6.1",
    sortOrder: 1,
    type: "YESNO",
    prompt:
      "Taken together, do the framework (ADG V2) + four products form a coherent approach to making AI governable for a typical organisation?",
    required: true,
  },
  {
    id: "s6-2",
    section: 6,
    code: "6.2",
    sortOrder: 2,
    type: "YESNO",
    prompt:
      "Do you approve the direction presented today and support proceeding to market?",
    required: true,
  },
  {
    id: "s6-3",
    section: 6,
    code: "6.3",
    sortOrder: 3,
    type: "MULTI",
    prompt: "Select the top 3 pain points EC-Council should prioritise next.",
    required: true,
    maxSelect: 3,
    options: [...PAIN_TAXONOMY],
  },
  {
    id: "s6-4",
    section: 6,
    code: "6.4",
    sortOrder: 4,
    type: "TEXT",
    prompt:
      "Pain points you face or observe that none of today's solutions address.",
    required: false,
  },
  {
    id: "s6-5",
    section: 6,
    code: "6.5",
    sortOrder: 5,
    type: "YESNO",
    prompt: "Open to a 30-minute follow-up conversation?",
    required: false,
  },
];

export function questionsForSection(sectionId: number) {
  return pulseQuestions.filter((question) => question.section === sectionId);
}

export function isScoredQuestion(question: PulseQuestionSeed) {
  return (
    question.section >= 1 &&
    question.id !== "s1-5" &&
    question.id !== "s6-4" &&
    question.id !== "s6-5"
  );
}

export const scoredQuestions = pulseQuestions.filter(isScoredQuestion);

export function questionKindLabel(question: PulseQuestionSeed) {
  const required = question.required ? " · REQUIRED" : "";
  switch (question.type) {
    case "LIKERT":
      return `LIKERT 1–5${required}`;
    case "YESNO":
      return `YES / NO + COMMENT${required}`;
    case "PMF":
      return `SEAN ELLIS PMF · SINGLE SELECT${required}`;
    case "MULTI":
      return question.maxSelect
        ? `MULTI-SELECT · UP TO ${question.maxSelect}${required}`
        : `MULTI-SELECT · CHOOSE ANY${required}`;
    case "TEXT":
      return `SHORT FREE-TEXT${required}`;
    case "DUAL_TEXT":
      return `TWO SHORT FREE-TEXT FIELDS${required}`;
  }
}

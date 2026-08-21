export type QuestionSeed = {
  id: number;
  section: string;
  sectionTitle: string;
  polarity: string;
  isGate: boolean;
  isRevised: boolean;
  prompt: string;
  basis: string;
};

export const reviewQuestions: QuestionSeed[] = [
  {
    id: 1,
    section: "A",
    sectionTitle: "Go-to-Market Readiness",
    polarity: "Yes = ready to proceed as-is.",
    isGate: true,
    isRevised: false,
    prompt:
      "Is the Protocol site ready to launch under the EC-Council brand while hosted on a third-party subdomain (adg-protocol.netlify.app) rather than an eccouncil.org property, as v1.0 is?",
    basis:
      "Protocol site host; v1.0 canonical eccouncil.org/adgframework.",
  },
  {
    id: 2,
    section: "A",
    sectionTitle: "Go-to-Market Readiness",
    polarity: "Yes = ready to proceed as-is.",
    isGate: true,
    isRevised: false,
    prompt:
      'Can the site go to market while both advisor cards on the contact page display "TIDYCAL · BOOKING LINK PENDING" instead of a working scheduling link?',
    basis:
      "Contact page, Advisors 01 (Payal Chainani) and 02 (Mohammed Rahman Ali).",
  },
  {
    id: 3,
    section: "A",
    sectionTitle: "Go-to-Market Readiness",
    polarity: "Yes = ready to proceed as-is.",
    isGate: false,
    isRevised: false,
    prompt:
      "Is the published entry offer — a 30-minute scoping briefing covering AI adoption stage, mandate pressure, and current harness state — the right first commercial step for enterprise prospects?",
    basis: 'Contact page, "What to expect · Scoping briefing."',
  },
  {
    id: 4,
    section: "A",
    sectionTitle: "Go-to-Market Readiness",
    polarity: "Yes = ready to proceed as-is.",
    isGate: false,
    isRevised: false,
    prompt:
      'Is the paid four-phase consulting engagement sufficiently differentiated from the free open framework, so the commercial motion does not undercut the "genuinely free, not licensed" positioning?',
    basis:
      'FAQ 8 ("all of it is free to access and implement") vs. the engagement producing a "funded transformation roadmap."',
  },
  {
    id: 5,
    section: "A",
    sectionTitle: "Go-to-Market Readiness",
    polarity: "Yes = ready to proceed as-is.",
    isGate: false,
    isRevised: false,
    prompt:
      "Are two named advisors sufficient delivery coverage for the promised footprint of NAM, EMEA and APAC across financial services, healthcare and NCII sectors?",
    basis:
      'Contact page — Payal (APAC), Rahman (NAM · EMEA · APAC); "Global coverage" claim.',
  },
  {
    id: 6,
    section: "A",
    sectionTitle: "Go-to-Market Readiness",
    polarity: "Yes = ready to proceed as-is.",
    isGate: false,
    isRevised: true,
    prompt:
      "Are the four public conversion paths — Readiness Assessment, Skill Check, Contact/briefing request, and Whitepaper download — sufficient as the primary funnel for launch?",
    basis:
      "Protocol hero: three primary CTAs (Assessment, Skill Check, Contact Us) plus the Whitepaper link; v1.0 carries the equivalent Assessment, Skill Check and Whitepaper paths.",
  },
  {
    id: 7,
    section: "A",
    sectionTitle: "Go-to-Market Readiness",
    polarity: "Yes = ready to proceed as-is.",
    isGate: false,
    isRevised: false,
    prompt:
      "Is the four-phase engagement (Discover → Analyze → Report → Transform), with its published deliverables per phase, a sellable service offer in its current published form?",
    basis: 'Protocol site FIG. 03 — phase activities and "What you get" per phase.',
  },
  {
    id: 8,
    section: "A",
    sectionTitle: "Go-to-Market Readiness",
    polarity: "Yes = ready to proceed as-is.",
    isGate: true,
    isRevised: false,
    prompt:
      'Is the marketing claim "crosswalked to 50+ standards, regulations and threat catalogues" adequately substantiated for public use, given the site evidences seven crosswalks totalling 135 mapped points?',
    basis: 'Hero copy "50+"; crosswalk section "7 CROSSWALKS · 135 POINTS."',
  },
  {
    id: 9,
    section: "A",
    sectionTitle: "Go-to-Market Readiness",
    polarity: "Yes = ready to proceed as-is.",
    isGate: false,
    isRevised: false,
    prompt:
      'Is the skill-check duration claim consistent enough for launch, given the Protocol site promises a "10-minute pathway" while v1.0 states "~20 min"?',
    basis: "Protocol hero CTA vs. v1.0 skill-check panel.",
  },
  {
    id: 10,
    section: "A",
    sectionTitle: "Go-to-Market Readiness",
    polarity: "Yes = ready to proceed as-is.",
    isGate: true,
    isRevised: false,
    prompt:
      "Has the ADG Whitepaper (hosted on eccouncil.org and linked from both sites) been verified as consistent with the Protocol site's figures — 220 controls, 12 families, 135 mapped points — before the two are promoted together?",
    basis:
      "Both sites link the same PDF; Protocol site introduces figures absent from v1.0's page.",
  },
  {
    id: 11,
    section: "B",
    sectionTitle: "Uplift Over ADG v1.0",
    polarity: "Yes = uplift affirmed.",
    isGate: false,
    isRevised: false,
    prompt:
      "Does the expansion from twelve minimum controls (v1.0) to twelve minimum controls plus a 220-control library in twelve mandatory families represent a material capability uplift?",
    basis:
      'v1.0 stat bar "12 Minimum controls"; Protocol site "220 LIBRARY CONTROLS · 12 FAMILIES."',
  },
  {
    id: 12,
    section: "B",
    sectionTitle: "Uplift Over ADG v1.0",
    polarity: "Yes = uplift affirmed.",
    isGate: false,
    isRevised: true,
    prompt:
      "Does the nine-component agentic anatomy — Agent, Model, Context, Memory, MCP, ACP, A2A, Tool, Control — adequately supersede v1.0's nine governance surfaces, given three v1.0 surfaces (Identity, the Safety layer, and the Learning loop) have no named counterpart on the Protocol site?",
    basis:
      "Protocol Coverage Landscape (9 components) vs. v1.0 § 03 (Prompt, Context, Model, Tools, Orchestration + Identity, Safety layer, Telemetry, Learning loop).",
  },
  {
    id: 13,
    section: "B",
    sectionTitle: "Uplift Over ADG v1.0",
    polarity: "Yes = uplift affirmed.",
    isGate: false,
    isRevised: false,
    prompt:
      "Is the ADMIT → DECIDE → EMIT → COMMIT runtime loop — with two stages declared irreversible and controls attached per stage — a clearer operating model than v1.0's Input → Output request pipeline?",
    basis: "Protocol FIG. 02 vs. v1.0 request pipeline (5 surfaces).",
  },
  {
    id: 14,
    section: "B",
    sectionTitle: "Uplift Over ADG v1.0",
    polarity: "Yes = uplift affirmed.",
    isGate: false,
    isRevised: true,
    prompt:
      "Do the crosswalks not named on v1.0's page — MITRE ATT&CK (20 mappings) and OWASP Agentic Top 10, 2026 edition (19 mappings) — meaningfully strengthen threat coverage?",
    basis:
      'v1.0 claims "Six published frameworks" but names five (NIST AI RMF, ISO/IEC 42001, EU AI Act, OWASP LLM Top 10, MITRE ATLAS); the Protocol site publishes seven crosswalks.',
  },
  {
    id: 15,
    section: "B",
    sectionTitle: "Uplift Over ADG v1.0",
    polarity: "Yes = uplift affirmed.",
    isGate: false,
    isRevised: false,
    prompt:
      "Do the new T1 / T2 / T3 autonomy tiers — scoping 4, 9, and 12 minimum controls respectively, declared at intake (MC-02) and re-attested each release — add governance precision absent from v1.0 (which published only a 1–5 maturity scale via the assessment)?",
    basis: 'Protocol § "ADG Control Scale"; v1.0 assessment panel "Tier 3 / 5 Managed."',
  },
  {
    id: 16,
    section: "B",
    sectionTitle: "Uplift Over ADG v1.0",
    polarity: "Yes = uplift affirmed.",
    isGate: false,
    isRevised: true,
    prompt:
      "Is the engagement's three-horizon transformation roadmap (Hotfix / Medium / Long-term, with PPTD investment splits and mapped controls) a material new deliverable layered above the self-serve assessment's 30/60/90-day roadmap — which persists unchanged in FAQ 6 on both sites?",
    basis:
      "Protocol FIG. 04 roadmap (engagement output) vs. FAQ 6 on both sites (assessment output).",
  },
  {
    id: 17,
    section: "B",
    sectionTitle: "Uplift Over ADG v1.0",
    polarity: "Yes = carry-over required.",
    isGate: false,
    isRevised: true,
    prompt:
      "Should the named 38-member Advisory Board roster — photos, titles and organisations, present on v1.0 — be restored on the Protocol site before it replaces v1.0's page?",
    basis:
      "v1.0 § 05 Advisory Board; on the Protocol site the board is referenced only in FAQ text, and the two contact-page advisors are sales/engagement roles, not the Advisory Board.",
  },
  {
    id: 18,
    section: "B",
    sectionTitle: "Uplift Over ADG v1.0",
    polarity: "Yes = carry-over required.",
    isGate: false,
    isRevised: false,
    prompt:
      "Should v1.0's four harm classes (Confidentiality loss, Integrity failure, Availability impact, Accountability gap) be carried into the new site, given they do not appear anywhere on it?",
    basis: 'v1.0 "Harm classes · 04 outcomes"; absent from Protocol site.',
  },
  {
    id: 19,
    section: "B",
    sectionTitle: "Uplift Over ADG v1.0",
    polarity: "Yes = carry-over required.",
    isGate: false,
    isRevised: false,
    prompt:
      "Should the three audience personas (Learner / Practitioner / Executive), presented as a dedicated section on v1.0, be preserved as first-class positioning — given the Protocol site retains them only inside an FAQ answer?",
    basis: 'v1.0 § 04 "Built for"; Protocol FAQ 5.',
  },
  {
    id: 20,
    section: "B",
    sectionTitle: "Uplift Over ADG v1.0",
    polarity: "Yes = uplift affirmed.",
    isGate: false,
    isRevised: false,
    prompt:
      "Taken as a whole, does the Protocol site deliver a defensible uplift over v1.0 sufficient to position it publicly as the next version of ADG?",
    basis: "Aggregate of Q11–Q19.",
  },
  {
    id: 21,
    section: "C",
    sectionTitle: "People · Process · Technology · Data Coverage",
    polarity: "Yes = coverage adequate as published.",
    isGate: false,
    isRevised: false,
    prompt:
      "Does the People lens as published — decision rights and accountability per agent, a named owner for every production system, capability and training gaps by role, escalation paths that are actually used — adequately cover human accountability?",
    basis: "Protocol site, Report lens PEOPLE.",
  },
  {
    id: 22,
    section: "C",
    sectionTitle: "People · Process · Technology · Data Coverage",
    polarity: "Yes = coverage adequate as published.",
    isGate: false,
    isRevised: false,
    prompt:
      "Does the Process lens — end-to-end workflows agents touch, approval and control points, change and release discipline, incident detection and response paths — adequately cover operational governance?",
    basis: "Report lens PROCESS.",
  },
  {
    id: 23,
    section: "C",
    sectionTitle: "People · Process · Technology · Data Coverage",
    polarity: "Yes = coverage adequate as published.",
    isGate: false,
    isRevised: false,
    prompt:
      "Does the Technology lens — model gateways under one policy point, trust-tiered tool and MCP registries, guardrails on the emit path, runtime telemetry and replay for every action — adequately cover the technical control surface?",
    basis: "Report lens TECHNOLOGY.",
  },
  {
    id: 24,
    section: "C",
    sectionTitle: "People · Process · Technology · Data Coverage",
    polarity: "Yes = coverage adequate as published.",
    isGate: false,
    isRevised: false,
    prompt:
      "Does the Data lens — lineage and provenance of retrieved context, entitlement (who may see what, and when), retention and memory boundaries, evidence captured for audit — adequately cover data governance?",
    basis: "Report lens DATA.",
  },
  {
    id: 25,
    section: "C",
    sectionTitle: "People · Process · Technology · Data Coverage",
    polarity: "Yes = coverage adequate as published.",
    isGate: false,
    isRevised: false,
    prompt:
      "Are the published investment splits across the three horizons — People 40% at Hotfix shifting to Data 40% at Long-term — directionally sound as client-facing guidance?",
    basis: "FIG. 04 investment percentages per horizon.",
  },
  {
    id: 26,
    section: "C",
    sectionTitle: "People · Process · Technology · Data Coverage",
    polarity: "Yes = coverage adequate as published.",
    isGate: false,
    isRevised: false,
    prompt:
      'Is Phase 03\'s commitment — readiness scored against every minimum control, reported across all four lenses — sufficient to substantiate the "board-grade evidence pack, not a slide deck" claim?',
    basis: "FIG. 03 Phase 03 REPORT.",
  },
  {
    id: 27,
    section: "C",
    sectionTitle: "People · Process · Technology · Data Coverage",
    polarity: "Yes = coverage adequate as published.",
    isGate: false,
    isRevised: true,
    prompt:
      "Is the absence of a published control-to-lens mapping acceptable — Phase 03 scores readiness against every minimum control across all four PPTD lenses, yet no MC × PPTD mapping appears anywhere on either site?",
    basis:
      "FIG. 03 Phase 03 (scores + four lenses) and full-site extraction (no MC × PPTD mapping published).",
  },
  {
    id: 28,
    section: "C",
    sectionTitle: "People · Process · Technology · Data Coverage",
    polarity: "Yes = coverage adequate as published.",
    isGate: false,
    isRevised: false,
    prompt:
      'Is the AI Governance Council\'s reduced prominence acceptable — a standing mediation layer with its own section on v1.0, but on the Protocol site appearing only as a Hotfix workstream ("Stand up the AI Governance Council"), MC-10 evidence (quarterly council minutes), and the tier-downgrade approval authority?',
    basis: 'v1.0 "Mediation layer" section vs. Protocol references.',
  },
  {
    id: 29,
    section: "D",
    sectionTitle: "Technical Alliance / Partner Program Fit",
    polarity: "Yes = supports an alliance motion.",
    isGate: false,
    isRevised: false,
    prompt:
      'Does the framework\'s stated positioning — open, free ("not \'free trial\' free"), vendor-neutral, practitioner-led — support recruiting technology vendors into a technical alliance program without licensing friction?',
    basis: "Positioning tags on both sites; FAQ 8.",
  },
  {
    id: 30,
    section: "D",
    sectionTitle: "Technical Alliance / Partner Program Fit",
    polarity: "Yes = supports an alliance motion.",
    isGate: false,
    isRevised: false,
    prompt:
      'Is the crosswalk architecture — "Evidence once. Answer many," with every mapping landing on a minimum control that opens into a mandatory family — a sufficient technical basis for partners to map their products to ADG?',
    basis: "Protocol § crosswalk structural rule.",
  },
  {
    id: 31,
    section: "D",
    sectionTitle: "Technical Alliance / Partner Program Fit",
    polarity: "Yes = supports an alliance motion.",
    isGate: false,
    isRevised: false,
    prompt:
      "Does MC-12 (Shared Responsibility Documentation, evidenced by a signed vendor responsibility matrix) provide the contractual anchor an alliance program needs for vendor accountability?",
    basis: "FIG. 05 ledger, MC-12 row.",
  },
  {
    id: 32,
    section: "D",
    sectionTitle: "Technical Alliance / Partner Program Fit",
    polarity: "Yes = supports an alliance motion.",
    isGate: false,
    isRevised: false,
    prompt:
      "Do the trust-tiered Tool & MCP Register (MC-07) and the published gate adjudication model (permitted / held for approval / refused, with signed verdict and rationale) give partners a concrete integration surface to certify against?",
    basis: 'FIG. 03B "The Gate"; MC-07 evidence artefact.',
  },
  {
    id: 33,
    section: "D",
    sectionTitle: "Technical Alliance / Partner Program Fit",
    polarity: "Yes = supports an alliance motion.",
    isGate: false,
    isRevised: false,
    prompt:
      "Are the EC-Council pillar badges (Adopt / Defend / Govern) and the skill-check certification pathway suitable as the enablement track for alliance-partner engineers?",
    basis:
      'v1.0 badge panel and "EC-Council badge and a certification path"; Protocol "earn your ADG pillar badge."',
  },
  {
    id: 34,
    section: "D",
    sectionTitle: "Technical Alliance / Partner Program Fit",
    polarity: "Yes = supports an alliance motion.",
    isGate: false,
    isRevised: false,
    prompt:
      "Is the 38-member Advisory Board spanning 20+ global organisations — including partner-facing roles such as Global Outreach & Partner Experience (EC-Council) and a VP of AI GTM (ServiceNow) — sufficient evidence of ecosystem pull to anchor alliance recruitment?",
    basis: "v1.0 board roster (Mayank Tandon; Adam Spearing).",
  },
  {
    id: 35,
    section: "D",
    sectionTitle: "Technical Alliance / Partner Program Fit",
    polarity: "Yes = supports an alliance motion.",
    isGate: false,
    isRevised: false,
    prompt:
      "Should a dedicated partner/alliance section be added to the site before any alliance program launches, given neither the v1.0 page nor the Protocol site currently publishes one?",
    basis: "Absence verified on both extractions.",
  },
  {
    id: 36,
    section: "E",
    sectionTitle: "Evidence & Content Integrity",
    polarity: "Yes = must be corrected before external distribution.",
    isGate: true,
    isRevised: false,
    prompt:
      "Must the control-count conflict be corrected — the home page states a 220-control library throughout, while the contact page states engagements are \"evidenced against the 159-control library\"?",
    basis: "Protocol home vs. /contact.",
  },
  {
    id: 37,
    section: "E",
    sectionTitle: "Evidence & Content Integrity",
    polarity: "Yes = must be corrected before external distribution.",
    isGate: true,
    isRevised: false,
    prompt:
      'Must the control-to-family pairing be finalised and the public "PROVISIONAL PAIRING · PENDING REVIEW" banner removed before the library is cited in client deliverables — noting the current pairing places MC-01 (tagged GOVERN) over the Inventory & Ownership family (tagged ADOPT)?',
    basis: "Library section banner; FIG. 05 vs. family pillar tags.",
  },
  {
    id: 38,
    section: "E",
    sectionTitle: "Evidence & Content Integrity",
    polarity: "Yes = must be corrected before external distribution.",
    isGate: true,
    isRevised: false,
    prompt:
      "Must the MC-ID labelling drift be corrected — e.g., FIG. 01 labels the Evidence surface MC-11 and Memory MC-08, while the ledger defines MC-11 as Fairness & Bias Evaluation and MC-08 as Runtime Monitoring?",
    basis: "Hero FIG. 01 vs. FIG. 05 ledger.",
  },
  {
    id: 39,
    section: "E",
    sectionTitle: "Evidence & Content Integrity",
    polarity: "Yes = must be corrected before external distribution.",
    isGate: true,
    isRevised: false,
    prompt:
      'Must FAQ 4 — "All twelve of ADG\'s minimum controls align with … the EU AI Act" — be reconciled with the crosswalk card stating "Six controls plus tiers and telemetry carry the conformity load" (8 article mappings touching MC-01, 02, 04, 08, 09, 11 only)?',
    basis: "FAQ 4 (both sites) vs. Protocol EU AI Act coverage card.",
  },
  {
    id: 40,
    section: "E",
    sectionTitle: "Evidence & Content Integrity",
    polarity: "Yes = must be corrected before external distribution.",
    isGate: true,
    isRevised: false,
    prompt:
      'Must the non-sequential section numbering and broken cross-references be fixed — sections render §01 → §06 → §02 → §07 → §03 → §04 → §05 → §09 → §08, and § 09 cites the crosswalk as "§ 05" when the crosswalk is § 04?',
    basis: 'Rendered section order and "every crosswalk in § 05" line.',
  },
  {
    id: 41,
    section: "E",
    sectionTitle: "Evidence & Content Integrity",
    polarity: "Yes = must be corrected before external distribution.",
    isGate: false,
    isRevised: false,
    prompt:
      "Must duplicate figure numbering be resolved — FIG. 01 is used for the harness matrix, the anatomy diagram, and a third time on the contact page; FIG. 04 for both the transformation roadmap and the Control Scale — given the framework markets citation-grade evidential rigour?",
    basis: "Figure captions across the Protocol site and /contact.",
  },
  {
    id: 42,
    section: "E",
    sectionTitle: "Evidence & Content Integrity",
    polarity: "Yes = must be corrected before external distribution.",
    isGate: false,
    isRevised: false,
    prompt:
      "Must the T1 (Assistive) control scope be reviewed — it requires only MC-01→MC-04, which excludes the Tool & MCP Register (MC-07) even for assistive agents that reach tools?",
    basis: "Control Scale tier definitions; MC-07 ledger row.",
  },
  {
    id: 43,
    section: "E",
    sectionTitle: "Evidence & Content Integrity",
    polarity: "Yes = must be corrected before external distribution.",
    isGate: false,
    isRevised: true,
    prompt:
      "Must the individual 220 library controls be published in accessible, indexable form before the library is marketed as a deliverable — the server-rendered site exposes only the twelve family names and their counts, and any control text behind the interactive Wheel/Matrix/Ledger views or in the whitepaper remains unverified?",
    basis:
      "Library section as server-rendered; JS-gated views and whitepaper not yet verified.",
  },
  {
    id: 44,
    section: "F",
    sectionTitle: "Compliance, Legal & Brand Risk",
    polarity: "Yes = action required before launch.",
    isGate: true,
    isRevised: false,
    prompt:
      "Do the specific EU AI Act citations — Regulation (EU) 2024/1689 with article-level mappings (Art 6–7, 9, 10, 13, 14, 49/71, 72, 73) — require legal review before publication as marketing claims?",
    basis: "Protocol EU AI Act coverage card.",
  },
  {
    id: 45,
    section: "F",
    sectionTitle: "Compliance, Legal & Brand Risk",
    polarity: "Yes = action required before launch.",
    isGate: true,
    isRevised: false,
    prompt:
      "Does the contact form — collecting full name, email, organisation, position and free-text notes, on a page promising EMEA coverage — require a published privacy notice and consent mechanism before it accepts submissions?",
    basis:
      'Contact form fields; "Global coverage · NAM, EMEA, APAC"; rendered footer contains no privacy link.',
  },
  {
    id: 46,
    section: "F",
    sectionTitle: "Compliance, Legal & Brand Risk",
    polarity: "Yes = action required before launch.",
    isGate: false,
    isRevised: true,
    prompt:
      'Does the contact-form assurance "TRANSMISSION ENCRYPTED IN TRANSIT" require review of its scope — the claim covers transit only, and the page states nothing about storage, retention, or processing of the personal data submitted?',
    basis:
      "Contact page FIG. 01 caption; absence of any at-rest or processing statement.",
  },
  {
    id: 47,
    section: "F",
    sectionTitle: "Compliance, Legal & Brand Risk",
    polarity: "Yes = action required before launch.",
    isGate: false,
    isRevised: false,
    prompt:
      "Do the enterprise names invoked in FAQ 7 — Microsoft, Salesforce, JPMorgan Chase, Citi — require confirmed, current approval for use in the Protocol site's new context (a consulting-engagement property, distinct from v1.0's framework page where their advisors are individually named)?",
    basis: "FAQ 7 on both sites; named roster appears only on v1.0.",
  },
  {
    id: 48,
    section: "F",
    sectionTitle: "Compliance, Legal & Brand Risk",
    polarity: "Yes = action required before launch.",
    isGate: false,
    isRevised: false,
    prompt:
      "Do the six practitioner testimonials published on v1.0 (SAP, JPMorgan Chase, Citi, Huntington Bank, Jio Platforms, GlobalLogic) require re-consent before any restoration or reuse on the Protocol site?",
    basis:
      "v1.0 testimonial carousel; none currently on the Protocol site.",
  },
  {
    id: 49,
    section: "F",
    sectionTitle: "Compliance, Legal & Brand Risk",
    polarity: "Yes = action required before launch.",
    isGate: false,
    isRevised: false,
    prompt:
      "Do the sector claims — advisory for financial services, healthcare and NCII — require sector-specific regulatory review before targeted marketing into those sectors?",
    basis: 'Contact page "Global coverage" line.',
  },
  {
    id: 50,
    section: "F",
    sectionTitle: "Compliance, Legal & Brand Risk",
    polarity: "Yes = action required before launch.",
    isGate: true,
    isRevised: false,
    prompt:
      "Does running two live public versions in parallel — v1.0 on eccouncil.org and the Protocol site on Netlify, with conflicting figures (e.g., six vs. seven crosswalks, ~20 vs. 10-minute skill check) — require a formal transition and deprecation plan before the new site is promoted?",
    basis: "Both extractions, both live 21 Aug 2026.",
  },
];

# PRD — ADG Board Pulse
## AI Advisory Board Feedback Portal + Internal Metrics Dashboard

| Field | Value |
|---|---|
| Document | PRD-ADG-PULSE-001 |
| Version | v0.1 (Draft for review) |
| Author | Viknesh Krishnan (VK) |
| Reviewers | Karthik S. (Framework Architect), GTM/Delivery leads |
| Status | **DRAFT — blocked on Decisions D1, D2 (§ 12)** |
| Target event | EC-Council AI Advisory Board meeting — **27 Aug 2026** *(assumed 27 August; confirm)* |
| Last updated | 21 Aug 2026 |

---

## 1. Summary

EC-Council presents ADG V2 (the Protocol) and four product demos — **ComplyX, AwareX, AI SOC, Shadow AI** — to its **38-member AI Advisory Board** on 27 Aug 2026. **ADG Board Pulse** is the system that converts that meeting into structured, measurable signal. It has two surfaces:

1. **Board Portal** — authenticated, low-friction survey where each board member records alignment, consensus/approval, likes/dislikes, product-market-fit signal, and *general* (non-IP) pain points against the five agenda items.
2. **Pulse Dashboard** — internal, role-gated analytics view where the EC-Council team reads response rate, per-item Alignment Index, PMF scores, pain-point frequency, and verbatim themes, and exports a board readout.

**What the board decides:** whether the V1→V2 direction and the four-product portfolio address the governance pain points they see in the market — and where the gaps are.
**What we decide from the data:** which solutions to accelerate, which claims to fix, and whether there is credible product-market fit to scale marketing.

---

## 2. Context & Problem

- **ADG V1** (`eccouncil.org/adgframework`, released May 2026): 12 minimum controls, 3 pillars, crosswalks to NIST AI RMF / ISO 42001 / EU AI Act, 38-member Advisory Board, v1.0 public.
- **ADG V2 / Protocol** (`adg-protocol.netlify.app`): 12 minimum controls **plus** 12 mandatory control families (a deep control library), 7 in-depth crosswalks / 135 mapped points, "50+ standards" reach, agentic anatomy (MCP/ACP/A2A), runtime loop, autonomy tiers, and a 4-phase consulting engagement.
- The Advisory Board has never formally scored the V2 direction or the product portfolio. Today, board sentiment lives in emails and hallway conversations — unquantified, unactionable, and unusable as marketing evidence.
- The meeting is a one-shot opportunity: 38 senior practitioners (Microsoft, Salesforce, JPMorgan Chase, Citi, ServiceNow, Jio, KPMG, BASF, BNP Paribas, and others) in one session. Without an instrument, their feedback evaporates.

**Problem statement:** We have no structured mechanism to capture, quantify, and act on Advisory Board feedback about the V2 direction and the product portfolio — and no internal view to read that feedback as decisions.

---

## 3. Goals & Success Metrics

| # | Goal | Metric | Target |
|---|---|---|---|
| G1 | Capture board feedback on all 5 agenda items | Response rate (members submitting a complete survey) | ≥ 70% (27 of 38) within 5 days of the meeting |
| G2 | Quantify alignment/consensus per agenda item | Alignment Index computed per item (§ 9.2) | Index available for all 5 items by 1 Sep |
| G3 | Surface market pain points without IP disclosure | ≥ 1 taxonomy selection or free-text pain point per respondent | ≥ 80% of respondents |
| G4 | Produce a PMF signal per product | Sean Ellis PMF score per product (§ 9.2) | Score computed for all 4 products |
| G5 | Give leadership a decision-ready readout | Exported board readout (PDF/MD) from dashboard | Delivered ≤ 7 days post-meeting |

**Non-goals (this release):**
- Not a public marketing site, community forum, or the ADG assessment platform (that exists at `aigovernance.eccouncil.org`).
- Not a continuous board-collaboration workspace (single survey cycle; re-usable later).
- No native mobile apps (responsive web only — board members will answer on phones).
- No per-organisation SSO (Microsoft/Citi SSO federation is out of scope; magic-link auth instead).
- No AI-generated summarisation of verbatims in v1 (P2 — see FR-D8).

---

## 4. Users & Personas

| Persona | Who | Job to be done | Constraints |
|---|---|---|---|
| **Board Member** | 38 external senior execs (CISOs, CAIOs, VPs — AI Advisory Board) | Give candid, fast feedback on the approach and products; flag pain points without exposing employer IP | ≤ 15 minutes total; phone-friendly; zero password ceremony; must trust data handling |
| **Internal Analyst** | ADG/GTM team (VK, delivery leads) | Read alignment, PMF, pain themes; identify what to fix; build the readout | Needs live data from first response; filter/segment; export |
| **Leadership** | Framework/practice leadership (e.g., Karthik S.) | Decide accelerate/hold per product; approve messaging changes | One-screen summary; drill-down on demand |
| **Admin** | Portal operator | Load member roster, send/resend invites, monitor completion, close the window | Bulk actions; no engineering needed for routine ops |

---

## 5. Locked Terminology (one term per concept)

| Term | Meaning — use exactly this, everywhere |
|---|---|
| **ADG V1** | The framework as published on eccouncil.org/adgframework (12 minimum controls) |
| **ADG V2 / the Protocol** | The evolution on adg-protocol.netlify.app (12 minimum controls + 12 mandatory families + control library + crosswalks + engagement) |
| **Minimum Controls (MC-01…MC-12)** | The floor. V2 does **not** replace these — families sit **beneath** them |
| **Control Families** | The 12 mandatory families forming the control library |
| **Portal** | The board-facing survey surface |
| **Pulse Dashboard** | The internal analytics surface |
| **Agenda Items (5)** | ① V1→V2 scale-up · ② ComplyX · ③ AwareX · ④ AI SOC · ⑤ Shadow AI |

> ⚠️ **D1 (blocking):** The library control count is inconsistent at source — Protocol home says **220**, Protocol contact page says **159**, and the meeting brief says **180+**. One number must be locked (owner: Framework Architect) before any survey copy, slide, or dashboard label ships. This PRD uses the placeholder `⟨N⟩` until D1 closes.
> ⚠️ **D2 (blocking):** Meeting narrative must say "from 12 minimum controls **to 12 minimum controls + 12 control families (⟨N⟩ controls)**" — not "from 12 controls to 12 families." The audience includes the framework's own authors and advisors; the survey questions in Appendix A are written against the corrected framing.

---

## 6. The Five Agenda Items (what the survey scores)

| # | Item | One-line description (as briefed) | ADG anchor *(proposed positioning — confirm)* |
|---|---|---|---|
| 1 | **V1 → V2 scale-up** | From 12 minimum controls to the full Protocol: 12 families, ⟨N⟩ controls, 50+ standards reach, agentic coverage, engagement model | Whole framework |
| 2 | **ComplyX** | Compliance product — walks an organisation through AI compliance | MC-02 Risk Classification · Regulatory Mapping · Assurance & Audit families [Likely] |
| 3 | **AwareX** | End-user awareness (phishing/social-engineering simulation & training) | People lens · human-risk controls [Likely] |
| 4 | **AI SOC** | AI-based Security Operations Center | MC-08 Runtime Monitoring · MC-09 Incident Response [Likely] |
| 5 | **Shadow AI** | Endpoint discovery of AI tools in use across the organisation | MC-01 AI System Inventory ("agents they cannot list, owned by people they cannot name") [Likely] |

---

## 7. End-to-End Flows

### 7.1 Board Member flow (Portal)
1. **Invite** — personalised email with magic link (no password, no signup). Sent at the close of the 27 Aug meeting; reminder at +48h and +96h.
2. **Landing** — one screen: purpose, time estimate ("~12 minutes"), data-handling statement, and the **no-IP guardrail** (verbatim): *"Please share general, industry-level pain points only. Do not include confidential information, internal project details, or anything covered by your employer's obligations."*
3. **Survey** — six sections (Appendix A): one per agenda item + one cross-portfolio section. Progress bar; autosave per answer; resume via same link.
4. **Submit** — confirmation screen; option to edit until the window closes (**1 Sep 2026, 23:59 MYT**).
5. **Post-close** — link renders a thank-you page; responses locked.

### 7.2 Internal flow (Pulse Dashboard)
1. **Login** — internal accounts only (role: analyst / leadership / admin).
2. **Overview** — response rate, per-item Alignment Index, portfolio PMF tiles, top-5 pain points.
3. **Drill-down** — per agenda item: distributions, verbatims (likes / dislikes / gaps), per-member status (admin only).
4. **Themes** — analyst tags verbatims against the pain-point taxonomy (Appendix B); tag frequencies feed the overview.
5. **Export** — board readout (Markdown → EC-Council-branded PDF via existing pipeline) + raw CSV.

---

## 8. Functional Requirements

**Priority:** P0 = must ship for 27 Aug · P1 = ship by window close (1 Sep) · P2 = post-cycle.

### 8.1 Portal (board-facing)

| ID | Requirement | Priority |
|---|---|---|
| FR-P1 | Magic-link authentication per invited member; links single-use per session, expiring at window close; no self-registration; roster is the allow-list | P0 |
| FR-P2 | Survey renders the six sections in Appendix A with question types: Yes/No + comment, Likert 1–5, single-select PMF, multi-select taxonomy, free text | P0 |
| FR-P3 | Autosave every answer; resume on return; explicit Submit; editable until window close | P0 |
| FR-P4 | Mobile-responsive; each question answerable in ≤ 2 taps + optional typing | P0 |
| FR-P5 | No-IP guardrail text displayed on landing **and** above every free-text field | P0 |
| FR-P6 | Attribution notice per D3: responses attributed internally; only aggregated/anonymised data leaves EC-Council | P0 |
| FR-P7 | Optional "willing to do a 30-min follow-up" toggle per member | P1 |
| FR-P8 | Accessibility: keyboard navigable, labels on all inputs, WCAG AA contrast | P1 |

### 8.2 Pulse Dashboard (internal)

| ID | Requirement | Priority |
|---|---|---|
| FR-D1 | Overview: response rate (n/38 + %), completion funnel, days-to-close countdown | P0 |
| FR-D2 | Per-item Alignment Index and answer distributions (stacked bars for Likert; Yes/No splits) | P0 |
| FR-D3 | PMF tile per product using Sean Ellis scoring (§ 9.2) | P0 |
| FR-D4 | Verbatim browser: filter by item, question, tag; like/dislike/gap lanes | P0 |
| FR-D5 | Pain-point leaderboard: taxonomy option frequency + analyst-tagged free-text themes | P0 |
| FR-D6 | Admin: roster upload (CSV), invite send/resend, per-member status, window close control | P0 |
| FR-D7 | Export: raw CSV + readout Markdown (feeds the EC-Council PDF pipeline) | P1 |
| FR-D8 | LLM-assisted verbatim clustering into taxonomy suggestions (analyst approves; never auto-published) | P2 |
| FR-D9 | Segment filters: region, sector, org size of member's organisation (from roster metadata) | P1 |

---

## 9. Measurement Design

### 9.1 Instrument principles
- **Post-demo, not pre-demo.** Alignment and PMF questions are only meaningful after members have seen the demos; the survey opens at meeting close. A 3-question pre-read pulse (Appendix A § 0) is optional and P1.
- **≤ 12 minutes.** 31 scored questions + optional free text. Every section skippable except Section 6 sign-off.
- **Same skeleton per product** (Sections 2–5) so scores are comparable across the portfolio.
- **Yes/No + comment** is the default (consistent with the board's prior review instrument); Likert only where intensity matters; one PMF question per product.

### 9.2 Metric definitions (Dashboard computes exactly these)

| Metric | Definition |
|---|---|
| **Response Rate** | complete submissions ÷ 38 |
| **Alignment Index (per item)** | mean of the item's Likert alignment question, rescaled to 0–100; report alongside %Yes on the item's consensus question |
| **Consensus** | %Yes on "directionally approve" per item; **board consensus** = ≥ 66% Yes with ≥ 70% response rate (thresholds: D5) |
| **PMF Score (per product)** | % answering "Very disappointed" to "How would you feel if this product were not available to the market?" — Sean Ellis method; ≥ 40% = strong PMF signal |
| **Pain-Point Frequency** | count of members selecting each taxonomy option (multi-select) + analyst-tagged free-text themes |
| **Advocacy** | %Yes on "Would you recommend this approach to a peer CISO/CAIO?" |
| **Follow-up Pipeline** | count of FR-P7 opt-ins |

---

## 10. Data Model (minimum viable)

| Table | Key fields |
|---|---|
| `members` | id, name, email, organisation, role_title, region, sector, org_size, invited_at, status |
| `sessions` | id, member_id, magic_token_hash, created_at, expires_at |
| `surveys` | id, name ("Board Pulse — 27 Aug 2026"), opens_at, closes_at, status |
| `questions` | id, survey_id, section, code (e.g., S2-Q3), type (yesno / likert5 / pmf / multiselect / text), prompt, options_json, polarity |
| `responses` | id, member_id, question_id, value_json, comment_text, updated_at |
| `submissions` | member_id, survey_id, submitted_at, followup_opt_in |
| `tags` | id, taxonomy_code, label |
| `response_tags` | response_id, tag_id, tagged_by, tagged_at |
| `internal_users` | id, email, role (analyst / leadership / admin) |

All board PII and free text: row-level security; internal roles read-only except `response_tags`; admin writes limited to roster/invites/window.

## 11. Non-Functional Requirements

- **Privacy & data handling.** Board members include EU/UK-based execs → GDPR-grade handling: lawful-basis + retention statement on the landing page (retain raw 12 months, then aggregate-only — D6), right-to-erasure honoured via admin delete. No trackers beyond first-party analytics. **This fixes on this property the gap flagged on the Protocol contact page (Q45 of the board review).**
- **Attribution policy (D3, recommended default):** attributed internally, anonymised in any external or marketing use; state this to members up front — it materially improves candour.
- **Security.** HTTPS only; magic-token hashes only (never raw tokens at rest); RLS on every table; audit log on admin actions; no third-party form processors.
- **Reliability.** The portal must survive 38 near-simultaneous opens at meeting close — trivial load, but autosave must be conflict-safe (last-write-wins per question per member).
- **Recommended implementation** *(non-binding; full design in the tech spec, not here)*: Next.js (App Router) + Supabase (Postgres, RLS, magic-link auth via OTP email) + Recharts for the dashboard — matches the team's existing stack and the 6-day runway. Host on an **eccouncil.org subdomain** (e.g., `board.aigovernance.eccouncil.org`), not Netlify — board-member trust in the login email depends on the domain.

## 12. Open Decisions

| ID | Decision | Options | Recommendation | Owner | Due |
|---|---|---|---|---|---|
| **D1** | Library control count `⟨N⟩` | 220 · 159 · 180+ | Whichever the whitepaper/library actually totals; fix all surfaces to it | Framework Architect | **23 Aug** |
| **D2** | V1→V2 framing line | "12 → 12 families" vs "12 MCs + 12 families (⟨N⟩ controls)" | The latter — MCs are not replaced | Framework Architect | 23 Aug |
| **D3** | Response attribution | Fully anonymous · attributed-internal/anonymous-external · fully attributed | Attributed-internal / anonymous-external | Leadership | 24 Aug |
| **D4** | Survey timing | Pre-meeting · at meeting close · both | At meeting close (+ optional 3-Q pre-read pulse) | VK | 23 Aug |
| **D5** | Consensus thresholds | — | ≥ 66% Yes @ ≥ 70% response | Leadership | 26 Aug |
| **D6** | Raw-data retention | 6 / 12 / 24 months | 12 months | Leadership | 26 Aug |
| **D7** | Meeting date confirmation | 27 Aug 2026 assumed | — | VK | 22 Aug |

## 13. Timeline (6-day runway)

| Date | Milestone |
|---|---|
| 21 Aug (Fri) | PRD review; D1/D2/D4 escalated |
| 22–23 Aug | Build: auth + survey engine + Appendix A content load; D1/D2 closed → copy finalised |
| 24 Aug | Build: dashboard P0 tiles; roster loaded; staging on eccouncil subdomain |
| 25 Aug | Internal dry run (5 internal testers as fake members); copy freeze |
| 26 Aug | Fixes; invites pre-staged; leadership sign-off (D5/D6) |
| **27 Aug** | **Board meeting** — survey opens at close; live response-rate view in the room if wanted |
| 29 / 31 Aug | Reminder sends |
| 1 Sep | Window closes |
| ≤ 3 Sep | Analyst tagging complete; readout exported to leadership |

## 14. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| D1 unresolved by 23 Aug → conflicting numbers in front of the framework's own advisors | Medium | **Critical** — credibility | Placeholder `⟨N⟩` hard-blocks copy freeze; escalate day 1 |
| Low completion (exec time) | Medium | High | ≤12 min, magic link, phone-first, autosave, in-room open + 2 reminders |
| IP leakage in free text | Low | High | Guardrail text at every free-text field; analyst review before any quote leaves the dashboard; D3 policy |
| 6-day build slips | Medium | High | P0 set is deliberately small; P1/P2 cuttable without harming G1–G5; fallback = same Appendix A instrument on a locked-down form, dashboard reads the same tables |
| Netlify-style domain distrust in invite email | Medium | Medium | eccouncil.org subdomain + named sender |
| Survey leading-question bias inflates alignment | Medium | Medium | Every section pairs the positive question with a mandatory "biggest gap/concern" field; Appendix A wording reviewed against the six-check rubric used on the prior 50Q instrument |

---

## Appendix A — Survey Instrument v0.1 (31 scored questions + optional pulse)

*Types: [Y/N+C] Yes/No + comment · [L5] Likert 1 (strongly disagree) – 5 (strongly agree) · [PMF] Very / Somewhat / Not disappointed · [MS] multi-select · [T] free text. Guardrail text precedes every [T].*

### Section 0 — Pre-read pulse (optional, sent before the meeting — P1, per D4)
0.1 [MS] Which of these AI-governance challenges is most acute in the market right now? *(Appendix B taxonomy, pick up to 3)*
0.2 [Y/N+C] Is "unknown/unowned AI in production" a top-3 risk in organisations you observe?
0.3 [T] One question you want answered on the 27th.

### Section 1 — ADG V1 → V2 scale-up (5)
1.1 [L5] The evolution from 12 minimum controls to 12 minimum controls **plus** 12 control families (⟨N⟩ controls) is the right direction for ADG.
1.2 [Y/N+C] Does extending crosswalk reach toward 50+ standards (7 mapped in depth today) materially reduce compliance burden for adopters?
1.3 [Y/N+C] Does V2's agentic coverage (MCP / ACP / A2A, runtime loop, autonomy tiers) address where AI risk is actually heading in your view?
1.4 [Y/N+C] Is the depth of V2 achievable for small and mid-market organisations, not only enterprises?
1.5 [T] Biggest gap or concern in the V1→V2 direction.

### Sections 2–5 — Product blocks (same 6-question skeleton × 4 products = 24)
Applied to: **② ComplyX** (AI compliance walkthrough) · **③ AwareX** (end-user awareness) · **④ AI SOC** (AI-based security operations) · **⑤ Shadow AI** (endpoint discovery of AI tool usage).

x.1 [L5] The demo convinced me this product solves a real, common problem.
x.2 [Y/N+C] Does this address a pain point you see in the market (or face internally, in general terms)?
x.3 [PMF] If this product were not available to the market, how would you feel?
x.4 [Y/N+C] Would you recommend this approach to a peer CISO/CAIO?
x.5 [MS] What's missing or weakest? *(options: coverage/depth · integration with existing stack · evidence/reporting · pricing-model clarity · deployment model · regulatory defensibility · differentiation vs incumbents · nothing major)*
x.6 [T] One thing you liked; one thing you disliked. *(two short fields)*

### Section 6 — Cross-portfolio consensus & pain points (5, mandatory)
6.1 [Y/N+C] Taken together, do the framework (V2) + four products form a coherent approach to making AI governable for a typical organisation?
6.2 [Y/N+C] **Do you approve the direction presented today and support proceeding to market?** *(the consensus question — D5 thresholds apply)*
6.3 [MS] Rank/select the top 3 pain points EC-Council should prioritise next *(Appendix B taxonomy)*.
6.4 [T] Pain points you face or observe that **none** of today's solutions address. *(general, non-IP)*
6.5 [Y/N] Open to a 30-minute follow-up conversation? *(FR-P7)*

## Appendix B — Pain-Point Taxonomy v0.1 (multi-select options; analyst tags map to the same codes)

| Code | Pain point |
|---|---|
| PP-01 | No inventory of AI systems / shadow AI usage unknown |
| PP-02 | No named ownership or accountability per AI system |
| PP-03 | Mapping one control set to many regulations (NIST / ISO 42001 / EU AI Act / sector rules) |
| PP-04 | Producing audit-grade evidence without manual effort |
| PP-05 | Runtime visibility: drift, abuse, agent actions |
| PP-06 | AI-specific incident detection & response capability |
| PP-07 | Employee misuse / lack of AI awareness |
| PP-08 | Third-party / vendor AI risk & shared responsibility |
| PP-09 | Data governance for AI: lineage, entitlement, retention |
| PP-10 | Skills gap: practitioners who can implement AI governance |
| PP-11 | Board reporting: translating AI risk for directors |
| PP-12 | Cost/justification: funding governance before an incident forces it |
| PP-13 | Agentic-specific risk (tool access, multi-agent, autonomy) |
| PP-14 | Other (free text) |

---

*Change log: v0.1 — initial draft, 21 Aug 2026. Question wording in Appendix A pending the same six-check verification pass applied to the prior 50Q instrument (grounding · answerability · single-issue · polarity · consistency · sense).*

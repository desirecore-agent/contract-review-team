---
last-reviewed: 2026-09-29
---

# Contract review optimization: remote-agent handoff

[中文](handoff.zh-CN.md) · [Documentation](../README.md)

This handoff is self-contained for a successor without access to the previous agent's machine, local plan, scripts, instances or chat. The steps below are proposed work, not completed acceptance. Establish a new authoritative plan and task record in your environment and refresh the baseline from the remote repository.

## Goal and authorization boundaries

The user requests autonomous optimization, implementation, live testing, marketplace publication and newcomer installation until production delivery is demonstrated within an explicit scope. Do not stop at a proposal or wait for “continue” after every step. The user authorized PR creation and merging after independent review and required checks; repository protections and execution permissions still apply.

Trust agents to execute clear natural-language goals. Give each member a minimal independently verifiable result and explicit good/bad criteria. Require stable result categories, not identical wording. Do not replace quality judgment with new mandatory business schemas; valid machine interfaces alone do not mean successful work.

Configure team tool approvals to allow all as requested. This does not authorize business acceptance, legal decisions or signing. Select an available desirecore-cloud model for live tests and record the actual provider/model; do not alter published model settings without authorization. Subagents must use models supported by the successor environment, not assume historical aliases remain available.

## Remote baseline and reading order

Repository: [desirecore-agent/contract-review-team](https://github.com/desirecore-agent/contract-review-team). Published baseline is PR #45 commit 346343b63347f70603fe47c14887b6f1fb799275, team 0.1.37. This branch adds an unreleased normalized-oracle/workflow candidate without replacing the published locks.

Read:

1. [Design and member KPIs](design.md), [testing and evidence](testing.md).
2. [Quickstart](quickstart.md), [maintenance and release](maintenance.md).
3. [Team](../team.json), [member sources](../members.json), [exact locks](../members.lock.json).
4. [Injected shared rules](../shared/rules.md), [ontology rules](../shared/resources/business-ontology/rules.md), [resources](../shared/resources/README.md).
5. [Corpus provenance and limitations](../testdata/contracts/README.md), [oracle](../testdata/contracts/ground-truth.yaml), [history](../CHANGELOG.md).

members.json supplies member repository URLs. Installed execution baselines come from exact commits/content hashes in members.lock.json, not the latest member main. Published versions: lead 1.0.22, intake 1.0.7, extractor 1.1.0, risk 1.1.0, jurisdiction 1.3.0, reporter 1.0.6. The private tooling package's 0.1.30 is not the team version.

PR #46 changed documentation only. PR #45 subsequently published 0.1.37, corrected the locks, and added C09a/C09b plus the evidence and tool-ceiling checks. Its reported live measurements are retained separately as non-normative provenance and are not a live-pass claim for this candidate.

Platform source: [desirecore/desirecore](https://github.com/desirecore/desirecore); configured marketplace source: [desirecore/market](https://github.com/desirecore/market). Access requires the successor environment's own authorization. Recheck current platform market configuration and the relevant entry before publishing; do not assume historical sources or branches remain unchanged.

## Design and unresolved work

Six-member target: O0 registration → O1 intake → O2 extraction → O3 parallel risk/jurisdiction → O4 isolated independent review → O5 scoring/report/DOCX → lead reconciliation and delivery. O4/O5 are separate calls to the same reporter, not a seventh member.

Legal service scope is mainland China only. Foreign-law contracts may receive explicitly limited general document governance but require referral, without foreign-law substantive conclusions. A foreign-law resource folder does not enable that service.

| Gap | Evidence location/fact | Closure criterion |
|---|---|---|
| Runtime rule conflict | Shared and ontology rules retain seven-step/no-merging/no-reordering instructions | Inspect locked member instructions too; align actual flow and prove parallelism, reviewer isolation and ordering |
| Fact reuse versus review | Shared rules require both confirmed-fact reuse and independent verification | Define stage boundaries; deliberately wrong candidates must be refuted from source |
| Oracle drift | C05/C07 conditional; legacy pass in R02/R03; inconsistent historical scope/signature comments | Independently justify scenarios/expectations before editing; never fit answers to observed output |
| Static blind spot | check:gates skips testdata | Add necessary scoped consistency coverage; separate historical observations from current expectations |
| Business questions block delivery | Historical partial O5 awaited answers without final reconciliation | Pending-confirmation reports remain obtainable; simulated continuation is not real authorization |
| Autonomous DOCX unproven | Historical manual YAML repair and external DOCX creation | Team exports and returns real revisions; accept/reject and visual checks pass |
| Production evidence incomplete | No complete current-version three-run and authorized real-contract package | Add scoped cases, provenance, new marketplace install and upgrade evidence |

## Historical observations are not inherited passes

- Twelve files, eleven case IDs; C01–C08 are synthetic, with two C06 versions.
- R01 is a public blank procurement template; R02 is a filled derivative with an intentionally injected arbitration defect; R03 changes dates and related content. They do not establish real executed-client-contract acceptance.
- The predecessor recorded a 2026-09-15/16 C07 run using qwen3.8-flash, O0–O4 and partial O5, 38 confirmed and two additional items. The 62/100 number is a contract score, not agent quality.
- Those artifacts included manual YAML repair and external DOCX generation. Insertion/deletion nodes do not prove autonomous export. A clean PDF hiding revisions does not establish visible-revision quality.
- No complete publicly reproducible log package for that run is in this repository. Do not search the predecessor's local files; rerun and retain transferable evidence. These descriptions are diagnostic leads only.
- A historical static statute check reported 29 instruments, with ten effective-date sources awaiting human confirmation. This does not certify legal correctness or currency.

## Executable steps and parallel ownership

Difficulty estimates are for allocation, not promises. Record changes, checks and evidence per step. Every behavior change requires its own live verification before final integrated acceptance.

| Step | Work/deliverable | Dependency, difficulty and acceptance |
|---|---|---|
| 1 | Retrieve team and locked member sources; inventory later commits/local changes; establish plan/tasks | Small; explicit baseline/ownership, no resetting others' work |
| 2 | Map conflicts to all consumers and propose coordinated fixes | Medium; cover shared rules, ontology and six members, not README alone |
| 3 | Independently review provenance, scenarios and oracle; prepare blind inputs | Parallel with 2; medium; justified expectations, no answer leakage |
| 4 | Start one authorized dev instance; install baseline and probe submission/delegation/artifacts | Parallel with 2/3; medium; record build/model, avoid multiple heavy instances |
| 5 | Align shared/member flow, evidence handoff and O4 isolation | After 2/4; large; independent review and live dispatch/false-candidate verification |
| 6 | Correct oracle and needed scoped guards, preserving historical measurement identity | After 3; medium; explicit positives, negatives and gates |
| 7 | Validate intake/extractor minimal loops and supplementary materials separately | After 5/6; medium; distinguish missing/unknown/not-applicable with source evidence |
| 8 | Validate risk/jurisdiction separately, then actual O3 parallelism and referral | After 7; medium; negative cases and scope boundaries pass |
| 9 | Test O4 with wrong, unlocatable and omitted candidates | After 8; medium; independent source work and complete result categories |
| 10 | Repair O5/lead reconciliation; test pending reports, recovery and file access | After 9; large; ledger matches artifacts, no endless business-decision wait |
| 11 | Complete autonomous DOCX and source/revision/accept-reject/visual checks | Export probe may start early; integration after 10; hard; manual repair is not a pass |
| 12 | Freeze versions; run representative scenarios three times each and authorized real contracts | After 7–11; hard; stable categories, no mandatory misses/forbidden false positives |
| 13 | Update versions/locks/bilingual docs; reviewed and tested PRs in each owning repository | After 12; verify canonical content hashes, never invent them |
| 14 | Update marketplace source; install into a separate fresh instance and complete newcomer delivery | After 13; hard; verify versions, model, actual calls, reports and DOCX |
| 15 | Separately test existing-instance upgrade/recovery; audit evidence and release claims | After 14; medium; preserve originals, do not certify untested scope |

Suggested parallel ownership: coordinator owns the plan/integration; rules/member worker owns 2/5; evaluation worker owns 3/6; platform/export worker owns generic capability diagnosis in 4/11. Avoid overlapping files. Every delegation needs baseline, background, goal, source entry points, owned files, exclusions, acceptance and evidence location, plus instructions to preserve others' edits. Independent review cannot be replaced by implementer self-review.

## Platform boundary, environment and safety

The platform supplies installation, file access, delegation, model routing, tools and artifacts. The team owns contract facts, legal/commercial reasoning, coverage and revision proposals. Check attribution first: denied access, wrong parameters or a member failing to use a tool do not automatically justify a platform patch.

Before platform changes, read that environment's DesireCore AGENTS.md, architecture and relevant module/API. Use a different agent for review and rerun live tests after fixes. This team's baseline PR target is main; platform targets follow its own conventions.

Do not run all tests or uncontrolled parallel workloads. Scope platform tests to affected areas. Existing team static commands:

```sh
npm ci
npm run check:gates
node shared/resources/jurisdiction-packs/jurisdiction-cn/statutes/check-temporal.mjs
```

These do not call models, inspect DOCX appearance or certify legal accuracy. Do not change security software or make Defender investigation a prerequisite for functional acceptance; record concrete errors if an operation is blocked.

No credentials, tokens, private contracts or machine paths are included here. Use authorized login in the successor environment. If credentials, platform source access or real-contract permission are missing, request only the specific missing prerequisite and continue independent work. Sanitize published evidence; never commit secrets.

## Evidence and final delivery

For new runs retain team/member commits and hashes, pack versions, client build, provider/model, input provenance/hash, role/jurisdiction/goal, run identity/times, actual member receipts, artifact hashes, assessment, interventions and real/simulated/pending decisions. Use authorized accessible evidence storage; commit sanitized acceptance reports and stable references when appropriate. Do not imply old local evidence has been uploaded.

DOCX must be team-generated. Reject all changes and compare with the source; accept all and compare with proposed wording; show all revisions and inspect text, tables, numbering, attachments and pagination page by page. Report synthetic, public-template and authorized real-contract results separately.

Deliver merged PRs, actual release/marketplace versions, reproducible acceptance reports, three-run consistency results, real-contract and DOCX evidence, limitations and recovery instructions. Missing external authorization remains an explicit incomplete item, never a fabricated pass.

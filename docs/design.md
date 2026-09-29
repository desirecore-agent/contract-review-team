---
last-reviewed: 2026-09-29
---

# Design and verifiable outcomes

[中文](design.zh-CN.md) · [Quickstart](quickstart.md) · [Testing](testing.md)

Published baseline: team 0.1.37 and [members.lock.json](../members.lock.json); this branch's oracle/workflow changes remain an unreleased candidate. This is a design and acceptance description, not a claim of production readiness.

## Responsibilities and calls

The intended orchestration is **O0 register → O1 intake → O2 extract → O3 jurisdiction/risk in parallel → O4 independent review → O5 scoring, report and DOCX → lead delivery**. O4 and O5 are separate calls to the same `review-reporter` identity, not additional team members.

| Step / owner | Smallest independently checkable outcome | Good / unacceptable completion |
|---|---|---|
| O0 / lead | Source/version identity, work scope and coverage ledger | All calls address the same source and known gaps; mixing versions or inferring coverage from returned findings fails. |
| O1 / intake | Input inventory, gate decision, reasons and next action | Every input issue has evidence; missing material remains visible. Treating unresolved facts as complete fails. |
| O2 / extractor | Located clauses and comparable facts | Each extracted value is traceable; missing, unknown and inapplicable stay distinct. An invented value or unsupported “absent” fails. |
| O3 / auditor | Jurisdiction, supported scope and rule-backed observations | Out-of-scope jurisdiction receives referral and no substantive legal conclusion. Treating CN-only scope as a missing foreign pack fails. |
| O3 / scanner | Supported risks, severity and proposed actions | Material risks and negative controls are checked. Confusing an unfavorable existing clause with an absent clause fails. |
| O4 / reporter | Fresh source verification of each candidate fact | Every item is confirmed, refuted, unlocatable or additional; upstream reasoning is excluded. Echoing prior conclusions without source verification fails. |
| O5 / reporter | Explained score, actionable report, pending decisions and revision artifact | Findings, proposed changes and unresolved matters are traceable. A score without rationale or a claimed but absent DOCX fails. |
| Delivery / lead | Accessible final artifacts and honest completion status | Report limits and remaining work are explicit. Tool completion alone or manual intervention labeled autonomous success fails. |

These are natural-language goals and quality criteria. Machine-readable formats may support existing tool interfaces, but a syntactically valid record does not establish a good review.

## Consistency means stable decisions

Each invocation needs the same identified source, party perspective, review purpose, scope, relevant rules and completion criteria. Carry evidence and unresolved facts, rather than an entire prior reasoning transcript. Verify the actual selected provider/model for delegated calls.

Comparable inputs should produce comparable **result categories**: intake passed/conditional/blocked; evidence verified/unverified; risk findings versus no supported finding; in-scope/out-of-scope; report delivered/pending decisions/delivery failed. Wording need not match. Business results should not be forced into a new universal schema.

No prompt can guarantee perfect execution on every call. Test stability with three independent runs at fixed versions and compare source identity, required discoveries, prohibited false positives, scope, pending decisions and artifact integrity. A change in category needs a supported explanation.

## Existing rules and unresolved conflict

[shared/rules.md](../shared/rules.md) declares precedence and still specifies a fixed seven-step sequence. [Business rules](../shared/resources/business-ontology/rules.md) retain related legacy constraints. They do not fully describe the O0–O5 design above. This documentation change does **not** replace those injected instructions or prove that conflicts are resolved.

Conceptual mapping: legacy parsing/completeness → O1; extraction → O2; jurisdiction/risk → O3; version comparison belongs to the applicable source comparison and reporting work; reporting → O5. O0 registration and O4 independent verification need explicit runtime treatment. The legacy ban on combining/reordering steps requires a separately reviewed behavior change and runtime regression.

Likewise, inherited “confirmed facts” are candidates for O4 re-verification, never permission to skip its independent checks. Approval modes govern tool use; contractual acceptance remains an explicit decision. The desired product delivers a pending-confirmation report without waiting indefinitely for business decisions. Tests may provide clearly labeled simulated answers without representing real authorization.

## Platform and team boundary

The platform provides generic installation, source access, delegation, model routing, tool execution and artifact delivery. The team owns contract reasoning, scope, evidence, coverage, scoring and proposed wording. Fix content defects in member/rule assets; fix generic capability failures in DesireCore. A local helper script can diagnose an export problem but cannot stand in for the team's successful export.

## Evidence status

Historical local C07 observations from September 15–16 showed O0–O4 and partial O5, with `desirecore-cloud/qwen3.8-flash`, 38 confirmed items and two additional findings. The reported 62/100 is a contract score. C07 is synthetic. YAML was manually repaired and the DOCX was generated by an external script. A clean PDF export did not demonstrate visible tracked-change rendering.

The repository does not contain a publicly reproducible run-log package for those observations. They support investigation, not autonomous full-flow, real signed-contract or production-ready claims. [Testing](testing.md) defines the evidence needed to close those gaps.

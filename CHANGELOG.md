---
last-reviewed: 2026-10-04
---

# Changelog

[中文详细记录](CHANGELOG.zh-CN.md)

## Unreleased — normalized oracle/workflow candidate

- Preserve the published team locks (0.1.37 when this candidate was formed; the 0.1.40 locks after merging main on 2026-10-29) and add C09a/C09b to the normalized 14-file oracle, with explicit R7/R9/R1 positive, prohibition, mapping, and source-binding guards.
- Keep the upstream live-run report as non-normative provenance; no live pass is inherited for this candidate.
- The eighteen 0.1.40 model-service stop regressions are bound to the old rules (rules SHA-256 `242bba06…`). This branch rewrites sections one and two and links section zero to the `verdict` meaning, so that evidence is not inherited; rerun `check-model-service-stop.live.ts` before release.
- Reorder the lead's `llm.reasoning` key to the platform's registration-time normalized form so a fresh install is not immediately marked diverged; intake validates `detail.yaml` syntax and writes `verdict_label` only in the detail file.
- Add shared-rules section 3.2 on tool usage: declare `is_regex` for regex searches, batch-verify quotes with `literals`, pass `FileDigest` paths as an array, reuse the Lead's Plan when delegated (isolated O4/O5 calls read only their allowlist), and advance one check per reply: write an artifact skeleton first, rewrite each fixed row in place or append at a unique anchor with `Edit`, and never rewrite the whole artifact at delivery (JSON files, machine receipts and the clause extractor, which has no `Edit`, are exempt). In the 2026-10-29 live run the members that ran redid calls with wrong arguments; after gathering evidence the risk and jurisdiction branches synthesized everything in thinking on each reply, most requests longer than about five minutes were cut mid-stream by the cloud, and each branch lost over three hours without writing a byte. Member-side companions (to be relocked): the lead's O3 task no longer widens member scope, waits for the other branch when only one reports, and resumes a failed branch first; the intake, risk and jurisdiction skills adopt this write pattern; the risk scanner's persona and principles now match its bounded skill.
- Add rule 6 to shared-rules section 3.2: keep each `Write` content or `Edit` `new_string` under about 3,000 characters, split larger output into a skeleton plus several `Edit`s, and never rewrite an artifact with `Write` once the skeleton for its id exists, including a named re-delegation; other long tool arguments such as delegation task text should stay concise too; rule 5 drops the clause-extractor exemption, and machine receipts over the limit are written in parts as each skill specifies, with no comment left at delivery. In the 2026-10-30 live run the cloud model emitted tool arguments only after generating them in full, the connection stayed silent meanwhile, and the platform declared the stream dead after 90 seconds: in its first delegation the intake member prepared to write its whole detail file in one call seven times and was cut each time; the clause extractor (whose agent.json did not allow `Edit`) rewrote its whole checkpoint after every extracted item and spent 72 minutes on O2; and the jurisdiction branch reported delivery right after its conflict check although no receipt file existed. Member-side companions (to be relocked): the clause extractor gains `Edit`, writes a skeleton first and fills one category per reply, treats `deferred` as a placeholder only and Greps for it before sealing; the intake moves its skeleton-first rule and `intake_id` format ahead of S1 and splits an oversized receipt; the jurisdiction and risk branches label their write steps with letters so they are not confused with J1–J5 and R1–R5, self-check unfinished fields before delivery with a Grep pattern that neither depends on indentation nor contains backslashes, and report only artifacts they actually wrote and read back; the risk branch only records hits in step B and writes lexicon rows in batches of about 3,000 characters; the O4 receipt holds one line per candidate and is filled line by line with `Edit`, and the lead adds the O4 receipt to its read allowlist; O5 appends action items and export attempts line by line; the lead updates its coverage matrix only from verified artifacts and receipts, treats a member's claimed completion with a missing receipt or unwritten skeleton fields as a failed report, resumes first, and, when the platform refuses because the run ended normally, re-delegates naming the artifact id to continue, stating only the verified facts and never copying the member's claimed results; the jurisdiction, risk, clause and intake members treat such a named re-delegation as a resume.

## 0.1.40 - 2026-10-04

- Add lead-owned model-service prerequisites before delegation and stop-before-call instructions; operators confirm the configured route, availability, processing authorization, provider terms/licensing and separate costs before submitting materials.
- Unavailable or unverified prerequisites retain the existing blocked/null handoff behavior and only a bounded capability-debt statement. No new member versions or tool permissions are introduced.
- Static guards and eighteen live model-turn stop regressions pass; see docs/validation/2026-10-04-model-service-stop.md. Full Agent Service integration, marketplace installation and real-contract acceptance remain unverified.

## 0.1.39

- Declare nested member display as the team default; explicit user choices override it. Requires platform support before marketplace publication.

## 0.1.38 - 2026-09-30

- Add transparent photorealistic portraits for the team and all six members. Pin the corresponding member commits, versions, and content hashes; no review behavior changes.

## 0.1.37 - 2026-09-29

- Pin intake 1.0.7: validate receipt YAML with StructuredFileValidate against a schema shipped with the skill; the old "no parser, no passed" fallback made `passed` unreachable while its own receipts failed to parse twice. S8 version-unavailable flags no longer count as verdict-affecting.
- Pin lead 1.0.22: allow StructuredFileValidate and UnderstandImage. Delegated sessions are capped at the delegator's tools, so members silently lost both.
- Add `shared/resources/check-member-tool-ceiling.mjs`, C09a/C09b attachment-manifest corpus (`make-c09.py`) and `testdata/contracts/check-evidence.mjs`; record the 2026-09-29 real-machine baseline in ground-truth.
- Correct the lock: the previous intake commit was outside main history, and clause-extractor/review-reporter content hashes did not match their locked commits (verified with the platform's `computeMemberContentHash`).
- Includes the documentation correction below.

## Documentation correction 2026-09-29 (released in 0.1.37)

- Add paired onboarding, design/KPI, testing and maintenance guides; correct provenance, counts and links.
- Reconstruct 0.1.33–0.1.35 from Git history and reorder entries; correct the historical R02 authenticity claim.
- No team, member-lock, model, injected-rule or oracle changes. Runtime conflicts and acceptance gaps remain explicit.
- Entries below summarize the corresponding detailed Chinese history. This is not a claim that all historical versions were recorded; consult Git for gaps. Historical test claims do not establish current-version revalidation.

## 0.1.36 - 2026-09-15

- Pin intake 1.0.6: record foreign jurisdictions as out-of-scope, continue general document governance and require referral; distinguish a wrong pack for a supported jurisdiction.

## 0.1.35 - 2026-09-15

- Pin lead 1.0.21 and record O0–O5 in the team description (1103baf). Legacy shared seven-step instructions remain unresolved.

## 0.1.34 - 2026-09-15

- Pin lead 1.0.20 for redline-delivery reconciliation (f73c20a); 92cb41f subsequently pins the full source commit.

## 0.1.33 - 2026-09-15

- Pin lead 1.0.19 to expose redline export to the supervisor (948f61c, PR #42).

## 0.1.32 - 2026-09-15

- Pin lead 1.0.18: update the coverage matrix from real member receipts and reconcile row states and totals before delivery.

## 0.1.31 - 2026-09-15

- Pin intake 1.0.5: permit scoped unsigned-draft assistance only when materials and request establish that scenario; other missing execution evidence remains fail-closed.

## 0.1.30 - 2026-09-15

- Pin reporter 1.0.6: enable ExportRedlineDocument with unique source anchors and real insertion/deletion records; retain Markdown and explicit failure state if export fails.

## 0.1.29 - 2026-09-15

- Pin lead 1.0.17: use outcome-based O0 checks; allow one FileDigest correction, preserve frozen_without_digest and continue factual review when appropriate; remove mandatory coverage-skill dependency at O0.

## 0.1.28 - 2026-09-15

- Pin lead 1.0.16 for bounded O0–O4 orchestration and receipt/artifact reconciliation; jurisdiction auditor 1.3.0 for at most five evidenced observations; risk scanner 1.1.0 for bounded checks and candidates.

## 0.1.27 - 2026-09-15

- Pin extractor 1.1.0: deliver a minimum fact checkpoint before bounded enrichment; preserve unknown, blocked and capability debt; remove self-delegation and return artifact receipts to the lead.

## 0.1.26 - 2026-09-08

- Pin lead 1.0.14 for isolated synchronous intake delegation and intake 1.0.3 for distinct missing-body versus missing-authoritative-manifest handling; align ontology and add intake consistency guard.

## 0.1.25 - 2026-09-08

- Pin lead 1.0.13: set top-level and Smart reasoning to auto to avoid forced thinking budgets on the cloud Anthropic-compatible interface.

## 0.1.24 - 2026-09-08

- Pin lead 1.0.12: before documents arrive, request materials and scope without tool calls, historical workspace scans or dispatch.

## 0.1.23 - 2026-09-07

- Pin intake 1.0.2: require safe block YAML; preserve yaml_unverified when no parser is available.

## 0.1.22 - 2026-09-07

- Pin extractor 1.0.6: require same-source quotation evidence, early skeleton persistence and read-back verification before handoff.

## 0.1.18 - 2026-09-07

- Pin lead 1.0.10 with canonical artifact root and workspace handoff; extractor 1.0.5 strengthens YAML rejection and parse-failure closure.

## 0.1.17 - 2026-09-07

- Pin reporter 1.0.4: write final reports under the lead-provided canonical root and reject ambiguous or out-of-scope paths.

## 0.1.16 - 2026-09-07

- Pin reporter 1.0.3 and extractor 1.0.4 for canonical output paths, block YAML and parse gates.

## 0.1.15 - 2026-09-07

- Pin lead 1.0.9: establish and read back the contract-review output root; reject uncertain or escaping paths without silent fallback.

## 0.1.14 - 2026-09-07

- Pin risk scanner 1.0.4 and risk-scanning 1.0.1: prohibit nonempty flow YAML, quote special scalars and stop handoff on failed validation.

## 0.1.13 - 2026-09-07

- Pin reporter 1.0.2: read back and validate the scorecard, rejecting invalid or ambiguous YAML.

## 0.1.12 - 2026-09-07

- Pin lead 1.0.8: read actual pack metadata at registration and use cn-v3 for matching mainland-China cases.

## 0.1.11 - 2026-09-07

- Pin lead 1.0.7: provide canonical submission, frozen facts, pending items, blocks and artifact references to independent review; reject legacy field aliases.

## 0.1.10 - 2026-09-07

- Pin lead 1.0.6: include an absolute readable intake receipt in extractor handoff and update the locked source/digest.

## 0.1.9 - 2026-09-06

- Pin extractor 1.0.3: persist an initial skeleton after the first readable contract fragment, then checkpoint and record failure marks.

## 0.1.8 - 2026-09-06

- Separate scope facts from blocking attachment defects; inspect only the selected dispute-resolution branch; intake skill 1.0.1 addresses the synthetic filled R02 scenario. Normalize Windows guard paths. The old description of R02 as a real executed contract was incorrect.

## 0.1.7 - 2026-09-06

- Move out-of-scope handling into always-injected rules after inconsistent historical runs; repair additional gate spellings and a control-character bug in the checker. Pin lead 1.0.5 and risk scanner 1.0.3.

## 0.1.6 - 2026-09-06

- Align gate values and ontology admission with passed/conditional/blocked; define their scope and null-handoff stop semantics. Add the gate checker and mutation checks. Replace nonexistent command-authority target IDs and relock all six members.

## 0.1.5 - 2026-09-06

- Pin extractor 1.0.2 and update source commit and v3 digest.

## 0.1.4 - 2026-09-06

- Pin lead 1.0.2 and update source commit and v3 digest.

## 0.1.3 - 2026-09-06

- Update the lead source/version for explicit Delegate Work Context, fan-out context and continuation constraints.

## 0.1.1 - 2026-09-01

- Add MIT license and review disclaimer; align member gate values and label fictional entities as examples.

## 0.1.0 - 2026-08-31

- Initial six-member team with the historical seven-step description, input governance, isolated review, coverage matrix, Human Gates, attachment-aware comparison, layered resources and 29 risk triggers.

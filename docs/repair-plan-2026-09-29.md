# Contract review team: defect repair follow-up (2026-09-29)

[中文](repair-plan-2026-09-29.zh-CN.md) · [Previous evidence ledger](acceptance/takeover-2026-09-29.md)

> The latest continuation integrates remote `346343b` / 0.1.37; see [upstream/checker acceptance](acceptance/continuation-2026-09-29.md). GO, member counts and unchanged-lock statements below belong to the earlier e1837f2 repair snapshot, not verified compatibility with the new upstream members.

Source/evaluation repairs have independent GO; release remains NO-GO. See the [new acceptance record](acceptance/followup-2026-09-29.md). The original commit tool accepted this round's team changes; six members have new draft-branch commits. Published locks and model configuration remain unchanged. The starting remote main was e1837f2931ec077b7bf522f5c223c0af5df840cf and the initial seven PRs were unchanged open drafts; those are starting observations, not final candidate heads.

## Ownership and acceptance

The oracle implementer owns only the oracle, its guard/tests and dedicated helpers, and the source-correction note. All 69 historical mandatory detections/prohibitions must bind actual current targets; wrong category, polarity, optionality and evidence must fail. Preserve parsed history and all 12 source contracts.

The member implementer owns six member behavior/test/interface assets and the canonical-path checker. Validate actual receipt schema/decision/examples and cross-member, cross-run paths. Do not change models, approvals, security or tool permissions.

The coordinator owns plans, isolated-test tooling, bilingual evidence, archive and authorized Git actions. A separate reviewer reads the frozen candidate and writes only a review report. Implementation self-assessment never substitutes for independent review.

## Review outcome and second correction

The first current candidate recorded 67 team, 47 isolated member, four production-catalog preflight and 35 platform passes. Independent review still found five oracle P1s (malformed inputs, omitted current obligations, unrelated evidence, non-executable scope changes and contradictory polarity) and two member P1s (receipt/tool validity mismatch and a helper using a fictional dispatch shape). Green fixtures therefore did not close the source gate.

The second correction separates historical preservation from the supported present scope, enforces actual mandatory targets and evidence bindings, and reconciles Lead with the real validator report and receipt schema. Test-only reporter normalization must not be advertised as runtime enforcement. The coordinator also fixed skip accounting and missing source-helper copying; 15 harness regressions pass, including real Node processes and runtime-workspace exclusion. The earlier independent harness review covers the original 14 tests and phantom-tool removal; the subsequent independent preflight review approved the 15-test harness and source-copy change.

Final review closed the remaining oracle binding-freeze P1: 46 oracle plus 34 workflow checks pass. Member review reports zero P0/P1; isolated member suites pass 49 tests, explicit cross-member preflight four, and production-catalog preflight four. The fixed clean-source candidate lock has now been generated for all six members. After review, two test files received whitespace-only ending cleanup, rechecked with 52 tests; the diagnostic lock tool gained a bounded evidence-run name so both runs remain preserved.

## Gates

Reproduce, repair, run affected and isolated tests, then independently review and repeat affected validation for fixes. Recheck exact remote heads before updating draft PRs. Do not bypass the prior team-commit denial through another command or API. Live validation requires an explicitly bound authorized instance; never scan other instances or reuse the lost endpoint.

Removal of the nonexistent ExportRedlineDocument declaration was an explicit prior candidate decision. Review that decision using the complete authorization context and real platform catalog, not by restoring a fictional capability. Generic export, digests and externally generated documents do not prove autonomous redline DOCX delivery.

Published locks, market version and model configuration remain unchanged. Real dispatch, three-run consistency, authorized real contracts, autonomous DOCX and clean-install acceptance require separate new evidence.

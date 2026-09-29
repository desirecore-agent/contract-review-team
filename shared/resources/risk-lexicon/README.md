---
last-reviewed: 2026-09-29
---

# Risk trigger lexicon

[中文](README.zh-CN.md) · [Resources](../README.md) · [Design](../../../docs/design.md)

[pack.yaml](pack.yaml) declares lexicon-v1, knowledge date 2026-08-31 and 29 entries. [Chinese](triggers-zh.yaml) and [English](triggers-en.yaml) use the same IDs. Derive pattern and counterexample counts from the YAML rather than copying historical inconsistent totals.

A keyword match is a candidate, never a finding by itself. This lexicon supplies commercial observations; jurisdiction-auditor owns legal validity. It complements missing-clause and benchmark checks.

If our party/role is not established, keep role-dependent risk judgments unknown rather than guessing who bears the obligation.

## Five-step evaluation

| Step | Required outcome |
|---|---|
| M1 | Locate candidate wording using keywords/patterns |
| M2 | Check qualifiers, counterexamples and suppression conditions |
| M3 | Resolve using the entry's route and required evidence |
| M4 | Record source clause/location, severity and concrete action |
| M5 | Deduplicate; record checked/non-triggered coverage without inventing risks |

Resolution routes are element_check, symmetry_check, direct, benchmark_compare, defer_to_jurisdiction and defer_to_version_comparison. The first three can resolve within scanner scope when evidence suffices (direct is unused in v1). Benchmark comparison needs an extracted value and a documented benchmark. The two defer routes require the appropriate downstream evidence, not a scanner-created substitute.

Locate referenced attachments and schedules before declaring a value missing. C06b's benchmark location is a synthetic regression case, not a real contract precedent. See the [corpus](../../../testdata/contracts/README.md).

## False-positive controls

Counterexamples contain form/example/why_not_risk, with at least two per entry. Check contextual meaning: subcontractor liability is not inherently a risk; an “exclusive jurisdiction” phrase is not an exclusive license; assigning personnel is not necessarily assigning the agreement; “promptly within ten days” is not an unbounded deadline.

The seven forbidden shortcuts are: treating any liability cap as a risk; subjective force-majeure breadth; treating symmetric assignment restrictions as one-sided; inventing a numeric risk without an extractable value; unsupported “unfavorable” judgments; flagging ordinary notice/severability/entire-agreement/counterpart boilerplate; and scanner conclusions about legal validity.

## Bilingual maintenance

For each ID keep category, severity, resolution, recommended_action, human_gate, benchmark_link, missing_clause_link, dedup_group and requires_symmetry_check semantically aligned. Language-specific titles, keywords, patterns, qualifiers, counterexamples and notes may differ naturally.

Start changes from a failing case: choose the resolution, add positive and negative examples, update both languages and metadata, then run scoped guards and affected agent regressions. Never invent benchmark thresholds or take over jurisdiction, comparison or scoring responsibilities. See [maintenance](../../../docs/maintenance.md).

This is explanatory documentation. It does not resolve the shared seven-step/O0–O5 runtime conflict or prove false-positive rates.

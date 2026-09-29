---
last-reviewed: 2026-09-29
---

# Shared review resources

[中文](README.zh-CN.md) · [Team design](../../docs/design.md)

These files provide reusable review knowledge. They are not proof that every check ran or that the legal corpus is current. The repository design guide replaces the previously referenced, untracked .design blueprint; it is not a reproduction of a blog article.

## Inventory and scope

| Path | Role |
|---|---|
| business-ontology/ | Contract concepts, relations, actions, invariants and negative examples |
| jurisdiction-packs/base/ | General missing-clause and benchmark checks |
| jurisdiction-packs/jurisdiction-cn/ | Supported mainland-China pack, cn-v3 |
| jurisdiction-packs/jurisdiction-cn/statutes/ | Texts, index, temporal metadata and static temporal checker |
| jurisdiction-packs/jurisdiction-us/ | Existing resource, not a supported legal service of this team |
| jurisdiction-packs/custom/ | Organization-specific redlines |
| risk-lexicon/ | Bilingual candidate triggers and false-positive controls |
| severity-mapping.yaml | Severity mapping data |

The CN pack declares knowledge_base_version 2026-09-05; its older updated_at field is not an independent freshness guarantee. The statute index declares 29 instruments, 4,096 articles and 1,270,526 bytes. Read actual files and temporal metadata when evaluating a citation; counts do not establish legal correctness.

## Resource use

Read pack metadata before selecting resources. The conceptual precedence is custom over jurisdiction over base for configurable business policy. Custom policy cannot displace mandatory law. An override must identify the affected rule and explain its rationale; silence or a missing resource is not a passing result.

A risk trigger supplies a candidate, not a conclusion. The scanner must locate the original wording, consider qualifiers and counterexamples, and choose the documented resolution route. See the [lexicon guide](risk-lexicon/README.md).

The jurisdiction auditor owns legal applicability and source verification. Preserve the contract date, relevant legal-fact dates, law version, source and uncertainty. Do not infer applicability solely from whether a document appears in this folder. Missing or uncertain legal evidence requires explicit limitations or referral.

The reporter independently returns to original evidence; prior confirmed labels are not substitutes for O4 verification. The lead reconciles receipts and uncovered checks rather than inventing a member's completed work.

## Known design debt

The injected [shared rules](../rules.md) and [ontology rules](business-ontology/rules.md) retain fixed seven-step language, while the current member design uses O0–O5 with parallel observations. Shared instructions also contain both reuse of confirmed facts and independent re-verification language. This documentation does not override or repair those instructions. See [testing and open gaps](../../docs/testing.md).

## Maintenance and extension

1. Identify the source, intended consumers, rule ID and affected positive/negative cases.
2. Update the relevant resource and metadata in a separate behavior-change PR; keep bilingual trigger semantics aligned.
3. Check citations, dates, counterexamples and unintended policy overrides.
4. Run the scoped static guards, then affected member tests and a clean-install end-to-end review.
5. Record exact team/member/pack versions and evidence in the release report.

Adding a foreign-law folder does not enable that jurisdiction. Expansion first requires an explicit service-scope decision, qualified review of sources, coordinated instructions and referral behavior, then dedicated runtime acceptance.

Commands, locks, release and rollback are described in [maintenance](../../docs/maintenance.md). Static guards do not validate the full corpus or agent behavior.

---
last-reviewed: 2026-09-29
---

# Acceptance and evidence

[中文](testing.zh-CN.md) · [Design](design.md) · [Maintenance](maintenance.md)

This is a test protocol, not a completed acceptance report. Static guards and historical notes alone do not establish production readiness.

## Corpus provenance

Use the [corpus guide](../testdata/contracts/README.md) and [ground truth](../testdata/contracts/ground-truth.yaml) together, recording their exact commit. C01–C08 (including C06a/b) are synthetic. R01 is extracted from a public procurement template. R02 is an artificially filled and defect-injected derivative; R03 is a date/identifier derivative. None proves review of an actual signed customer contract. The filenames “real” and “executed” are not provenance evidence.

Real-document acceptance additionally needs an authorized, appropriately de-identified real contract, its source/permission record, preserved original and attachments, and independently reviewed expected outcomes. Do not describe a filled template as that test.

## Prepare a blind run

1. Freeze source files and hashes, team commit, member commits/content hashes, resource versions and app build. Define party, purpose, jurisdiction and comparison scope before starting.
2. Keep the oracle, expected findings and scoring answers outside the reviewing team's accessible test input. Supply only contract documents and ordinary user context. Evaluate outputs afterwards in a separate review context.
3. Start a new instance for the marketplace installation test. Record marketplace version, installed team and member versions, available cloud model, approval setting and any local overrides.
4. Define required discoveries, forbidden false positives, output categories and artifact checks before the run. Review conflicting historical expectations rather than silently choosing whichever matches the output.

## Test cases and decisions

| Case | What must be established |
|---|---|
| Clean/negative control | No forbidden risk finding; neutral description is distinguishable from a risk. |
| Missing input | Blocked intake identifies remediation; conditional intake continues with explicit limits. |
| Out-of-scope jurisdiction | No substantive foreign-law conclusion; referral and generic document checks remain available. |
| Known risks | All required findings are supported and actionable; an existing unfavorable clause is not labeled absent. |
| Version pair | Compare every provided component, including attachments; incomplete scope cannot support “identical”. |
| Supplementary submission | New attempt retains old outputs and explains affected/rechecked findings. |
| Pending business decision | Deliver pending-confirmation report; do not confuse contractual acceptance with report availability. |
| Export/tool failure | Surface failure and retain available report/evidence; do not claim a nonexistent artifact. |

Run each selected acceptance scenario **three times independently** at fixed versions and input. Compare categories, required findings, prohibited findings, scope, source anchors and deliverables; wording may differ. Report all three results, unexplained variations and manual interventions. A timeout or incomplete run remains incomplete, not a pass.

Tests may give explicit fictional user responses such as “simulation only: keep payment terms unresolved.” Store that fact in the evidence. Such responses exercise continuation and never authorize a real transaction.

## DOCX acceptance

1. The team must create and return an accessible `.docx` during its own run. External generation or manual repair is assisted evidence and fails the autonomous-delivery criterion.
2. Verify valid OOXML and genuine insertion/deletion records with appropriate revision settings. A `.docx` extension or highlighted text alone is insufficient.
3. In a compatible editor, reject all changes and compare the resulting text to the reviewed source. Accept all changes in a separate copy and compare it to the approved proposed wording. Disclose conversion/format normalization; check that no unrelated text or attachment was lost.
4. Display all revisions and inspect every page, including tables, numbering, headers and page breaks. Preserve visible-revision screenshots or renders. A clean PDF with hidden revisions does not establish revision-display quality.
5. Confirm proposed changes correspond to findings, unresolved choices remain labeled and the original file is preserved.

## Evidence record

For each run, retain source digest and provenance, team/member/resource versions, app build, provider/model, input prompt, run identifiers, start/end times, step outcomes, artifact paths/digests, evaluator results and every human repair. Record whether business decisions were real, simulated or pending. Publish only authorized, redacted evidence with reproducible links and commits.

Acceptance requires all prescribed checks to pass, no missing mandatory findings, no forbidden false positives, stable categories and complete autonomous artifacts for the claimed scope. Document exclusions rather than extending a narrow pass to unsupported formats, languages or jurisdictions.

## Current evidence limit

September C07 observations are local historical reports: O0–O4 and partial O5, contract score 62, manual YAML repair and external DOCX generation. No public reproducible run-log bundle is present. The old shared sequence and O0–O5 design still conflict; see [Design](design.md). Re-run after behavior changes before asserting completion. Static guards in [Maintenance](maintenance.md) do not perform any of the live-model acceptance above.

The 2026-09-29 C01/C09a/C09b runs (desirecore-cloud/kimi-k3, local instance) are recorded in the ground-truth comment block "C01 / C09a / C09b 真机实测基线". They were **not blind**: the corpus was read from the team directory, where ground-truth.yaml appears in directory listings (no member opened it). Each scenario ran once rather than three times. Treat them as regression evidence for the intake 1.0.7 / lead 1.0.22 gate fix, not as acceptance.

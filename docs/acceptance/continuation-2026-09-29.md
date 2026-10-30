# Upstream integration and checker repair acceptance (2026-09-29)

[中文](continuation-2026-09-29.zh-CN.md) · [Prior repair snapshot](followup-2026-09-29.md) · [Concurrent upstream boundary](concurrent-upstream-2026-09-29.md)

**Status: team-side source/fixture repairs GO; new-member compatibility, live models and marketplace release NO-GO.** Final independent narrow review reported 0 P0 / 0 P1 / 0 P2, limited to these checker repairs, not production acceptance.

## Baseline and ownership

This continuation preserves the already-dirty 0.1.37 integration rather than replacing subsequent work. Candidate starting HEAD: `9fe002a96d366ce9f3825f7dd9a6b442d794275e`; freshly observed main: `346343b63347f70603fe47c14887b6f1fb799275`. Draft PR #48 initially reported CONFLICTING.

The coordinator owns team checkers/tests, documentation and evidence/Git integration. Independent reviewers read the candidate and report findings without source edits. No member model, approval or credential configuration was edited. No predecessor-local evidence was accessed, and historical reports retain their original scope.

## Repairs and current evidence

C09 raw digests now agree among the source bytes, oracle and bindings, without newline normalization or modifying the test documents to fit an answer. The member checker verifies full locked commits, real repository roots, actual HEADs and exact committed agent.json bytes, not version equality alone.

Four fresh process-level counterexamples reproduced missing member-denied subtraction, empty allowed incorrectly treated as zero tools, omitted DelegateControl recursion exclusion, and a negative-only source omitted by the evidence index. All four now pass after repairs. Parent denied remains effective, none is deny-all, and unrestricted/wildcard policies are explicitly unverified by this finite static preflight. Optional ExportDocument gaps remain debt rather than satisfied export requirements.

The index generator includes every normative source, even negative-only or empty-literal cases. A declared source-digest mismatch fails before writing and preserves the prior index. Runtime does not regenerate away drift. Bilingual documentation retains upstream 0.1.37 facts, C09 two-line derivation constraints, R7/R9/R1 contrasts, check commands and single-run non-blind historical limitations.

| Fresh validation | Result | Scope |
|---|---:|---|
| Pre-fix team check | 103/103 | Demonstrates the earlier test blind spot, not absence of defects |
| Four added process-level counterexamples | Before: 0/4; after: 4/4 | Synthetic temporary Git repositories and inputs, not contract-team models |
| Final `npm run check` | 115/115; no failures/skips/cancellations/TODOs | Oracle/workflow, source identity/tool relationships and evidence index |
| Raw-source preservation | All 14 match upstream; original 12 also match initial baseline | Exact original bytes |
| Rebuilt index | 96 literals / 14 sources; byte-identical to reviewed index | New output, not overwrite |

The first independent review reported 0 P0 / 2 P1, confirming C09 and documentation preservation but rejecting the checker blind spots. Its fixture tests were blocked by EPERM in the read-only sandbox and are not passes. The coordinator freshly executed the 115 tests through the authorized test route. [Final independent source review](followup-evidence/continuation-final-independent-review-20260929.md) confirms both P1 findings closed and must not be described as independently rerunning those tests.

The [fresh test log](followup-evidence/continuation-team-final-20260929.log), [source/lock provenance](followup-evidence/continuation-provenance-20260929.json), [failing counterexamples](followup-evidence/continuation-regression-negative-20260929.log) and [passing rerun](followup-evidence/continuation-regression-positive-20260929.log) use the `followup-evidence/continuation-*` prefix. Failed and passing runs, source provenance and both review reports are retained. Published redacted copies receive their own byte digests.

## Upstream conflict integration and post-merge regression

Source repair commit: `c71363ecd16e788542309a561aee4c277f9db6a6`. Upstream integration commit: `7eb41e3f7e35d927ce1ead6974ddc25cd7482961`, with parents reviewed candidate `983a9b8f508614f2e94888397e64d8151d540d2b` and remote main `346343b63347f70603fe47c14887b6f1fb799275`. This integrates main into the candidate branch; it does not merge the PR into main.

Each of 17 conflicting paths retains the already upstream-integrated, independently reviewed and tested candidate content. Two automatically merged handoff release notes were retained with their outdated version statement corrected. Only those two documentation files differ from the reviewed snapshot; core source bytes are unchanged. A fresh post-merge `npm run check` again passed **115/115**, a rerun rather than 115 additional tests. The [new log](followup-evidence/continuation-postmerge-check-20260929.log) and [parent/content verification](followup-evidence/continuation-merge-provenance-20260929.json) are archived.

## Remaining gates

The official team metadata and lock retain exact upstream bytes. Access to upstream Lead `d5818345004e0920f9594ad55177b86738d1c123` and intake `02b654dc4e5b1bc24f0e9c55abb5ba95528031b1` source was previously blocked by the host safety check. No alternative command, Agent or channel was used to bypass it, and compatibility with those real member sources was not tested.

Real dispatch, O3 overlap, O4 out-of-scope negative tests, autonomous redline DOCX including accept/reject and page-by-page visual checks, three-run consistency, authorized real contracts, market fresh installation, upgrade and rollback remain incomplete. External prerequisites are authorized access to those source revisions, an explicitly bound controllable test instance and required human confirmations, and an authorized real contract with complete attachments and review goal. The redline export chain is unfinished engineering, not merely missing credentials.

0.1.37 is another upstream change's version declaration, not this continuation's marketplace publication. No production-readiness or merge claim follows from these checks.

## Reproduction

At the exact team PR commit, run `npm ci --ignore-scripts` followed by `npm run check`. Targeted commands:

```sh
node --test shared/resources/tests/member-tool-ceiling.test.mjs shared/resources/tests/evidence-index.test.mjs
node testdata/contracts/check-evidence.mjs
```

The real member check is separate: `node shared/resources/check-member-tool-ceiling.mjs --agents-dir <actual-member-parent> --lock <explicit-lock>`. Acquire and verify those source revisions before running it. Fixture success is not that acceptance.

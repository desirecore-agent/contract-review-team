# Oracle static preflight (2026-09-29)

> **Superseded as an acceptance conclusion by the later independent review.** The following is the implementer's historical preflight record, not current approval. A P1 remains in the actual category/polarity semantics of the 49 reframed mappings, and the final intake/path corrections postdate this note. See the [acceptance ledger](takeover-2026-09-29.md) and [independent review](evidence/independent-readonly-closure-review-2026-09-29.md). Fields claiming semantic preservation are not proof of it.

Status: corrected static preflight passed. This is not a live team pass, production acceptance, professional legal approval, or proof of autonomous delivery. The prior preflight pass only established that its then-current structural checks passed; it did not establish that the oracle's business expectations were correct. This correction occurred before the tested contract-team run and did not read tested output.

## Scope and isolation

The expectations were frozen from repository fixtures, provenance, generators, shared rules, and the independent expectation review before any tested-team output existed. No current-run team output was read or used to tune the answers. No C/R contract body was changed or regenerated, and no shared business rule, member, model, or release configuration was modified.

Current machine expectations live under `ground-truth.yaml#normative`. The complete prior oracle, including measured baselines and old gate values, remains value-for-value under `history.legacy_oracle`, whose parent is explicitly `normative: false`; the guard never treats it as a current answer.

## Fail first, then repair

The new guard was run before changing the oracle:

```text
$ node shared/resources/check-oracle-contract.mjs
✗ oracle contract check failed:
  - normative: must be an object with normative: true
exit 1
```

The repaired current layer exactly covers C01–C08 and R01–R03 and gives every case one canonical gate. C05/C07 are `passed + out_of_service_scope`: general governance and referral are allowed, while foreign-law substantive conclusions and foreign-pack remedies are forbidden. The original C08 execution-readiness request remains `blocked`; the separate `C08_negotiation_draft` records explicit user-request text and `execution_validation_requested:false`. When signature pending is the only issue and there is no other actual FLG/BLK, that draft intake is `passed`; unknown or undeclared purpose remains blocked under the original scenario.

Locked `contract-intake@1.0.6` S7.1 already defines “统一社会信用代码缺失 | FLG-PARTY-ID-ABSENT”. The correction now records `party_role` and `identifier_applicability` first: the R02/R03 buyer and seller are main contracting parties, so their missing identifiers keep the single `conditional` gate; the named witness also lacks an identifier, but its applicability stays `unknown` pending role clarification and is not hard-coded into the gate. Three counterexamples freeze `required`, explicitly excluded witness `not_applicable`, and unclear-role `unknown` behavior. Statutory legal effects still await professional review.

R7, R9, and an undeclared attachment reference remain separate scenarios. The explicit C06a→C06b comparison must detect the whole Attachment 2 replacement `SLA-v1.2 → SLA-v2.0`, while `global_coverage` remains `partial`, global direction `undetermined`, and local attachment direction `up`. R03 must expose the scope debt between its 2019 signing time and the library's 2025-revision/2026-effective material, while legal effect remains `pending_professional_review`. A single version with no requested baseline is `not_applicable` and emits no direction; `undetermined` is reserved for a requested comparison with insufficient scope.

The parsed historical JSON digest remains `1a17baa686385ee250e874b45a19696651cb797b889ccd400be0158b5a4e8cc6`. The guard derives all 69 historical `must_detect:true` and `must_not_flag` keys. Every key is either retained by ID or mapped to one or more existing case-local detection, false-positive, coverage, negative-search or scope targets. `reframed` prose without a real target fails. A genuine `retired` item additionally needs a source fact and independent review basis; no current item relies on retirement. Circular attribution to the implementation review fails.

All 49 `reframed` rows now state the historical category, polarity, and retained fact constraint. Mutations with a wrong category/polarity, or two unrelated meanings collapsed onto one existing ID without a preservation basis, fail. R01 again has two separate false-positive prohibitions grounded in its source: clause 2 is a procedural constituent-file list, not an attachment-delivery manifest; the `XXXX` buyer/seller/witness strings are placeholders, not inconsistent party names. Historical statutory-effect observations are retained only as source facts or `pending_professional_review`; they are not asserted as current-law truth.

The normative layer now restores per-case predeclared must-detect, must-not-flag, coverage, negative-search and applicability/scope targets. C03's three omissions, C01's key false-positive prohibitions, C04's three employment text facts, C05's coexisting law/forum/data text, and R02/R03's date/old-law-name/arbitration wording are stable targets. Unverified article and legal-effect conclusions remain separately pending. Severity may be asserted only with an applicable named source.

## Reproducible commands

```sh
node shared/resources/check-oracle-contract.mjs
node --test shared/resources/tests/oracle-contract.test.mjs
```

The test suite runs the real positive baseline and a deep comparison of the parsed history value. Its 31 cases include wrong-polarity/category and unrelated many-to-one mutations plus deletion of either restored R01 prohibition. Assertions check parsed semantics and actual diagnostics rather than source-string presence.

No platform-wide test or live model/team run was performed. The static invocation-event test is a local contract simulation, not proof that the platform runtime enforces scheduling. Real branch invocation IDs and terminal events still require authorized live confirmation. The team package files were not changed in this A2 correction.

The intake Draft-07 receipt contract now accepts the full declared receipt shape: per-party `party_role`, role source, identifier applicability/status/basis; four freeze dimensions; and separate consistency/compliance conclusion permissions. It rejects S7 `flag` with empty flags and `passed`, a missing role source, invalid not-applicable identifier claims, missing freeze fields, and consistency permission when a freeze dimension is false. Schema validity remains a machine handoff condition only, not a quality or legal-completion certificate.

## Review-A remediation results

Final scoped verification: oracle 31/31, workflow 34/34, and four member knowledge/parser files 8/8. Workflow coverage uses one typed terminal record for terminal event, settled receipt and ledger; success/failed/cancelled share one validator, wrong field types and cross-invocation reuse fail, and business subactions need not all succeed. This is a local contract simulation, not a platform executor. All 12 C/R contract bytes and the parsed historical JSON remain unchanged.

Live runtime behavior, independent legal conclusions, and autonomous team DOCX output remain unverified. A reviewer who did not implement these changes should perform the final frozen-diff review; lead/reporter candidates are outside this change and pass scope.

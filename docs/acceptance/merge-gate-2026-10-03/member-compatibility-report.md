# Member source compatibility integration

Scope: the six repositories under `workspace/sources`; no merge, rebase, reset, commit, push, team-lock change, frozen snapshot edit, platform-wide test, or real-device run was performed.

## Integrated candidate metadata

| member | starting candidate | upstream inspected | resulting unpublished version |
|---|---|---|---|
| contract-review-lead | c28919295c2ad611bf2ebee2ba4a4532b18ea1b9 | 24152ff38d6a82f310ca8659942869a5190c5707 | 1.0.23 |
| contract-intake | 6a43c714e599def32f0514d2071113dce4bb3d5c | 539fae49c26a366ddd23003fc43353cf5569e654 | 1.0.8 |
| clause-extractor | 01aba64dee10871fa3d697f42b8d1aa12e35ec94 | 67375b1997458ef29b146dabaa6ba8650b05829b | 1.1.1 |
| risk-scanner | 5d02c3177c3ee93706d726d40cceeafbb7e25de6 | 022bfd3ae880ec88c3a0407c1ae352d385bfff01 | 1.1.1 |
| jurisdiction-auditor | 2e37e0ae096f7b067bbab2d0b025ebe25eaecc86 | 2d016831427f3b85c044fef0781682ce0929acec | 1.3.1 |
| review-reporter | 678cbfaa49ac8d6c404160b65c415e07fabe4508 | 40aff0fca5ce9c6765a613f79e474ed42d9625af | 1.0.7 |

All six upstream `assets/avatar.webp` blobs were copied byte-for-byte and referenced from `agent.json`. Lead now exposes `UnderstandImage` through the parent ceiling while retaining `StructuredFileValidate`; the deliberately removed nonexistent `ExportRedlineDocument` permission remains absent. No other permission or approval value was expanded.

## Intake migration decision

The upstream schema and tests targeted an older nested/free-summary receipt shape. They were not copied over the candidate because that would remove the candidate's strict flat receipt, role-applicability rules, O0-O5 contract, write-once validation sidecar, and same-byte document/schema digest binding.

Instead, each new upstream regression was migrated to the live flat schema: exactly four S8 unavailable flags may coexist with `passed`; real business flags still require `conditional`; a BLK remains dominant; Draft-07 compiles under the platform Ajv options; malformed YAML and duplicate keys are rejected by the strict platform parser; Windows and POSIX absolute paths are accepted; validator/tool failure remains capability or serialization debt and never mutates the business verdict into automatic `conditional`.

The new schema regression file is part of the default `npm test` script and has no adjacent-repository dependency.

## Verification

Six member `npm test` commands passed: 54 tests, 54 passed, 0 failed (Lead 6; intake 28; extractor 2; risk 2; jurisdiction 2; reporter 14). Full TAP output is in `member-tests.log`.

For every member, parsed values of `llm`, `network_security`, `file_security`, `compute_credentials`, `tools`, and `env` match the starting candidate. A raw nonempty slice of each original `llm` object also matches byte-for-byte; hashes are recorded in `member-protected-after.log`. Avatar source/current hashes match and are recorded in `member-avatar-hashes.log`.

Unverified by design: real-device execution, real agent startup, model invocation, platform-wide suites, publication, formal team lock, Git ancestry resolution, and final reviewer/merge approval.

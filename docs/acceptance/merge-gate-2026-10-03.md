# Merge-gate verification and upstream compatibility repair — October 3, 2026, Los Angeles

[中文](merge-gate-2026-10-03.zh-CN.md) · [Evidence](merge-gate-2026-10-03/README.md)

The observations were made on October 4 UTC, October 3 in Los Angeles. The user authorized ordered source reconciliation, independent review, real-device/delivery acceptance, then eligible merges. **The member-source increment was repaired, reviewed and pushed to existing draft branches. Complete team integration and production acceptance remain incomplete; no production PR was merged by this run.**

## Newly observed baselines

Team main is now **0.1.39**, frozen at `440c28a494d1f06f2785552e57cca3f03cd4111e`. Upstream avatars, member pins and `memberDisplay: nested` were pre-existing work, not this run's release. The team functional candidate remains `126ece1aa7e9378a0c5c3adac9275b358d3d88d3`; subsequent root commits only document evidence, not integration of the new main.

Platform PR #3558 was already merged at `2026-09-29T13:58:40Z`, merge commit `f6a63865863135f6cda54ebaeeff7003bc855ac0`. Its historical CI snapshot was not all green. This run separately pinned current dev `5ad8fa4b0f3dd62bded6ce234a094915bb837d2e` for production-schema, catalog and canonical-hash preflight, not a platform-wide acceptance claim.

The previous member-source access restriction did not recur: ordinary Git fetch succeeded for all six sources. Fresh worktrees were checked out at the exact 0.1.39 published pins. HEAD/version/tree checks passed, and the official platform `computeMemberContentHashAt` reproduced all six published v3 hashes. Published and candidate locks remain separate.

A fresh remote read at `2026-10-04T04:31:27Z` matched all six new member heads, still Open Draft. Team #48 now reports `CONFLICTING / DIRTY`, superseding the prior MERGEABLE observation. Platform dev concurrently advanced to `a9f717f347ae5316471c84fd25a039cac7e62d69`; this run's checks remain scoped to `5ad8fa4...` and do not certify the newer dev.

## Repairs and review

The previous candidate Lead lacked `UnderstandImage`, truncating four members' effective tool requirements. Only this intended permission was added; `StructuredFileValidate`, denied permissions and protected settings were retained. The nonexistent `ExportRedlineDocument` declaration was not restored. Six upstream avatar blobs and references were preserved byte-for-byte.

Intake's new upstream S8 unavailable-version semantics and strict YAML/Ajv regressions were migrated into the existing strict flat receipt, without reverting O0–O5, same-byte validation binding or independent O4/O5 work.

Although the initial 54 member tests passed, independent complete compatibility review found two P1s: conditional receipts could stop with a null route, and S8 coverage flags could masquerade as business flags by flipping `gate_affecting`. Two new regressions failed before repair. The corrected schema requires conditional handoff to `contract-review-lead` and globally requires the four version-unavailable IDs to have `gate_affecting:false`. Normal passed, legitimate mixed conditional and blocking-priority cases still pass.

A separate authoritative evidence record supersedes an invalid empty-hash extraction attempt in the retained worker log. All six model raw blocks were nonempty and byte-identical to their pre-change Git HEAD; other protected configuration values and exact upstream avatar bytes were verified.

Independent incremental closure review accepted both P1 repairs and the evidence P2 correction. This is not represented as another full review, independent rerun of all tests, or runtime approval.

## Fresh results

| Scope | Result | Boundary |
|---|---:|---|
| Current team branch checks | 115/115 | Does not establish integration of main 0.1.39 |
| Six fresh isolated npm installations/tests | 56/56 | Lead 6, intake 30, extractor 2, risk 2, jurisdiction 2, reporter 14; no skips/failures/cancellations/TODOs |
| Lead against actual intake sources | 4/4 | Source integration, not live delegation |
| Current production tool parameter preflight | 4/4 | No model/tool business execution |
| Published exact-member canonical hashes | 6/6 | Not market installation |
| Committed candidate source/finite tool ceiling | Passed | Optional ordinary DOCX gap remains disclosed |

Repeated runs are not summed. The earlier 54, final 56 and separate intake 30 are not independent cumulative success counts.

## Saved member heads

All are ordinary pushes to the existing `optimize/contract-takeover-20260929` branches, not merges into main.

| Member | Draft PR | Exact candidate HEAD |
|---|---:|---|
| contract-review-lead | #23 | `2a6a63b2d4fd3e0c4606c2a08a21db65bfc74cba` |
| contract-intake | #11 | `25efa509b811e0f12f51ca0159ef5772585bdc31` |
| clause-extractor | #10 | `35a6ea9a578c97b8d7225a23d8a66ad3478f234e` |
| risk-scanner | #7 | `e712c7a724b53f0409afbc66153b1be83a2630df` |
| jurisdiction-auditor | #6 | `c65f6179dd7b4003328f301ff9b394f3fbf04a4a` |
| review-reporter | #8 | `5db3030fec8f9e4ad8e9bad464ff4e7d0aa2ec2d` |

The evidence candidate lock was generated with the current official platform function and lock schema. SHA-256: `16d9b507e98582c7d9d2d385a20b7eff994f4d27dcc71e5581502b74422a8b43`. v3 covers identity files; exact Git commits/trees fix complete skills and assets. No published lock was overwritten.

## Live probe and exact stopping points

A fresh native dev client was started from the pinned platform with independent runtime/HostAgent homes and telemetry disabled. The owned CDP witness and browser identity matched. The visible marketplace showed 0.1.39 as uninstalled. Its normal install button was clicked once.

**Post-install UI verification was blocked by the host safety check, so installation remains unconfirmed.** No alternative HTTP/filesystem route, other instance or repeated installation was used to infer success. The owned launch Job was stopped and its directory retained; this is not upgrade/rollback acceptance.

The root operation `git merge --no-commit --no-ff 440c28a...` was also blocked by the host. A read confirmed unchanged HEAD and no MERGE_HEAD. No alternative command, Agent or channel was used to bypass it. These are specific operation restrictions, not missing GitHub credentials or unresolved source access.

The current catalog/source provides ordinary `ExportDocument(path, format, output)`, not an established redline delivery chain. Ordinary conversion and digest checks do not establish autonomous tracked changes, accept/reject fidelity or page-by-page visual quality.

## Remaining gates and reproduction

No team/member PR was merged, no draft was promoted and no marketplace update was made. Still required: complete integration of current main and candidates; verified installation and actual user approvals; real O0–O5/O3/O4 behavior; autonomous tracked DOCX; three fixed-version isolated runs; an authorized real contract and complete attachments; fresh install, upgrade and rollback.

Reproduce with `npm run check` in the team branch, then the repository's `scripts/verify-member-candidates.py` against the six exact heads and a new output file. Lead integration uses `CONTRACT_INTAKE_SOURCE=<absolute-intake> npm run test:intake`; production preflight uses `CONTRACT_PLATFORM_SOURCE=<fixed-platform> npm run test:platform`. Run the member ceiling checker with explicit member directory and the evidence candidate lock.

The selected redacted evidence retains failed and passing runs, full and incremental reviews, and source identities. Runtime homes, credentials, private contracts and full raw Agent traces are excluded.

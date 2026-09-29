---
last-reviewed: 2026-09-29
---

# Maintenance and release

[中文](maintenance.zh-CN.md) · [Design](design.md) · [Testing](testing.md)

## Authority and versions

| File | What to verify |
|---|---|
| [team.json](../team.json) | Team identity, supervisor, members and distributable version: baseline 0.1.37. |
| [members.lock.json](../members.lock.json) | Each member's repository, exact commit, version and content hash. |
| [Shared rules](../shared/rules.md) | Instructions injected into members; behavior changes require runtime regression. |
| [Resources](../shared/resources/README.md) | Pack versions, scope, rules, statutes and provenance; read each pack's metadata. |
| [package.json](../package.json), [package-lock.json](../package-lock.json) | Local guard dependencies. The manifest currently says 0.1.30; this differs from team 0.1.37. Historical intent is not established here. |
| [CHANGELOG](../CHANGELOG.md) | Human-readable history; do not infer undocumented release contents. |

Repository content and marketplace records are separate publication surfaces. A merged team PR alone does not demonstrate a marketplace update or successful installation.

## Local checks

From the repository root, with Node and npm available:

```sh
npm ci
npm run check:gates
node shared/resources/jurisdiction-packs/jurisdiction-cn/statutes/check-temporal.mjs
node testdata/contracts/check-evidence.mjs
node shared/resources/check-member-tool-ceiling.mjs   # reads installed members; see docs/maintenance
```

Check the current directory first: `team.json` and `package.json` must be present. `check:gates` invokes the gate-literal and intake-contract guards. The temporal script resolves files beside itself and checks statute registration/temporal metadata consistency. `check-evidence.mjs` confirms every evidence string in ground-truth.yaml occurs verbatim in its corpus file; it is zero-dependency, and `check:gates` does not cover testdata. `check-member-tool-ceiling.mjs` confirms each member's tool allowlist lies within the supervisor's: a delegated session is capped at the delegator's tools and inherits its deny list, so a tool missing from the lead silently disappears from members. It reads installed members (`<root>/teams/<team>` beside `<root>/agents/<id>`); in a development checkout pass `--agents-dir <parent of member directories>`. It fails if any member cannot be read. None of these calls a live model, installs from the marketplace, validates every historical oracle entry, proves legal correctness or checks DOCX appearance.

Also check changed Markdown links, bilingual counterparts and stated counts/versions against source files. For corpus changes, recheck evidence quotations and version-pair invariants. Resolve known oracle mismatches explicitly and document their meaning; do not silently rewrite history to make a test pass.

## Member and resource updates

1. Make and review the change in its owning member or resource repository. State the affected goal, expected behavior and failure example.
2. Record the exact reviewed member commit and version in the lock using the supported DesireCore publishing/locking process. Verify its content hash using the platform's canonical implementation; do not invent a replacement hashing algorithm or copy a stale digest.
3. Check every listed member resolves to its expected content. Keep machine-local credentials and model preferences out of published assets. Whenever a member or the lead changes `tool_permissions`, run `check-member-tool-ceiling.mjs`.
4. Run the scoped guards and affected live scenarios. Changes to delegation, scope, evidence handling or export need the relevant end-to-end acceptance, not only text checks.
5. Update paired documentation and the change log with actual results and unfinished checks. A documentation-only correction does not close a runtime defect.

Adding a foreign-law directory does not expand this CN-only team's supported service scope. Any proposed scope change needs coordinated policy, knowledge, member behavior and acceptance work before publication.

## Publish, upgrade and recover

Use a reviewed PR in the team repository and follow its current branch protection. Record the merged commit and any actual release/tag; do not describe an uncreated tag as released. Update the corresponding marketplace entry through that repository's reviewed process, checking its team source and locked dependencies.

Then install through the marketplace into a fresh instance, verify team/member versions and hashes, and execute [acceptance](testing.md). Test an existing-instance upgrade separately, retaining source documents and prior review outputs. Record installation failures or local drift rather than claiming success from catalog metadata alone.

Before upgrade, preserve the prior team commit, member lock, marketplace reference and user artifacts. To recover, publish a reviewed revert or restore a known-good distribution using supported platform facilities; verify the resulting installed contents and re-run affected checks. Recovery must preserve user documents and explain any residual incompatibility.

## Open work

The shared seven-step instructions and O0–O5 design still require behavior alignment and runtime regression. Public reproducible full-flow evidence, repeated-run consistency, authorized real-contract validation and autonomous revision export remain acceptance work. Pending commercial decisions do not prevent delivery of a pending-confirmation report or explicitly simulated product tests. See [Design](design.md) for historical evidence limits.

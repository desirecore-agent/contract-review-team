---
last-reviewed: 2026-09-29
---

# Contract Review Team

[中文](README.zh-CN.md)

A six-member DesireCore team for evidence-based contract review. It separates intake, extraction, risk observations, jurisdiction analysis, independent review, and delivery. Its supported legal service scope is mainland China; foreign-law material requires referral, even when general document governance can continue.

**Status:** team 0.1.37. Documentation audited on 2026-09-29 against commit aa67148; 0.1.37 updates the intake and lead locks (see [CHANGELOG](CHANGELOG.md)). This is not a production-readiness certificate: unresolved shared-rule conflicts and incomplete end-to-end evidence are listed in [testing](docs/testing.md).

## Start here

- [Remote-agent optimization handoff and remaining work](docs/handoff.md)
- [Install and run your first review](docs/quickstart.md)
- [Design, member responsibilities and success criteria](docs/design.md)
- [Tests, evidence limitations and tracked DOCX acceptance](docs/testing.md)
- [Maintenance, release and rollback](docs/maintenance.md)
- [Shared resources](shared/resources/README.md), [test corpus](testdata/contracts/README.md), [change history](CHANGELOG.md)

Provide the original contract and attachments, your party/role, jurisdiction, and review goal. The lead should return evidence-linked findings, unresolved questions and actual artifact paths. A contract score is not a quality score for the team. Approval mode in the platform does not establish legal or business consent.

## Published baseline

[team.json](team.json) defines one supervisor and five members. [members.lock.json](members.lock.json) pins exact source commits and content digests; it is the installation reference.

| Member | Locked version | Responsibility |
|---|---|---|
| contract-review-lead | 1.0.22 | Register scope, dispatch, reconcile and deliver |
| contract-intake | 1.0.7 | Input completeness, frozen facts and gate decision |
| clause-extractor | 1.1.0 | Traceable clause facts and explicit unknowns |
| risk-scanner | 1.1.0 | Evidence-based commercial risk candidates |
| jurisdiction-auditor | 1.3.0 | Jurisdiction and applicable-law observations |
| review-reporter | 1.0.6 | Isolated independent review, then scoring and reporting |

O3 risk and jurisdiction work can run in parallel after extraction. O4 and O5 are separate calls to the same reporter, not an additional team member. Legacy seven-step shared instructions still conflict with this design; see the design and testing guides before treating execution consistency as established.

## Resources and validation

The CN pack identifies itself as cn-v3. Its statute index declares 29 instruments, 4,096 articles and 1,270,526 bytes. These are repository metadata, not certification of completeness, freshness or legal applicability.

The corpus has 14 contract files and 13 case IDs: eleven synthetic C-series files (C06 is a version pair; C09a/C09b are attachment-manifest derivatives of C01), a public blank procurement template R01, and generated derivatives R02/R03. R02 includes intentionally inserted defects; neither derivative is evidence of an executed customer contract.

```sh
npm ci
npm run check:gates
node shared/resources/jurisdiction-packs/jurisdiction-cn/statutes/check-temporal.mjs
node testdata/contracts/check-evidence.mjs
node shared/resources/check-member-tool-ceiling.mjs   # reads installed members; see docs/maintenance
```

These are static consistency checks, not agent or legal acceptance tests. The private tooling package still reports 0.1.30; the published team version comes from team.json. No version alignment is made by this documentation update.

## License and responsibility

See [LICENSE](LICENSE). This team supports review; it does not replace qualified legal advice, verify signatures merely from typed names, or authorize signing. Protect confidential contracts and verify applicable law, source evidence and final edits before use.

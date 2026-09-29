# 本轮可复验证据 / Reproducible follow-up evidence

[中文验收](../followup-2026-09-29.zh-CN.md) · [English acceptance](../followup-2026-09-29.md)

只包含本轮明确选择的源码验证日志、失败反例、独立审查及精确候选记录。运行实例目录、凭据、完整Agent轨迹与前任文件均不在此目录。机器路径与ANSI颜色已脱敏；provenance.json同时记录原始及公开副本SHA。脱敏副本不是原始字节，应按相应SHA区分。

## 最新上游整合续轮 / Latest upstream-integration continuation

[本次验收](../continuation-2026-09-29.zh-CN.md) / [Acceptance](../continuation-2026-09-29.md): `continuation-team-final-20260929.log` and `continuation-postmerge-check-20260929.log` each record the same 115 mandatory scoped tests, not 230 unique tests. Four real-process counterexamples changed from 0/4 to 4/4 and are included in the formal regression coverage. `continuation-final-independent-review-20260929.md` records source-only GO; it does not claim an independent fixture rerun or live acceptance. `continuation-provenance-20260929.json` binds all 14 source files and the upstream official lock. `continuation-evidence-manifest-20260929.json` records original/redacted digests; the post-merge log digests and exact Git parents are in `continuation-merge-provenance-20260929.json`.

## Earlier fixed-candidate records (not latest-member compatibility)

Final records: followup-team-check-reviewed.log (80), followup-isolated-members-final.json (49), followup-lead-intake-integration.log (4), followup-platform-schema-final.log (4), followup-platform-unit.log + resource.log (35), followup-harness-copy-final.log (15), followup-candidate-preconditions-final.log (8). followup-whitespace-recheck.log is a 52-test repeat after whitespace cleanup, not 52 additional unique tests. Earlier negative and NO-GO records remain historical evidence of this repair round.

## Candidate lock diagnostic reproduction

This utility is not part of the production platform. Use platform commit 1536138e8c71db71b906d436212812086268e3c9 with tracked source clean and installed pinned dependencies. Copy the three files under reproduction/ into that platform checkout's workspace/ directory, retaining their filenames. They import the official platform implementation, not a second hash algorithm.

```sh
# TEAM_SOURCE and PLATFORM_SOURCE are absolute checkouts; member sources are under TEAM_SOURCE/workspace/sources.
# All six member checkouts must be clean and at the candidate commits in the acceptance report.
cd "$PLATFORM_SOURCE"
DESIRECORE_HOME="$PLATFORM_SOURCE/workspace/fresh-candidate-hash-home" \
  node node_modules/tsx/dist/cli.mjs workspace/prepare-followup-candidate-lock.mts "$TEAM_SOURCE" reproduction-unique
```

The diagnostic home and evidence run name must be new. This writes a candidate lock and verification record under TEAM_SOURCE/workspace/evidence, never the published members.lock.json. The three-identity-file v3 digest is supplemented by exact Git commit/tree identity for the complete source. No install, user approval, model request, market publication or DOCX generation occurs.

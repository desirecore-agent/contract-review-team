# 本轮验收证据 / Merge-gate evidence

[中文报告](../merge-gate-2026-10-03.zh-CN.md) · [English report](../merge-gate-2026-10-03.md)

本目录只收录本轮明确选择的源码、测试、审查、分发身份与有限真机观察证据，不包含实例 home、凭据或客户私有合同。原始日志路径经脱敏，`.log` 副本使用 `.txt`；`provenance.json` 区分原始与公开副本 SHA-256。独立报告中的 `<team-workspace>` 等是脱敏占位，不是可访问 URL。报告自身的历史结论保留，不将 NO-GO 静默替换为 GO。

## 结果入口

- `isolated-member-tests-final.json`：六成员全新目录 56/56；first 是更早的 54 项范围，不累计。
- `team-current-branch-check.txt`：本轮当前团队候选 115/115；不宣称已合入新 main。
- `lead-intake-integration-final.txt`、`lead-current-platform-final.txt`：各 4/4；源接口前检而非真实委派。
- `independent-member-compatibility-review.md`、`independent-member-closure-review.md`：完整前审与针对其 findings 的增量收口，后者不冒称新全量审查。
- `intake-review-negative.txt`、`intake-review-positive.txt`：先两项失败，再默认 30 项通过。
- `member-protected-authoritative.json`：唯一最终 raw 模型块证据；明确废弃原 worker 的空摘要提取，不接受空串散列作为证明。
- `platform-distribution-preflight.json`：当前生产 Schema 和正式六成员权威 v3 摘要；无安装/模型执行。
- `members.candidate.lock.json`、`candidate-lock-verification.json`、`candidate-member-ceiling-final.txt`：已审阅新候选身份与工具检查；这不是正式分发锁。
- `current-external-blocks.json`、`dev-probe-summary.json`：操作限制、一次安装点击和未确认结果；测试启动任务已停止。
- `remote-status-after-member-push.json`：成员推送后的远端时点快照，后续根仓文档提交会正常推进团队 PR HEAD，不改变其功能源码。

重新执行时使用新证据文件和独立目录，不覆盖旧运行。来源检查、fixture 成功、真正业务成功和生产合并应分别判断。

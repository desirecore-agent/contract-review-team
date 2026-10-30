# 合并前核验与上游兼容修复（2026-10-03，洛杉矶）

[English](merge-gate-2026-10-03.md) · [证据目录](merge-gate-2026-10-03/README.md)

本轮实际观测为 UTC 2026-10-04，对应洛杉矶 2026-10-03。用户要求按最新源码兼容、独立审查、真机与交付验收的顺序推进，满足条件再合并。**本轮成员源码增量已完成修复、复审并推送 Draft；完整团队整合及生产合并仍未获验收通过。** 没有以 MERGEABLE、空 CI 或单元测试代替发布门禁。

## 最新状态与历史纠正

团队远端 main 已从此前的 0.1.37 推进到 **0.1.39**，本轮冻结 `440c28a494d1f06f2785552e57cca3f03cd4111e`。其新头像、成员锁与 `memberDisplay: nested` 为上游既有工作，不记成本轮发布。团队候选功能基线仍为 `126ece1aa7e9378a0c5c3adac9275b358d3d88d3`；本轮后续根仓提交仅登记报告和证据，不代表已合入新 main。

平台 PR [#3558](https://github.com/desirecore/desirecore/pull/3558) 已在 2026-09-29T13:58:40Z 合并，合并提交 `f6a63865863135f6cda54ebaeeff7003bc855ac0`，不是本轮合并。该 PR 的历史 CI 快照并非全绿，不据此宣称平台全套验收通过。本轮另冻结当前 dev `5ad8fa4b0f3dd62bded6ce234a094915bb837d2e` 验证相关 Schema、工具目录及权威摘要函数。

此前 lead/intake 的源码访问阻断**本次已解除**：六个来源均通过正常 Git fetch 取得；按 0.1.39 正式锁在新工作树精确检出，验证 HEAD、版本与 Git 树。平台权威 `computeMemberContentHashAt` 复算六项均与正式锁一致。正式锁和候选锁严格分开，没有改写根仓发布锁。

2026-10-04T04:31:27Z 的[远端回读](merge-gate-2026-10-03/remote-status-after-member-push.json)确认六个成员 PR 的新 HEAD 全部匹配、仍为 Open Draft；团队 #48 当前为 `CONFLICTING / DIRTY`，不是上一轮的 MERGEABLE。同期平台 dev 又推进至 `a9f717f347ae5316471c84fd25a039cac7e62d69`；本轮验证仍只绑定 `5ad8fa4...`，没有把未验证的新 dev 当成通过。

## 本轮实际修复

旧候选的 Lead 缺少 `UnderstandImage`，四名下游成员的有效工具需求被父级截断，真实 checker 失败。补入该工具并保留 `StructuredFileValidate` 后，已提交候选的有效工具清单和源码身份检查通过。除这项明确的工具修复外，没有扩展审批或其他安全权限；不存在的 `ExportRedlineDocument` 声明没有恢复。

六名成员保留上游 `assets/avatar.webp` 原始字节和引用。intake 将上游 S8 四类版本不可得标记、严格 YAML/Ajv 解析和原负例迁移到现有严格扁平回执，保留 O0–O5、同字节校验报告绑定和独立 O4/O5 的修复，不退回宽松的旧嵌套格式。

首轮 54 项成员测试通过后，独立完整兼容审查仍发现两项 P1：条件通过可以返回 `handoff.to: null`，以及版本覆盖缺口可以通过 `gate_affecting: true` 被误写成业务条件通过。新增真实反例先记录 5/7、两项失败，再窄修：条件通过必须交回 `contract-review-lead`；四个 S8 ID 在所有 flags 条目中固定为非门禁，不允许靠自报布尔值改变语义。正常业务条件通过、混合覆盖缺口及 BLK 优先仍成立。

旧实施日志存在空模型块摘要的无效提取记录，原日志未抹除。[新权威记录](merge-gate-2026-10-03/member-protected-authoritative.json)明确废弃该提取结果，并逐项核验六个**非空** `llm` 原始块与其变更前 Git HEAD 字节一致，其他受保护配置值不变。新头像也逐字比对上游。

## 本轮新验证

| 验证 | 结果 | 边界 |
|---|---:|---|
| 当前团队候选 `npm run check` | 115/115 | 本轮重跑；不代表已整合 0.1.39 |
| 六成员新临时目录 `npm ci` / `npm test` | 56/56 | Lead 6、intake 30、extractor 2、risk 2、jurisdiction 2、reporter 14；零失败/跳过/取消/TODO |
| Lead 与实际 intake 源码集成 | 4/4 | 不是真实委派调用 |
| 当前平台生产工具参数契约前检 | 4/4 | 不执行模型和工具业务 |
| 正式 0.1.39 六成员精确来源及 v3 摘要 | 6/6 匹配 | 权威平台函数；不是市场安装 |
| 修后候选源码身份与有效工具清单 | 通过 | 普通 DOCX 可选能力缺口仍明确披露 |
| 独立复审 | 完整前审 NO-GO → 增量收口 GO | 前审两项 P1 与证据 P2 已关闭；不冒称另一次全量复审或独立重跑全部测试 |

首轮 54、最后 56，以及单独的 30 项 intake 重跑不累加为新的独立测试数。源码测试、正式分发核验和运行时业务验收分别记录。

## 已保存的成员提交

以下均为既有 `optimize/contract-takeover-20260929` 分支的普通推送，不是合并到 main。

| 成员 | Draft PR | 本轮 HEAD |
|---|---|---|
| Lead | [#23](https://github.com/desirecore-agent/contract-review-lead/pull/23) | `2a6a63b2d4fd3e0c4606c2a08a21db65bfc74cba` |
| Intake | [#11](https://github.com/desirecore-agent/contract-intake/pull/11) | `25efa509b811e0f12f51ca0159ef5772585bdc31` |
| Extractor | [#10](https://github.com/desirecore-agent/clause-extractor/pull/10) | `35a6ea9a578c97b8d7225a23d8a66ad3478f234e` |
| Risk | [#7](https://github.com/desirecore-agent/risk-scanner/pull/7) | `e712c7a724b53f0409afbc66153b1be83a2630df` |
| Jurisdiction | [#6](https://github.com/desirecore-agent/jurisdiction-auditor/pull/6) | `c65f6179dd7b4003328f301ff9b394f3fbf04a4a` |
| Reporter | [#8](https://github.com/desirecore-agent/review-reporter/pull/8) | `5db3030fec8f9e4ad8e9bad464ff4e7d0aa2ec2d` |

[候选锁](merge-gate-2026-10-03/members.candidate.lock.json)由当前平台权威函数生成且通过锁 Schema，SHA-256 为 `16d9b507e98582c7d9d2d385a20b7eff994f4d27dcc71e5581502b74422a8b43`。其 v3 仅覆盖身份文件，完整技能和头像由精确 commit/tree 固定。它是验收证据，不是新的市场分发锁。

## 真机推进及准确停止点

通过固定当前 dev 源码启动一个本轮全新客户端，运行 home 与 HostAgent home 独立、测试遥测关闭。验证该 home 的 CDP 发布身份和浏览器路径后，观察到真实可见界面及市场的 0.1.39 未安装条目。只发送一次该条目的正常安装按钮点击。

**安装后界面核验被宿主安全检查拦截，因此安装结果保持未确认。** 没有改用 HTTP、文件读取、其他实例或重复安装来取得一个推测结果。测试启动 Job 已通过所属项目的停止入口收口，目录保留；这不是升级/回退验收。

另外，根仓 `git merge --no-commit --no-ff 440c28a...` 被同类宿主检查阻止；回读确认 HEAD 未变、无 MERGE_HEAD。未换命令、Agent 或通道绕过。这次被阻止的是具体合并/运行观察操作，**不是缺 GitHub token，也不是成员源码仍不可读取**。

当前真实目录与源码只找到普通 `ExportDocument(path, format, output)`，没有已打通的红线导出链路。普通 DOCX 转换、文件存在或摘要匹配都不能满足接受/拒绝修订及逐页视觉标准。

## 合并与发布门禁

本轮不合并团队/成员 PR，不解除 Draft，不更新市场。仍需完成：新 main 与整套候选的实际整合及复审；可获准核验的安装结果、用户本人规则/执行授权；真实 O0–O5 调度、O3 并发、O4 隔离负测；自主红线 DOCX；固定版本三次一致性；授权真实合同及附件；新装、升级和回退。

操作限制解除后继续上述顺序，不从旧历史记录中补填通过，也不要求用户重复提供已经取得的成员源码。真实合同及明确审查目标仍需其独立授权，不能用合成模板替代。

## 复现入口

在上述精确成员提交执行独立测试；团队功能代码仍绑定 `126ece1...`，后续根仓证据提交不改变其行为。团队：`npm run check`。六成员：`python3 -B scripts/verify-member-candidates.py --members-root <六仓父目录绝对路径> --output <新结果文件绝对路径>`。

Lead 集成：`CONTRACT_INTAKE_SOURCE=<intake绝对路径> npm run test:intake`；当前平台前检：`CONTRACT_PLATFORM_SOURCE=<固定5ad8fa4平台路径> npm run test:platform`。候选工具检查：`node shared/resources/check-member-tool-ceiling.mjs --agents-dir <六仓父目录> --lock docs/acceptance/merge-gate-2026-10-03/members.candidate.lock.json`。

证据目录保留前审、修前失败、修后通过和原始/脱敏摘要。运行 home、账号材料、私有合同和原始完整 Agent 轨迹不随报告发布。

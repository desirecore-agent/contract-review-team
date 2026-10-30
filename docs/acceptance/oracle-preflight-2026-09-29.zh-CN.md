# Oracle 静态前检（2026-09-29）

> **已被后续独立复审否定为充分验收依据。** 下文保留实施者当时的前检记录，不是当前放行结论。49 条 reframed 映射仍有类别/极性实际不等价的 P1，最后 intake/path 窄修也晚于本文。当前状态以 [接手验收账本](takeover-2026-09-29.zh-CN.md) 和 [独立复审](evidence/independent-readonly-closure-review-2026-09-29.md) 为准；不要把“字段声称保留”读成语义已证明保留。

状态：修正后静态前检通过；不是受测团队真机通过、生产验收、法律专业认可或自主交付证明。上一版前检通过只证明当时的结构校验通过，不代表 oracle 业务预期正确；本次修正在本轮受测合同团队运行前完成，未读取被测输出。

## 范围与隔离

本次只核对仓内固定语料、来源说明、生成器、共享规则和独立预期审查；在任何本轮受测团队输出产生前冻结答案，未读取或据此调整团队运行结果。未改 C/R 合同正文，未重生成语料，未改共享业务规则、成员、模型配置或发布配置。

当前机器判据位于 `ground-truth.yaml#normative`。原 oracle（含 `measured_baseline`、`measured_baseline_cn_v3` 及旧门禁值）逐项原样保留在 `history.legacy_oracle` 下，父节点明确 `normative: false`；guard 不把它当当前答案。

## 先失败、后修复

新增 guard 后、修改 oracle 前先运行：

```text
$ node shared/resources/check-oracle-contract.mjs
✗ oracle contract check failed:
  - normative: must be an object with normative: true
exit 1
```

修复后的当前层精确覆盖 C01–C08、R01–R03；门禁为单一合法值。C05/C07 为 `passed + out_of_service_scope`，只允许通用治理与转介，禁止外国法实体结论或境外补包建议。C08 原始签署完成审查仍 `blocked`；另建带用户明确请求文本及 `execution_validation_requested:false` 的 `C08_negotiation_draft` 场景。仅签署 pending 且无其他实际 FLG/BLK 时该草稿场景为 `passed`；未知/未声明目的仍按原场景阻断。

锁定 `contract-intake@1.0.6` 的 S7.1 已有“统一社会信用代码缺失 | FLG-PARTY-ID-ABSENT”。本轮修正先按源文记录 `party_role` 与 `identifier_applicability`：R02/R03 的买方、卖方是主合同双方，缺代码继续使门禁为单值 `conditional`；见证方虽同样未出现代码，但核验适用性保持 `unknown` 并要求角色澄清，不被硬编码进 gate。另固定了主合同中国法人 `required`、已明确排除的见证方 `not_applicable`、角色不足 `unknown` 三种反例。签署文字完整不等于真实性验证；法条号及效力断言仍进入专业法律复核待决。

R7、R9 和正文引用无清单项分别固定为：范围事实保持 `passed` 且无 PEND-001；权威正式清单缺失为 `conditional` 且保留 PEND-001；正文引用的附件不在权威清单中仍 `blocked`。C06a/b 的显式比较必须检出附件二整体 `SLA-v1.2 → SLA-v2.0` 替换，同时保持 `global_coverage: partial`、全局 `direction: undetermined`、局部 `attachment_direction: up`。R03 必须检出 2019 签订时点与库内 2025 修订/2026 生效版本的范围欠账，但具体法律效果继续 `pending_professional_review`。单版本且未请求基线为 `not_applicable` 并省略方向；只有已请求基线但范围不足才用 `undetermined`。

历史层解析 JSON 的 SHA-256 仍为 `1a17baa686385ee250e874b45a19696651cb797b889ccd400be0158b5a4e8cc6`。guard 动态枚举全部 69 项历史 `must_detect:true` 与 `must_not_flag`；每项须同 ID 延续，或映射到本案真实存在的检测、禁止误报、覆盖、阴性检索或适用域 target。`reframed` 只有说明文字而无真实 target 会失败。真正 `retired` 还须有源事实与独立复核依据；当前没有项目依赖 retirement。循环引用实现审查报告作为唯一复核来源也会失败。

49 条 `reframed` 现逐条写明历史类别、极性与保留的事实约束；错类别/错极性、或无保留依据地把两个无关含义压到同一 existing ID，mutation 均失败。R01 恢复两个独立且直接锚定原文的禁报：第二条是程序性组成文件清单，不是附件交付清单；买方/卖方/见证方的 `XXXX` 是未填占位，不是名称不一致。历史法条效果只保留为源文事实或 `pending_professional_review`，不作为当前法律真值。

normative 层已恢复逐案预定必检、禁止误报、覆盖、阴性检索及适用域目标。C03 三项缺失、C01 关键误报禁项、C04 三项劳动文本事实、C05 法律/管辖/数据文本并存、R02/R03 日期/旧法名/仲裁措辞均为稳定检查目标；未经专业确认的法条号和效力结论单列待复核。严重度只有注明适用知识源时才可断言。

## 可复验命令

```sh
node shared/resources/check-oracle-contract.mjs
node --test shared/resources/tests/oracle-contract.test.mjs
```

第二条现为 31/31，通过基线正例、history 解析值深比较和定向 mutation；新增拒绝错类别/错极性、无依据的无关 many-to-one，以及删除 R01 任一恢复禁报。

本次未运行平台全量测试，也未启动模型或合同团队真机流程。事件级 invocation 测试只是本地契约模拟，不证明平台运行时强制调度；真实 invocationId 与 terminal event 仍需在获授权真机确认。本轮未修改团队 package/lock。

intake Draft-07 回执契约现可接收技能声明的完整形状：逐主体 `party_role`、角色来源、标识适用性/状态/依据，四维 freeze，以及一致性/合规结论的独立 allowed 字段。真实 Ajv 反例会拒绝 S7 `flag` 但 flags 为空且 verdict 为 `passed`、缺角色来源、不适用却声称存在标识、缺 freeze 字段，以及任一冻结为 false 却允许一致性结论。schema 合法仍仅是机器交接条件，不冒充业务质量或法律审查完成。

## Review-A 修复定向结果

本轮定向结果：oracle 31/31、workflow 34/34、四成员知识/解析测试 8/8。terminal event、settled receipt 与 ledger 采用同一 typed record；success/failed/cancelled 共用校验器，字段错型和跨 invocation 复用均拒绝，同时不要求所有业务子动作成功。这里是本地契约模拟，不是平台执行器。12 份 C/R 合同字节未变，history 解析深比较未变。

本结果仍未验真机、独立法律结论或团队自主 DOCX。最终冻结 diff 应由未参与本次实现的 reviewer 复核；lead/reporter 候选不在本次修改或通过范围。

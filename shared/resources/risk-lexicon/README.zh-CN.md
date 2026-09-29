---
last-reviewed: 2026-09-29
---

# 风险触发词库

[English](README.md) · [资源说明](../README.zh-CN.md) · [团队设计](../../../docs/design.zh-CN.md)

[pack.yaml](pack.yaml) 声明 lexicon-v1、知识日期 2026-08-31、29 个条目。[中文](triggers-zh.yaml)与[英文](triggers-en.yaml)使用相同 ID。模式和反例数量应从 YAML 计算，不再抄写彼此冲突的历史统计。

关键词命中只是候选，不是风险结论。词库输出商业观察；法律效力属于 jurisdiction-auditor。它与缺失条款和标尺检查互补。

我方身份/角色尚未确认时，角色相关风险判断保持 unknown，不得猜测谁承担义务。

## 五步判定

| 步骤 | 必须得到的成果 |
|---|---|
| M1 | 用关键词/模式定位候选原文 |
| M2 | 核对限定词、反例及抑制条件 |
| M3 | 按条目规定路线取得所需证据并判定 |
| M4 | 记录条款/位置、严重度和具体行动 |
| M5 | 去重；记录已检查/未触发覆盖，不造风险 |

路线共六类：element_check、symmetry_check、direct、benchmark_compare、defer_to_jurisdiction、defer_to_version_comparison。前三类在证据充分时可在扫描职责内解决（v1 未使用 direct）；标尺比较必须有抽取值和明确标尺；两类 defer 必须等待对应职责的证据，不能自行补造。

先查原文引用的附件和附表，再判数值缺失。C06b 的标尺定位是合成回归案例，不是真实合同先例，见[语料说明](../../../testdata/contracts/README.zh-CN.md)。

## 误报控制

每条至少两个反例，包含 form/example/why_not_risk。须按上下文理解：分包连带责任不天然构成风险；exclusive jurisdiction 不等于排他许可；指派人员不等于转让合同；promptly within ten days 并非无限期限。

七类禁止捷径：仅有责任上限即报风险；主观认定不可抗力过宽；对称转让限制误判单方；抽取不到数字却编造数值风险；无证据的“不利”评价；普通通知/可分割/完整协议/副本条款误报；风险成员擅下法律效力结论。

## 双语维护

同 ID 的 category、severity、resolution、recommended_action、human_gate、benchmark_link、missing_clause_link、dedup_group、requires_symmetry_check 保持语义一致。标题、关键词、模式、限定词、反例和说明允许自然语言差异。

从失败案例出发，明确解决路线，补正反例，同步双语和元数据，再运行定向检查及成员回归。不得自创标尺，也不得代替法域、版本比较或评分职责，见[维护说明](../../../docs/maintenance.zh-CN.md)。

本文仅作解释，不修复共享七步与 O0–O5 运行冲突，也不证明误报率已经达标。

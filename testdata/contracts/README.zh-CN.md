---
last-reviewed: 2026-09-29
---

# 合同测试语料

[English](README.md) · [验收方法](../../docs/testing.zh-CN.md)

共 **12 份合同文件、11 个案例编号**，C06 是两版本案例。样本和预期结果属于测试设计，不代表验收已经完成。

## 来源

- C01–C08：虚构身份与人工测试条件的合成合同，含 C06a/b 共九份。C07 是合成英文新加坡法 MSA，不是真实客户合同。
- R01：公开政府采购空白模板，来源见 [ground-truth.yaml](ground-truth.yaml)，不是已签协议。
- R02：由 R01 填充生成。[make-r02.py](make-r02.py) 写入姓名、日期、签章文字，并明确人工植入仲裁机构缺陷。历史文件名 executed 是场景标签，不代表验证了签署真实性。
- R03：由 [make-r03.py](make-r03.py) 修改 R02 日期和引用年份，用于历史法律适用测试。

这些样本不能证明已完成经授权的真实客户已签合同验收。公开来源也不能免除记录改动和核对法律结论的责任。

## 清单

以下列出 `normative.cases` 的当前门禁。旧值完整保留在 `history.normative: false` 下，
不得作为当前答案。

| ID | 文件 | 当前 oracle 门禁文本 |
|---|---|---|
| C01 | [C01-saas-subscription.md](C01-saas-subscription.md) | passed |
| C02 | [C02-software-outsourcing.md](C02-software-outsourcing.md) | blocked |
| C03 | [C03-procurement-framework.md](C03-procurement-framework.md) | conditional |
| C04 | [C04-labor-contract.md](C04-labor-contract.md) | passed |
| C05 | [C05-data-processing-agreement.md](C05-data-processing-agreement.md) | passed（服务范围外） |
| C06a | [C06a-saas-v1.md](C06a-saas-v1.md) | passed |
| C06b | [C06b-saas-v2.md](C06b-saas-v2.md) | passed |
| C07 | [C07-master-services-agreement.md](C07-master-services-agreement.md) | passed（服务范围外） |
| C08 | [C08-mutual-nda.md](C08-mutual-nda.md) | blocked |
| R01 | [R01-govt-purchase-real.md](R01-govt-purchase-real.md) | blocked |
| R02 | [R02-govt-purchase-executed.md](R02-govt-purchase-executed.md) | conditional |
| R03 | [R03-govt-purchase-2019.md](R03-govt-purchase-2019.md) | conditional |

C01 检查误报；C02 硬性输入缺陷；C03 条款缺失及条件通过续行；C04 劳动问题；C05 法域及数据条款冲突；C06 附件版本比较；C07 英文及服务范围外处理；C08 签署状态。R01 测模板输入，R02 测下游分析，R03 测法律时点。商业标尺属于样本/知识包假设，不是普遍法律或市场标准。

## 判据边界

- 当前门禁仅允许 `passed`、`conditional`、`blocked`，每个案例只能有一个标量值。
- 单独的域外指向不使 intake 对象失效。C05/C07 通过 intake，但必须转介且禁止外国法实体结论；C08 因原场景明确要求签署完成审查且签署栏为空，仍由独立真实阻断项判为 blocked。
- `C08_negotiation_draft` 是另一个有明确用户请求文本的场景，记录 `object_designation: negotiation_draft` 与 `execution_validation_requested: false`。没有其他实际 FLG/BLK 时，签署空白只进入 pending，不把 `passed` intake 门禁降级；目的未知或未声明仍按原 execution-readiness 场景阻断。
- 锁定的 `contract-intake@1.0.6` S7.1 已规定统一社会信用代码缺失为 `FLG-PARTY-ID-ABSENT`。R02/R03 三方均无统一社会信用代码或等价注册号，故单值 `conditional`，具体缺项进入 pending、下游继续。签署字段只是文本完整，真实性与授权未验证；日期、旧法名称、仲裁机构不明确等原文事实必须检出，法条号和效力断言待专业法律复核。
- C06 方向统一为 `up/down/flat/undetermined`；单版本为 `comparison.applicability: not_applicable`。显式 C06a→C06b 比较记录请求基线及客户视角。交付物仅含内嵌附件二，声明的附件一、附件三正文未交，因此 `global_coverage: partial`、全局 `direction: undetermined`、局部 `attachment_direction: up`；正文相同不等于全合同一致。
- 每个 normative 案例均预先声明稳定的必检、禁止误报、覆盖、阴性检索及适用域目标；不得以空目标按输出反推通过。严重度必须注明适用来源，未经核验的法律效力与必须检出的原文事实分离。

锁定规则证据与本次来源更正见 [oracle-source-correction-2026-09-29.md](oracle-source-correction-2026-09-29.md)。上一份独立审查保留不改，关于 R02/R03 的旧结论由本说明取代，不回写历史报告。
- R7（清单已知、正文未交）、R9（权威清单未交）及正文引用无清单项分别建成可执行定向场景。
- 运行 `node shared/resources/check-oracle-contract.mjs` 与 `node --test shared/resources/tests/oracle-contract.test.mjs`。它们只是静态前检，不是真机或法律验证。

有争议的预期须通过独立审查的行为/判据变更处理后再用于发布门禁，不能静默把不一致计作通过。

## 可复现使用

1. 选定案例，记录团队提交、成员锁、模型、知识包、场景和预期类别。
2. 仅把合同输入复制到新的审查工作区，ground-truth.yaml、预期说明及生成脚本不得进入被测智能体可见范围。
3. 经正常用户界面提交原文、附件、身份、法域和目标，不预填发现。
4. 保存真实成员回执、原文证据、产物、时间和失败状态；人工干预须单独记录。
5. 由外部评测核对已复核判据，包括不得误报项、未覆盖项、转介及 Human Gate。
6. 代表性输入至少独立运行三次，比较门禁、覆盖、证据和成果类别，而非逐字文案。
7. DOCX 使用可用的真实修订导出能力与 Word 兼容查看器，按[文档验收](../../docs/testing.zh-CN.md)检查。改扩展名或人工拼 ZIP 不证明自主导出成功。

合成测试可以显式模拟业务确认并记录，但不能冒充真实法律授权。重新生成样本会改变输入，应同时审查 diff 与预期结果。package.json 未提供自动全链路 E2E runner。

---
last-reviewed: 2026-09-29
---

# 合同测试语料

[English](README.md) · [验收方法](../../docs/testing.zh-CN.md)

共 **14 份合同文件、13 个案例编号**，C06 是两版本案例。样本和预期结果属于测试设计，不代表验收已经完成。

## 来源

- C01–C08：虚构身份与人工测试条件的合成合同，含 C06a/b 共九份。C07 是合成英文新加坡法 MSA，不是真实客户合同。
- C09a/C09b：由 [make-c09.py](make-c09.py) 从 C01 派生，各与 C01 恰好差两行（合同编号与一处附件条款），脚本拒绝任何其他差异。与 C01 一起隔离 intake S4：C01 为 R7（已登记附件正文未送达）→ passed；C09a 为 R9（权威附件清单是另行签署且未送达的目录）→ conditional，且 R9 对应的待办恰好一条升级的 PEND-001；C09b 为 R1（正文引用了正式清单里没有的附件）→ blocked。改动 C01 后必须重跑 make-c09.py。
- R01：公开政府采购空白模板，来源见 [ground-truth.yaml](ground-truth.yaml)，不是已签协议。
- R02：由 R01 填充生成。[make-r02.py](make-r02.py) 写入姓名、日期、签章文字，并明确人工植入仲裁机构缺陷。历史文件名 executed 是场景标签，不代表验证了签署真实性。
- R03：由 [make-r03.py](make-r03.py) 修改 R02 日期和引用年份，用于历史法律适用测试。

这些样本不能证明已完成经授权的真实客户已签合同验收。公开来源也不能免除记录改动和核对法律结论的责任。

## 清单

以下列出当前 oracle 文本，不是无条件的现行运行验收承诺。

| ID | 文件 | 当前 oracle 门禁文本 |
|---|---|---|
| C01 | [C01-saas-subscription.md](C01-saas-subscription.md) | passed |
| C02 | [C02-software-outsourcing.md](C02-software-outsourcing.md) | blocked |
| C03 | [C03-procurement-framework.md](C03-procurement-framework.md) | conditional |
| C04 | [C04-labor-contract.md](C04-labor-contract.md) | passed |
| C05 | [C05-data-processing-agreement.md](C05-data-processing-agreement.md) | conditional |
| C06a | [C06a-saas-v1.md](C06a-saas-v1.md) | passed |
| C06b | [C06b-saas-v2.md](C06b-saas-v2.md) | passed |
| C07 | [C07-master-services-agreement.md](C07-master-services-agreement.md) | conditional |
| C08 | [C08-mutual-nda.md](C08-mutual-nda.md) | blocked |
| C09a | [C09a-saas-manifest-deferred.md](C09a-saas-manifest-deferred.md) | conditional |
| C09b | [C09b-saas-attachment-unlisted.md](C09b-saas-attachment-unlisted.md) | blocked |
| R01 | [R01-govt-purchase-real.md](R01-govt-purchase-real.md) | blocked |
| R02 | [R02-govt-purchase-executed.md](R02-govt-purchase-executed.md) | 旧值 pass / conditional |
| R03 | [R03-govt-purchase-2019.md](R03-govt-purchase-2019.md) | 旧值 pass / conditional |

C01 检查误报；C02 硬性输入缺陷；C03 条款缺失及条件通过续行；C04 劳动问题；C05 法域及数据条款冲突；C06 附件版本比较；C07 英文及服务范围外处理；C08 签署状态；C01/C09a/C09b 测附件清单分界。C09a 的 R9 回执契约约束的是「R9 那一条」而非待办总数：R7 范围事实另起一条不升级的待办是允许的。R01 测模板输入，R02 测下游分析，R03 测法律时点。商业标尺属于样本/知识包假设，不是普遍法律或市场标准。

## 已知判据限制

- 运行门禁规范为 passed、conditional、blocked。R02/R03 仍写旧值 pass，其规范通过值应为 passed；本次不修改 oracle。
- C05/C07 在 oracle 中为 conditional，旧 README 的 passed 已纠正。
- oracle 中 cn-v1、缺少新加坡包等历史注释不能覆盖当前仅支持中国大陆的边界。域外通用治理与域内加载错误包是不同情况。
- 签署判据依请求范围而定：已明确的未签谈判草稿不等于签署真实性验证。先记录场景，再判断门禁。
- 旧 scratchpad/make-r02.py 引用已过期，实际生成脚本就在本目录。
- check:gates 跳过 testdata；静态通过不代表这些预期已经协调一致。[check-evidence.mjs](check-evidence.mjs)（零依赖）核对每条 evidence、additional_evidence 与 clause_presence_evidence 都能在对应语料中逐字找到；它查出并修正了 R01–R03 三条从未匹配过的仲裁条款证据。
- 2026-09-29 C01/C09a/C09b 的真机结果及由此引出的修复，见 ground-truth 的「C01 / C09a / C09b 真机实测基线」注释块；均为单次、非盲测运行。

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

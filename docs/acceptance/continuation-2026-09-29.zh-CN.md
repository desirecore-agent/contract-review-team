# 上游整合与检查器修复验收（2026-09-29）

[English](continuation-2026-09-29.md) · [原修复快照](followup-2026-09-29.zh-CN.md) · [并行上游边界](concurrent-upstream-2026-09-29.zh-CN.md)

**状态：团队侧源码/fixture 修复 GO；新成员兼容、模型真机及市场发布 NO-GO。** 最终独立窄复审为 0 P0 / 0 P1 / 0 P2，仅对本次检查器修复签结；不因源码测试而放行生产。

## 本次起点与责任

开始时工作树已有未提交的 0.1.37 上游整合；本次完整保留并继续修复，而非重做旧版本或覆盖后续工作。团队候选起点 `9fe002a96d366ce9f3825f7dd9a6b442d794275e`，远端 main 再核为 `346343b63347f70603fe47c14887b6f1fb799275`。Draft PR #48 起始为 CONFLICTING。

协调者只实施团队侧 checker、测试、文档和证据/Git 整合；独立 reviewer 只读相同候选并产出报告。没有修改任何成员模型、审批或凭据，也没有访问前任 Agent 本地资料。旧报告保留原有时间与适用范围。

## 本次关闭目标与实测

1. **C09 原始字节身份**：复核前一未提交修复，确认 C09a/C09b 的 oracle、bindings 和文件实际 SHA 一致，且源文件逐字等于固定上游；未归一化换行或反向修改样本来凑摘要。
2. **成员源码身份**：完整锁定 commit、真实 repo 根、实际 HEAD、提交内 agent.json blob 和工作区原始字节都必须一致；只看相同 version 不得通过。
3. **实际工具关系**：本次另加实进程反例，复现并修复成员自身 denied 未扣除、空 allowed 被当成零工具、DelegateControl 未按平台递归规则排除的问题。组长 denied 继续生效，none sentinel 按 deny-all 处理。有限静态检查不宣称能够验证 unrestricted 或通配策略；它们明确失败为未验证。可选 ExportDocument 缺口披露为债务，不算导出能力已满足。
4. **全部输入都进入证据索引**：生成器现在无条件绑定所有 normative source，不再漏掉只有阴性检索或没有 literal 的案例；声明源摘要不符时拒绝写出，旧索引保留。没有自动重建来使运行时通过。
5. **上游文档保真**：0.1.37 逐项变更事实、C09 两行派生约束、R7/R9/R1 对照、检查命令及单次非盲历史限制保留，新增中英文检查器边界说明。

## 新证据（不累计重复测试）

| 验证 | 本次结果 | 层次 |
|---|---:|---|
| 修复前完整团队 check | 103/103 | 说明旧检查未覆盖新增反例，不等于缺陷不存在 |
| 四个新增实进程反例 | 修复前 0/4；修复后 4/4 | 临时合成 Git 仓库与证据输入，非合同团队模型 |
| 修复后 `npm run check` | 115/115；零失败、跳过、取消、TODO | oracle/workflow、源码身份与权限关系、证据索引 |
| 原文/正式元数据保留 | 14 份源文件与上游一致；原 12 份与初始基线一致 | 原始字节对比 |
| 派生索引重建 | 96 literal / 14 source，重建结果与已审阅索引字节一致 | 新输出文件，不覆盖旧索引 |

复审第一轮为 0 P0 / 2 P1，确认 C09 修复及文档保留，但拒绝对存在上述两类检查盲区的候选签结。只读 reviewer 的临时目录测试被 EPERM 阻止，未计为通过；115 项由协调者通过正常获准测试入口新执行。[最终独立源码复审](followup-evidence/continuation-final-independent-review-20260929.md)已确认两项 P1 关闭；不冒称 reviewer 独立重跑了这些测试。

[新测试日志](followup-evidence/continuation-team-final-20260929.log)、[原文与锁保留](followup-evidence/continuation-provenance-20260929.json)、[失败反例](followup-evidence/continuation-regression-negative-20260929.log)与[修后反例](followup-evidence/continuation-regression-positive-20260929.log)使用 `followup-evidence/continuation-*` 前缀。负例、正例、原文来源清单和两轮 reviewer 报告一并保留；机器路径脱敏后另记录公开副本摘要。

## 仍然阻断的范围

正式锁保持上游原字节，不能用旧候选锁替换。上游 lead `d5818345004e0920f9594ad55177b86738d1c123` 与 intake `02b654dc4e5b1bc24f0e9c55abb5ba95528031b1` 的源码获取先前被宿主安全检查阻止；本次未通过另一命令、Agent 或通道绕过，也没有运行该正式锁的真实成员兼容性检查。

真实调度、O3 并发、O4 越界读取负测、自主红线 DOCX（含接受/拒绝及逐页视觉）、三次一致性、授权真实合同、市场全新实例安装、升级/回退仍需完成。外部缺项为获准读取上述新成员源码、明确绑定且允许控制的测试实例及平台要求的真人确认、获授权的真实合同与完整附件/审查目标。红线导出链路属于尚未打通的工程任务，不只是缺凭据。

0.1.37 是另一上游变更的版本声明，不计作本次市场发布。本次不得据此合并运行变更或宣称生产就绪。

## 复现

在本次 PR 的精确团队提交上执行 `npm ci --ignore-scripts`，再执行 `npm run check`。定向检查可用：

```sh
node --test shared/resources/tests/member-tool-ceiling.test.mjs shared/resources/tests/evidence-index.test.mjs
node testdata/contracts/check-evidence.mjs
```

正式成员工具检查另外执行 `node shared/resources/check-member-tool-ceiling.mjs --agents-dir <实际成员仓库父目录> --lock <明确选定的锁>`。只有取得并核对该锁的真实源码后才可运行；fixture 的通过不能替代这一步。

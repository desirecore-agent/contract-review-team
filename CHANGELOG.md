# Changelog

本团队的所有显著变更记录于此。

## [0.1.6] - 2026-09-06

### 修复

- **门禁三态枚举全仓库对齐，并加机械自检。**`rules.md#三之一` 早就规定只有
  `passed` / `conditional` / `blocked`，可 `rules.md` **第二节自己**仍写着
  「`verdict: reject` 时立即终止」——`reject` 恰是它禁用的字面量，上游 intake
  从不产出。于是「闸门不可绕过」这条最硬的规则按字面**永远不触发**；编排官与
  两个下游成员的 persona/principles 全都照着 `reject` 写，同样永不匹配。
  真机里闸门还是关上了，因为模型看懂了 `blocked` 的语义——**闸门靠的是模型的
  宽容解读，不是规则**
- v0.1.1 那次「统一门禁裁决枚举」只改了两个成员的 SKILL.md，persona.md /
  principles.md 与另外两个仓库全漏了；本次跨 4 个仓库共修正 11 处
- 本体侧同步对齐：`contract.yaml#intake_verdict` 的 enum 此前是
  `[pass, conditional_pass, reject, pending]`——四个值没有一个是 intake 真会
  产出的，导致 `actions.yaml` 的准入检查 `intake_verdict ∈ [pass, conditional_pass]`
  按字面永远不成立
- `rules.md` 补上枚举的**管辖范围**：只管门禁裁决与会被下游做字面量准入的 verdict；
  检查项状态、风险等级、覆盖状态、人工审批里的同名取值不受管辖（此前没说，
  导致「`pass` 到底能不能用」无法判断）
- 明确 `handoff.to: null` 是**与词表无关**的停机信号，域内 Agent 的自有裁决词表
  （如法域合规官的 `out_of_service_scope`）据此终止，不必套用三态枚举

### 新增

- `shared/resources/check-gate-verdict.mjs`：零依赖门禁裁决字面量自检，canonical
  从 `rules.md` 读（不抄第二份），可跨 Agent 仓库扫描。变异验证：还原到修法前，
  团队仓库检出 2 处、三个 Agent 仓库检出 6 / 1 / 4 处，修法后全绿

### 变更

- 重锁成员：合同审查统筹官 `1.0.3`、条款结构化官 `1.0.1`、合同风险识别官 `1.0.1`

## [0.1.5] - 2026-09-06

### 变更

- 锁定条款结构化官已合并的 `agent.json` 版本 `1.0.2`，同步更新 source commit 与 v3 内容摘要

## [0.1.4] - 2026-09-06

### 变更

- 锁定合同审查统筹官已合并的 `agent.json` 版本 `1.0.2`，同步更新 source commit 与 v3 内容摘要

## [0.1.3] - 2026-09-06

### 变更

- 更新合同审查统筹官的固定 source commit 与锁定版本；编排技能补齐 Delegate Work Context 的显式选择、fan-out 目标上下文和续跑约束

## [0.1.1] - 2026-09-01

### 变更

- 补充 MIT LICENSE 与合同审查免责声明：公开分发的团队此前无许可声明，等同 all rights
  reserved，使用者严格来说无权使用或修改团队配置
- 统一门禁裁决枚举：法域合规官与风险识别官的 SKILL 仍在使用 `pass` / `conditional_pass` /
  `reject` 这套已被团队规则明令禁止的变体，与上游输入治理产出的 `passed` / `conditional`
  永远匹配不上——枚举不统一不会报错，只会让流水线在双方都没错的情况下卡住
- 示例主体名称改为「（示例）」括注形式，避免与真实企业名撞名

## [0.1.0] - 2026-08-31

### 首次发布

多 Agent 合同审查团队，6 名成员按固定 7 步工具链协作：
输入治理 → 条款结构化 → 风险识别 / 法域合规（并行）→ 独立复核出报告。

- 输入治理执行 5 分钟硬校验与四大冻结，命中阻断项直接终止流水线
- 复核环节不读前序推理，回原文重新取证，四态判定 confirmed/refuted/unlocatable/additional
- 覆盖矩阵预先穷举生成，未覆盖项显式留白，不因无人提及而当作通过
- 法务四类不可替代动作走 Human Gate，不做默认通过
- 版本对比标注风险方向；比对范围未覆盖全部部件时判 undetermined，不判持平
- 附业务本体、法域三层知识包（base/cn/us/custom）、29 条风险触发词库

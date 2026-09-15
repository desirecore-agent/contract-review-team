## 0.1.31 - 2026-09-15

- `contract-intake` 升级至 1.0.5：明确未签署谈判草稿的受控辅助审查例外；仅在请求范围与材料共同证明 `unsigned_draft` 且不要求签署/效力验证时放行，其余签章证据缺失仍 fail closed。
- 更新成员锁定至 `f8524e2e324134c626be96980744cf12b136103b` 及对应 `v3` 内容摘要。

## 0.1.30 - 2026-09-15

- `review-reporter` 升级至 1.0.6：获得 `ExportRedlineDocument` 能力，在原文锚点明确且唯一时生成带真实 `w:del`/`w:ins` 修订的 DOCX；失败保持 Markdown 交付并返回明确状态。
- 更新成员锁定至 `9198728db040106525341de260f7dc8b5f50742a` 及对应 `v3` 内容摘要。

## 0.1.29 - 2026-09-15

- contract-review-lead 升级至 1.0.17：O0 改为 KPI 驱动的最小可验证环；FileDigest 参数只允许一次修正，摘要缺失降级为 frozen_without_digest 并继续事实审查；覆盖矩阵不再作为 O0 的强制技能依赖。
- 更新 Lead 锁定至 cb3cd7db2ebceae980b6438dfe941acb3e2d48d5 及对应 v3 内容摘要。

## 0.1.28 - 2026-09-15

- contract-review-lead 升级至 1.0.16：O0→O4 改为有界编排，真实回执、磁盘回读和覆盖矩阵同步作为完成 KPI；成员超时立即阻塞并记录能力债务。
- jurisdiction-auditor 升级至 1.3.0：单回合、最多五条带证据的法域适用性观察。
- isk-scanner 升级至 1.1.0：单回合、九类固定检查、最多八个触发候选和四个可比事实。

## [0.1.27] - 2026-09-15

### 修复

- `clause-extractor` 升级至 `1.1.0`：先交付最小条款事实检查点，再进行有界丰富抽取；固定事实类别和五种证据状态，保留 unknown、blocked 与 capability_debt，不再要求一次运行完成巨型 E1-E10 控制器。
- `clause-extractor` 关闭自我委派和多余工具权限，只向 `contract-review-lead` 返回绝对工件路径与统计回执。
- 更新成员锁定至 `6129add5f40109f895d4125065a761b58f73819d` 及对应 `v3` 内容摘要。

## [0.1.26] - 2026-09-08

### 修复

- `contract-review-lead` 升级至 `1.0.14`：O1 只能同步、隔离地委派给 `contract-intake`；统筹官不再自行生成 intake 回执、裁决或待确认项。条件通过保持完整下游范围并原样传递 pending。
- `contract-intake` 升级至 `1.0.3`：R7 的正式清单已知但附件正文未取得仅记录 `SCOPE-ATTACHMENT-BODY-ABSENT` 并保持裁决；只有 R9 的权威正式附件清单本身缺失、完整 `declared` 集合无法确定时，才以 `FLG-ATTACHMENT-MANIFEST-INCOMPLETE` 输出 `conditional` 与 `PEND-001`。正文引用却无正式清单项仍阻断。
- 对齐共享本体 R-020/R-020A、动作和门禁三态，并新增跨文件 intake 契约自检。
- 更新两名成员锁定至精确合并提交及对应 `v3` 内容摘要。

# Changelog

## [0.1.25] - 2026-09-08

### 修复

- `contract-review-lead` 升级至 `1.0.13`：顶层与 Smart profile 的 `llm.reasoning` 均设为 `auto`，避免官方云 Anthropic-compat 接入面收到强制 thinking budget。
- 更新成员锁定至 `591e7108c9f6db57603cf35e3173efd22337cf31` 及对应 `v3` 内容摘要。

## [0.1.24] - 2026-09-08

### 修复

- `contract-review-lead` 升级至 `1.0.12`：用户尚未提交合同材料时固定为零工具咨询节点，先索要合同正文、全部附件、我方身份、适用法域/争议解决地和审查目标；不得扫描历史工作区、登记案件或派发成员。
- 更新成员锁定至 `65076b340855bf1286d633315a12cd45c79cb11d` 及对应 `v3` 内容摘要。

## [0.1.23] - 2026-09-07

### 修复

- `contract-intake` 升级至 `1.0.2`：结构化 intake YAML 强制使用块式映射/序列与安全标量；无 YAML 解析器时不得声称解析通过，保留 `yaml_unverified` 并降级。
- 更新成员锁定至 `contract-intake` 合并提交 `96e5cb6acfa0258cae798623d051840f09d62c12` 及对应 `v3` 内容摘要。


## [0.1.22] - 2026-09-07

### 修复

- `clause-extractor` 升级至 `1.0.6`：条款 quote 必须有同源 Read/Grep 固定字符串证据；首写 skeleton、写前命中和写后回读均 fail-closed，证据不一致时降级并停止交接。
- 更新成员锁定至 `a68253140130fe9a8dd0ad33a3860f8c922d1a31` 及对应 `v3` 内容摘要。

## [0.1.18] - 2026-09-07

### 修复

- `contract-review-lead` 升级至 `1.0.10`，handoff 显式传递 `canonical_artifact_root` 与 `lead_workspace`，所有 artifact 路径从该根派生并做段边界校验。
- `clause-extractor` 升级至 `1.0.5`，补强 flow YAML 禁止规则、产物扫描与解析失败闭账。
- 更新成员锁定及 v3 内容摘要。

## [0.1.17] - 2026-09-07

### 修复

- `review-reporter` 升级至 `1.0.4`：最终报告使用 lead 交接提供的 canonical `contract-review/` 根写入，首写、路径边界和回读失败均 fail closed 为 `REJECT-OUTPUT-DIR`，禁止成员 workspace 回退。
- 更新成员锁定与 v3 内容摘要。

## [0.1.16] - 2026-09-07

### 修复

- `review-reporter` 升级至 `1.0.3`：第 6–7 步评分与报告产物统一写入 lead 指定的 canonical `contract-review/` 根，路径边界不明或根外时返回 `REJECT-OUTPUT-DIR`。
- `clause-extractor` 升级至 `1.0.4`，条款 YAML 禁止非空 flow map/sequence；写入后解析失败返回 `REJECT-CLAUSES-YAML` 并停止交接。
- 更新成员锁定与 v3 内容摘要。

## [0.1.15] - 2026-09-07

### 修复

- `contract-review-lead` 升级至 `1.0.9`，将案件产物根固定为当前工作区下的 `contract-review/`；首次写入具体文件并回读校验，路径冲突、越界或无法确认边界时返回 `REJECT-OUTPUT-DIR`，不再静默退避到其他目录。
- 更新成员锁定到编排官合并提交 `9c59b5cea029e4bc4727c92382f4b5b6d1cd2c48` 及对应 `v3` 内容摘要。

## [0.1.14] - 2026-09-07

### 修复

- `risk-scanner` 升级至 `1.0.4`，风险技能升至 `risk-scanning@1.0.1`。所有机器可消费的风险产物禁止非空 flow sequence 与 flow map，特殊标量必须引用；写入后必须完整回读并进行 YAML/结构自检，失败返回 `REJECT-RISK-YAML` 并停止交接。
- 更新成员锁定到风险扫描器合并提交 `53ddec93478bcdadb3426a805920dad863717839` 及对应 `v3` 内容摘要，避免风险回执再次以不可解析 YAML 进入下游。

## [0.1.13] - 2026-09-07

### 修复

- `review-reporter` 升级至 `1.0.2`，在评分回执写入后增加完整回读与 YAML 结构闸门；发现不可解析或结构歧义时以 `REJECT-SCORECARD-YAML` fail-closed，禁止把半成品交给报告或编排官。
- 更新成员锁定到 `review-reporter` 合并提交 `081b0b4ea62bb697c6420fce385bf9b5b9f5fb2a` 及对应 `v3` 内容摘要，保留真实 Agent ID 指挥权白名单。

## [0.1.12] - 2026-09-07

### 修复

- 编排官升级至 `1.0.8`：登记案件时先从共享法域资源读取真实 `pack_version`；中国大陆合同使用 `cn-v3`，不再把已有匹配包误记为 `pending-intake` 或 `unknown`，避免完整材料被输入治理错误阻断。
- 更新成员锁定到编排官合并提交 `c3628dfa2fe4ec3358bfe021418cee369c874f70` 及对应 `v3` 内容摘要；未知或不匹配法域仍保持 fail-closed。

## [0.1.11] - 2026-09-07

### 修复

- 编排官升级至 `1.0.7`：发送给独立复核报告官的交接现在强制包含 `submission_mode`、规范确认项/待补项、冻结基线、结论锁、阻断清单及四类绝对产物路径。
- 禁止旧版 `confirmed_facts` 与 `source_artifacts` 别名替代规范字段，避免复核官在 R0 输入治理阶段拒绝有效审查。
- 更新成员锁定到编排官合并提交 `1431d4789a71e5fc6dce771c9cc1bcb3e1103d72` 及对应 `v3` 内容摘要。

本团队的所有显著变更记录于此。

## [0.1.10] - 2026-09-07

### 修复

- 编排官升级至 `1.0.6`：发往条款结构化官的 handoff 现在显式携带可读的绝对
  `contract-intake` 回执路径，满足条款提取启动门禁并避免无凭证重试。
- 更新成员锁定到编排官合并提交 `ef5878de3b870a443facc47be7cb429eaf39dcad`，同步
  `v3` 内容摘要，确保安装内容与锁文件一致。

## [0.1.9] - 2026-09-06

### 修复

- 条款结构化成员升级至 `1.0.3`，将首个可读合同片段后的下一次工具调用硬性约束为写入 E1 产物骨架，随后按检查点增量落盘，并在超时前记录 `failure_marks`。
- 更新成员锁定到 clause-extractor 合并提交 `504c9fbb528d39ba0ec624d95a13ba930e924332`，同步 `v3` 内容摘要，避免安装后发生锁漂移。

## [0.1.8] - 2026-09-06

### 修复

- **输入治理闸门区分范围事实与阻断缺陷。**正文列举的采购文件、响应文件、补充协议等程序性组成材料，
  在没有正式附件清单与编号时只记录为 `SCOPE-*`，不再误报 `BLK-ATTACHMENT-MISSING`。
- **争议解决条款只检查实际选定分支。**已选择仲裁时，未选中的诉讼备选分支空白不再触发
  `placeholder-unfilled`；“买方所在地仲裁机构”等已填写的泛化描述交由法域/风险环节分析。
- 输入治理技能版本升至 `1.0.1`，修复真实 R02 已签署合同被错误阻断的问题。
- Windows 下运行门禁字面量自检时统一相对路径分隔符，确保 `shared/rules.md` 的说明性禁用词
  与 POSIX 行为一致地被排除，不再产生平台相关的假阳性。

## [0.1.7] - 2026-09-06

### 修复

- **法域越界的判据提到 `rules.md`，不再只写在业务本体里。**`INV-008` 那条分支
  判据（越界 ≠ 缺包）实测**四轮里只有一轮生效**——那一轮 Agent 恰好去读了
  `INV-008`，另外三轮它根本没读，于是照旧输出「补充 jurisdiction-sg 规则包」。
  `rules.md` 注入全体成员的系统提示词、**每轮都在**，本体的不变量表是「按需查阅」
  的参考资料。规则要放在它**每轮必经**的路径上，而不是它可能会去翻的地方
- 补上上一轮漏检的门禁字面量：编排官技能里的 `judge=reject`、ASCII 流程图里的
  `verdict=reject`、风险识别官 `principles.md:48` 的 `verdict = reject`
- **自检脚本自己瞎了一次。**补正则时 `\b` 在 Python 普通字符串里被转成**字面
  退格符（0x08）**写进文件，于是正则末尾要求 `reject` 后跟一个退格符——永远匹配
  不到。第一次变异验证「全绿」不是没违规，是检查器失明。已扫全文确认无残留控制
  字节。自检脚本同时补上 `=` 运算符与字段名清单（`judge` / `upstream.verdict`）

### 变更

- 重锁成员：合同审查统筹官 `1.0.5`、合同风险识别官 `1.0.3`

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

- **指挥权白名单指向的五个 Agent ID 不存在，新装的团队根本派发不出去。**
  六个成员的 `command_authority.allowed_targets` 登记的都是中文拼音 ID
  （`he-tong-shu-ru-zhi-li-guan` 等），而 `team.json#members`、
  `members.lock.json` 的键、全部技能的 `handoff.to` 用的都是英文 ID。
  那五个拼音 ID 在任何地方都不存在——不是别名，是孤儿。真机复现：
  「派发被拒：指挥权约束（command_authority）未放行」，案件停在第 0/7 步，
  覆盖矩阵 29 行全部 blank。此前没暴露，是因为本地运行时的 agent.json
  被手工改成过英文 ID，一 reset 到已发布状态就现形

### 变更

- 重锁全部六名成员：统筹官 `1.0.4`、输入治理官 `1.0.1`、条款结构化官 `1.0.2`、
  风险识别官 `1.0.2`、法域合规官 `1.2.1`、复核出报告官 `1.0.1`

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


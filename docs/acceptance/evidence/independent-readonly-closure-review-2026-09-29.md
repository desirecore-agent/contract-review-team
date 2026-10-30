# 独立只读收口复审（2026-09-29）

结论：**不通过；P0=0，仍有已证 P1。candidate 源码不可进入下一门禁。**

边界：完整读取 `docs/handoff.zh-CN.md`、本轮 plan、前次独立报告与 scoped-fix 自评；以 `members.lock.json` 精确对象及当前六份源码为准。未改源码，未 commit/push，未访问真机、端口、进程、凭据或模型。只新增本报告。

## Findings

### P1-1 — Lead 修改越出“只追加 StructuredFileValidate”，且测试把权限回退固化为通过

- 锁定对象 `e5bbe87...` 的 `agent.json` 原允许 `FileDigest` 与 `ExportRedlineDocument`；当前 `agent.json:89-105` 虽保留 `FileDigest` 并追加 `StructuredFileValidate`，却删除了 `ExportRedlineDocument`。
- `tests/o1-boundary.contract.test.mjs:72-80` 还明确断言 `ExportRedlineDocument` 不在 allowlist，无法发现这类基线权限回退。
- 这与本轮“Lead 只在 allowed 追加 StructuredFileValidate，原 model/rawbytes 不动”不符。关闭：从精确锁对象恢复 Lead 原 allowed 集合，仅追加 StructuredFileValidate；测试比较基线 allowed 集合加这一项，并继续逐字校验 llm/raw bytes。

### P1-2 — 六成员独立 `npm test` 证据实际为失败

- 协调者的 `isolated-member-tests-2026-09-29.json` 显示 intake `passed:false`、`npm test` exit 1、执行 15 项；失败断言要求 live skill 包含 `party_role`。其余五成员通过。
- 当前 intake 源码 SHA 与该证据记录逐文件一致，故不是证据过期；六份 package/lock 虽各自带依赖（新增 YAML 测试不借父 `node_modules`），但“六成员均可独立复现”未成立。
- 关闭：修正 live skill/schema/test 的真实语义不一致后，由协调者重跑 `scripts/verify-member-candidates.py`；不得只改关键词让 regex 通过。

### P1-3 — canonical 根契约仍不唯一，存在重复拼接 case/object 根的实质风险

- intake `SKILL.md:834-837` 写 `<canonical_artifact_root>/<contract_object_id>/...`，同时称根已由 Lead 给定且“不得重复拼接案件根目录”。
- extractor `SKILL.md:61-62` 不使用该变量，另写 `<workspace>/contract-review/<case_id>/...`；risk 与 jurisdiction 又分别在 `canonical_artifact_root` 后追加 `<case_id>`（各自 `:53`）。
- Lead 只说传“canonical 根”，未定义它是团队根、案件根还是对象根。跨成员不能证明同一 case 只拼一次，也不能稳定对账绝对路径。
- 关闭：在 Lead 定义一个唯一根语义与逐阶段相对路径；四成员都消费同一已包含或未包含 case_id 的契约，并加跨成员路径组合测试。

### P1-4 — 49 条 reframed 的 guard 仍主要验证“自称保留”，未验证目标语义

- guard 仅要求 `semantic.category` 等于历史 key、`polarity` 等于历史 kind、`fact_constraint` 长度不少于 12；并未把这些约束与映射目标的类别、极性和源事实做可执行比较。
- 实例：`C01:must_not_flag:amount-in-words-mismatch` 映到 `amount-arithmetic-mismatch`；前者禁止误报大小写金额不一致，后者是可选的算术不一致检测，类别与极性行为并不等价。附加的英文 `fact_constraint` 只是声称“retains the amount fact”。
- mutation 只改声明字段或复用 ID，不能拒绝上述真实错映射。这正是“新增声称保留字段”而非实质保留。
- 关闭：逐条将历史源事实/禁止行为绑定到当前可执行 target；至少为大小写金额例增加源事实、目标极性和输出行为反例。R01 两项禁报本身已真实恢复，不应回退。

## 已核通过但不扩大结论

- 四个目标成员 `SKILL.md` 均只有文件首部一份 frontmatter，stage 为 O1/O2/O3/O3，上下游均为 Lead；原业务表、反例与纠正动作仍在，risk 九类固定分母与最多 8 个候选批次限制未混淆。
- R01 已恢复 `attachment-missing` 与 `party-name-inconsistency` 两项独立禁报及源锚点。
- O3 terminal event、settled receipt、ledger 已统一七字段；同 invocation 才可 settle/join，failed/cancelled 可进入 join 且保留 debt。
- Reporter O5 指令限定具体 read/write allowlist；DOCX 只对工具真实返回且已列明的完整路径做 FileDigest，禁止目录枚举与二进制 Read 冒充正确性/视觉验收。当前 agent 仍暴露 Ls/Glob，且平台无 per-call 文件沙箱，因此仅是指令约束，不能宣称强制隔离。
- Lead O1 示例由生产 `BUILTIN_TOOL_CATALOG` 与 `buildTypeBoxParameters` 验证真实 `document_path/schema_path/format`；错误别名、非法 format、对象型 schema_path 均拒绝。四个平台测试是 schema preflight，不是 Delegate/StructuredFileValidate dispatch。

## 测试与完整性

- `npm run check`：65/65 pass。
- Lead `CONTRACT_PLATFORM_SOURCE=... npm run test:platform`：4/4 pass；只证明 catalog/normalizer preflight。
- 未重复 `npm ci`、成员历史测试、平台全量或大 lint；采用协调者隔离结果并核对其实现、结果与当前文件 SHA。
- 开始/结束源码 SHA 清单逐项一致；测试未改源码。忽略 docs/evidence 与 `.git` 状态，不据此猜作者。

市场发布、真机、真实 dispatch、自主 DOCX（含接受/拒绝与视觉）、真实合同、法律正确性均未验；本报告不替用户签字。

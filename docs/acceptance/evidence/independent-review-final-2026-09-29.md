# 独立冻结候选审查（2026-09-29）

结论：**不通过；P0=0，P1=2，重要 P2=1。** A2 仍不应进入真机集成验收；B2 两项既有 P1 已关闭。

边界：独立只读审查候选源码；仅本报告落盘。未改源码，未 commit/push，未启动真机、模型/provider 或真实 Delegate，未跑平台全量/全仓 ESLint，未执行 `npm ci`。

基线已核：团队 `e1837f2931ec077b7bf522f5c223c0af5df840cf`；平台 `244a84b1bb562a23936d8d5de50bde694ebb666f`；六成员 HEAD 与 `members.lock.json` 完全一致。

## Findings

### P1-1 — A2 的“窄附录”被写成第二份 frontmatter，旧编排元数据与冲突指令仍生效

四个成员 `SKILL.md` 都在保留原文后追加了第二个 `--- name: ... ---` 块；平台 skill parser 只解析文件开头 frontmatter，后一个块只是正文。

- intake：首 frontmatter 为 1–36 行，第二份为 1044–1061 行；原正文仍说“下游条款抽取、风险、法域、报告”及 YAML 工具不存在时自动 conditional，附录改成只回 Lead、使用 StructuredFileValidate。二者靠“冲突时本节优先”的自然语言自解，机器元数据并未更新。
- extractor：首元数据仍 `pipeline_stage: 3`、`upstream: contract-intake`（28–30），第二份才是 `O2`、Lead（164–181）。
- risk：首元数据仍 `pipeline_stage: 5`、`upstream: clause-extractor`、`downstream: [lead, reporter]`（16–18）；第二份 O3/只回 Lead 在 67–84。
- jurisdiction：首元数据仍 `pipeline_stage: 4`、`upstream: clause-extractor`、`downstream: [lead, reporter]`（16–18）；第二份 O3/只回 Lead 在 68–85。

这不是纯格式问题：消费者读到的权威元数据仍指向旧 stage/upstream/downstream，正文同时保留“交下游/只交 Lead”“只读一次/分批”“单一证据/多证据”等冲突指令。四成员 knowledge tests 只做 regex 存在性检查，例如 intake 测试 10–11 行，只要旧文和附录同时存在就通过，不能证明语义继承或冲突消除。

关闭条件：每个技能只保留一份文件首部 frontmatter；把窄修订作为明确 override 正文而非第二份文档；逐项消解旧编排/交接冲突；测试解析真实 frontmatter 并断言唯一性、stage、upstream/downstream 和禁止旧表述。

### P1-2 — 49 个历史映射虽都有具体 ID，但至少两项未语义保留

guard 已正确阻止空泛 `reframed`，统计也确为历史 69 mandatory = 20 直接保留 + 49 映射 + 0 retired；但它只验证目标 ID 在同 case 存在，不验证原判据与目标语义等价。

- `R01:must_not_flag:attachment-missing` 映射到 `executed-or-authenticated-contract`（ground-truth 57、290）。历史判据明确是“第二条程序性组成文件不是附件清单，不得报附件缺失”（历史 1295–1299）；“公共空白模板不是已执行合同”不能覆盖附件误报判据。
- `R01:must_not_flag:party-name-inconsistency` 也映射到同一 `executed-or-authenticated-contract`（58、290）。历史判据是三方 `XXXX` 属占位而非名称漂移（1298–1299）；当前目标没有保留这一分类约束。

因此“49 个具体映射”不等于 49 个语义保留。现有 mutation tests 仅删 ID、换不存在 ID，不会拒绝把两个不同历史目标都映射到一个无关但存在的 ID。

关闭条件：至少恢复上述两个可执行 must-not-flag/coverage target 及来源理由；为每条 reframed 建立可审的语义类别/极性/事实约束，并加错极性、错类别、many-to-one 丢语义的 mutation tests。无需新增强制业务 schema。

### 重要 P2-1 — O3 invocationId 防早 join 已成立，但 terminal receipt 的跨层 shape 未统一

`actions.yaml` 331–403 已把两支真实 invocation、terminal event、settle、join 按相同 invocationId 绑定；事件测试证明无 terminal、错 invocationId、仅一支 settle 时 join 不可运行。这关闭了 A2 原 P1-3 的静态问题。

但三层字段并不一致：actions 的 terminal event 要求 `event_type, invocation_id, outcome, receipt_ref, searched_scope, reason`（364/380），join ledger 要 `branch_id, outcome, receipt_ref, searched_scope, reason`（402）；relations 的 `terminal_event_of.required_fields` 却是 `invocation_id, outcome, evidence`（relations 85）。测试模拟器仅检查属性存在，不校验类型、非空或正负 outcome 的条件字段；正负例也没有共同 schema。

关闭条件：统一 terminal event/settled receipt/ledger 的一个真实 shape（或明确转换契约），让 success/failed/cancelled 正负例走同一校验器；仍不要求业务动作全部成功。

## B2 复核

- Reporter persona 9 行已明确候选仅 `confirmed/refuted/unlocatable`，补漏独立 `additional[]` 且可空；跨 persona/principles/O4/O5 测试覆盖，原 P1-1 关闭。
- Lead platform test 直接 import 真实 `BUILTIN_TOOL_CATALOG` 的 Delegate 完整 metadata 和生产 `buildTypeBoxParameters`，loader 读取平台实际 `tsconfig.json`；非法类型/枚举负例被拒，原 P1-2 关闭。
- 边界：上述只是 Ajv/schema preflight；未执行真实 Delegate、fan-out、Agent 或工具调用。

## 工具权限实际语义

平台 `resolveConfiguredToolAllowlist`（tool-assembly 516–555）规定 agent.json 的 allowed 缺失、非数组或空/全空白时为 `undefined`，即不施加白名单；`["none"]` 才是 deny-all。非空 allowlist 严格过滤，denied 再剔除；技能/请求级空 allowlist 则是 deny-all。

`StructuredFileValidate` 是 catalog 中真实 low-risk、readonly、workerSafe builtin，参数为 document/schema/format；intake `agent.json` 已显式加入 allowed，因此在该平台基线并非“因 default_enabled.tools 为空而不可用”。实际调用仍受注册表、当前读取 scope、工作目录/skill schema 路径和委派 ceiling 约束；本轮未真机调用，不能宣称运行可用。

## 命令与计数

- `npm run check`：60/60 pass（含 oracle/workflow static guards）。
- intake `npm test`：15/15 pass。
- 四成员 knowledge tests：intake/extractor/risk/jurisdiction 各 1，共 4/4 pass。
- lead `npm test`：6/6；`test:platform`：3/3。
- reporter：9/9。
- 正式指定测试合计：97/97 pass。
- 额外诊断：`test:members` 首次因缺 `CONTRACT_MEMBER_SOURCES_ROOT` 0/1（配置错误），补真实 sources root 后 1/1 pass；不计入 97。

## 证据边界与工作区完整性

通过项属于源码静态检查、YAML/Ajv schema、fixture、事件模拟与生产 catalog preflight；不证明真实 Agent 执行、真并行、真实 receipt、模型稳定性、法律正确性、真实合同、DOCX 修订/接受拒绝/视觉或市场安装。

报告前团队 diff/status SHA-256：`e3a2257f...0e468` / `c128de10...1ed7df`；六成员 diff/status 摘要已逐仓记录。报告后再次核对 HEAD 与这些摘要，除本报告外不得变化。

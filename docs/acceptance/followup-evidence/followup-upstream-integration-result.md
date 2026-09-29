实施完成，未 merge、commit、push、rebase、reset，未调用其他 Agent、模型或成员仓。

主要结果：

- 原样保留上游发布资产：
  - `team.json`、`members.lock.json` 与 `origin/main` 哈希一致。
  - C09a、C09b 两份语料及 `make-c09.py` 与上游哈希一致。
  - 正式版本为 team 0.1.37、lead 1.0.22、intake 1.0.7。
- 当前规范 oracle 扩展为 14 个 source cases：
  - C01：R7 正例，禁止误报 R9。
  - C09a：R9 `conditional`，必须生成升级型 `PEND-001`、继续下游，并禁止映射成 R1。
  - C09b：R1 `blocked`、停止下游，并禁止降级成 R9。
- 旧 12 个 case 均保留；旧 history 解析摘要仍为：
  - `1a17baa686385ee250e874b45a19696651cb797b889ccd400be0158b5a4e8cc6`
- source bindings：
  - 原 88 个 binding 值逐值保留，并由 checker 重建旧投影验证。
  - 新 pin：`fc61f6373e9cab6132370945003f28cad6b538b9793f197871a84e64a4ba52f9`
  - 当前共 14 cases、129 targets。
  - 文件内明确记录旧 pin、旧目标数及增量关系。
- `check-evidence.mjs` 已改为只读取当前 `normative.cases`，不会把旧 history 当当前判据。
- `check-member-tool-ceiling.mjs` 保留原 CLI，并增加 `--lock`：
  - 默认验证正式 `members.lock.json`。
  - 显式 candidate lock 时按所选锁核对成员版本。
  - 检测到正式/candidate 源范围混用会失败。
- 上游真机叙述单独保存于 [upstream-0.1.37-live-baseline.json](<team-workspace>/testdata/contracts/upstream-0.1.37-live-baseline.json)，明确为 non-normative、非盲测、单次运行，当前 candidate 状态为 `not_run`。
- 根 README、CHANGELOG、设计、维护、测试、quickstart、handoff 及语料说明已融合 0.1.37/C09/candidate 边界。

验证结果：

- `npm run check`：通过。
- Oracle：旧 46 项全部保留，新增 4 项 C09/R7/R9/R1 测试，共 50 项。
- Workflow：34 项通过。
- 总计：84/84 通过。
- 当前 normative literal evidence：96 条，覆盖 14 个源文件，全部命中。
- `git diff --check`：通过。
- 两个 checker 的 Node 语法检查：通过。
- 未运行 tool-ceiling 的真实成员源码检查：工作区没有所选锁对应的成员源码，按要求未读取成员仓、未盲用 candidate 源。

未整合事项：

- 协调者并发写入的 `docs/acceptance/**` 修改及新增文件仍在工作树中；我未修改、覆盖或纳入本实施。
- 未声明独立 review、真机、production 或最终发布通过；后续仍需不同 Agent review。

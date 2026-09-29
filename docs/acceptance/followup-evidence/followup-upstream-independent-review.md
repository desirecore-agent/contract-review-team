结论：**team delta 发布 NO-GO；新成员兼容性 unverified。**

P0：0  
P1：3

### P1 findings

1. **C09a/C09b source SHA 错误，84 项检查实际未通过**

   固定上游原始字节与当前文件完全一致，但 normative oracle 和 bindings 记录了不同摘要：

   - C09a 实际：`98f546c3…b7779f6`；登记：`a64cba37…224c`
   - C09b 实际：`20a9462e…87aaf`；登记：`bb6052ea…8d3bbe`

   错误位置：[ground-truth.yaml](<team-workspace>/testdata/contracts/ground-truth.yaml:957)、[oracle-source-bindings.json](<team-workspace>/testdata/contracts/oracle-source-bindings.json:1437)。

   `npm run check` 在 oracle 阶段失败。单独执行结果：

   - Oracle：48/50 pass，2 fail
   - Workflow：34/34 pass
   - 合计：**82/84，不是期望的 84/84**

2. **`--lock` 没有验证所选源码的 commit/contentHash 身份**

   Checker 只检查 `agent.json.version === lock.version`，见 [check-member-tool-ceiling.mjs](<team-workspace>/shared/resources/check-member-tool-ceiling.mjs:71)。

   内存最小反例：

   - lock：lead `1.0.22`，commit `d5818345…`
   - candidate：同为 `1.0.22`，commit `00000000…`
   - 当前第 73 行谓词结果：`acceptedByLine73: true`

   因而无法区分“相同 version、不同 commit”的 published/candidate 源，存在错误拿候选源码做正式发布检查的路径。默认 lock 与显式 candidate CLI 虽已分离，但身份校验不足。

3. **固定上游 24 路径存在内容丢失**

   对固定上游提交新增内容做逐行保留核对，共检查 794 条非空新增行，当前工作树有 250 个新增行实例不再存在；其中部分属于重构，但存在明确的非等价删减：

   - CHANGELOG 将五条 0.1.37 发布事实压成一条，丢失 YAML 修复、工具截断根因、锁纠错及 contentHash 验证细节。
   - 根 README 与 maintenance 删除 `check-evidence`、tool-ceiling 的运行命令及失败语义。
   - contracts README 删除 C09a/b 两行派生约束、R7/R9/R1 对照细节和单次非盲历史说明。
   - 上游 evidence checker 被整体替换；当前版本确实只读 normative，但不再保留上游零依赖分发属性及原检查范围说明。

### 已核对通过的 delta 项

- 起始与结束 `HEAD` 均为 `9fe002a96d366ce9f3825f7dd9a6b442d794275e`。
- 固定上游：`346343b63347f70603fe47c14887b6f1fb799275`。
- `team.json`、`members.lock.json`、C09a、C09b、`make-c09.py` 原始字节均与固定上游一致；team 为 0.1.37。
- 旧 12 个语料文件未改；history 摘要保持 `1a17baa6…8cc6`。
- normative 为 14 cases：
  - C01 passed，并禁止 R9。
  - C09a conditional、`PEND-001` 升级、下游继续。
  - C09b blocked、下游停止，并禁止降成 R9。
- bindings 共 129：旧 88 投影精确重建为 `47a07dbb…458f85`，新增数量确为 41；但新增 C09 source SHA 因 P1-1 不正确。
- 畸形输出、反极性、required 丢失等负向测试仍通过。
- `check-evidence.mjs`：96 条 normative literal、14 source files，通过；代码只遍历 `normative.cases`，未借用 history。
- 两个新 checker 的 Node syntax check 均通过；`git diff --check` 通过。
- 上游单次、非盲 live 结果仅作历史材料，没有继承为当前通过。

未读取受阻成员 source，未运行真实成员 tool-ceiling，因此正式新成员兼容性明确为 **unverified**，不能把跳过视为 pass。全程未改文件、未调用其他 Agent、未 fetch 或联网。
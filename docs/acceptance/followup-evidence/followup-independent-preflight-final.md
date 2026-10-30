结论：**NO-GO（候选锁预检脚本）**；**GO（15 项 harness 窄范围）**。

- P0：0
- P1：2
- 测试未由我亲自重跑；结论来自源码审查与现有日志核对。

### P1

1. **未强制精确六成员集合**

   [prepare-followup-candidate-lock.mts:23](<<platform-workspace>/workspace/prepare-followup-candidate-lock.mts:23>) 仅遍历 `published.agents`。平台 schema 又允许任意数量的 `agents`，因此缺少成员的已发布锁仍可能产生 schema-valid 候选。脚本应先断言成员键集合精确等于指定六成员，再进行 clean/HEAD 检查。

2. **平台实现未固定且未检查 tracked-clean**

   [prepare-followup-candidate-lock.mts:45](<<platform-workspace>/workspace/prepare-followup-candidate-lock.mts:45>) 直接 import 当前工作树中的平台实现；[第 62–64 行](<<platform-workspace>/workspace/prepare-followup-candidate-lock.mts:62>) 只在事后记录 `HEAD` 和实现 SHA，没有预先要求平台 HEAD 为 `1536138e8c71db71b906d436212812086268e3c9`，也没有拒绝 tracked 修改。故修改过的 `lock.ts/schema` 仍可能输出 `platformSchemaValid: true` 的候选，而报告中的 `platformCommit` 不能证明实际执行的是该 commit 内容。

### 已确认正确

- harness 的 `ASSETS` 已包含顶层 `lib`；复制逻辑排除任意路径段中的 `workspace`。
- 负例日志显示旧复制范围下新增测试失败；最终日志记录 15/15 通过。
- `followup-isolated-members-v1.json` 为六成员 `passed: true`，Reporter 包含 `lib/reporter-contract.mjs`，没有记录任何 `workspace/` 文件。
- dirty 负例确实在 `contract-review-lead` clean 检查处中止。
- 候选脚本通过 `git show <HEAD>:agent.json|persona.md|principles.md` 复制三身份文件，再直接调用平台 `computeMemberContentHash`；与实际 v3 算法一致。
- `contentHash` 不覆盖 skills，但报告明确声明这一点，并以 Git commit/tree 表示完整源码身份，没有虚假宣称。
- 输出使用独立 evidence 文件和 `wx`，并复核已发布 `members.lock.json` 字节未变；未发现覆盖已发布锁的路径。
- 没有复制模型偏好、启动实例、approve、安装或生产实施行为。
- clean 正例文件目前不存在，不能宣称候选锁已最终生成或通过。

### 实际读取的身份

- `scripts/verify-member-candidates.py`：`ffed2653d890aa17694bcf3c351f9bec702fceb725bd82a8b15232248631c2ac`
- `scripts/tests/test_verify_member_candidates.py`：`dfff9dca727b0622ac36d927d5f4573696bd20d9ebc27290f254d6887947233d`
- `prepare-followup-candidate-lock.mts`：`909e3c790b713fbad4db6c9c1d0d0bc39a2431e2fbdf994dc8bb4338a9aab56c`
- 平台实际 HEAD：`1536138e8c71db71b906d436212812086268e3c9`

边界：仅完成指定源码和证据的只读复审；未复审 oracle/成员技能内容，未运行测试、修改文件、commit/push、访问网络/端口/凭据或启动实例。也不据此宣称法律、真机、安装、运行时安全沙箱或生产验收通过。
# 独立只读复审报告

**结论：GO（仅限本轮指定范围）**

- 审查范围：`verify-member-candidates.py`、对应测试，以及删除虚假 `ExportRedlineDocument` 声明的范围争议。
- **P0：0**
- **P1：0**
- 不包含 oracle、其他成员技能、真实运行、自主 DOCX 或发布验收结论。

## 工装结论

[verify-member-candidates.py](<team-workspace>/scripts/verify-member-candidates.py:79) 仅在以下条件全部成立时通过：

- 完整且唯一的 Node summary；
- `exitCode == 0`；
- `tests > 0`；
- `pass == tests`；
- `fail/cancelled/skipped/todo == 0`。

字段缺失、重复摘要、零测试、取消、跳过、TODO、失败计数、总数不一致及非零/空退出码均 fail closed。未发现可错误记为 pass 的实证路径。

测试覆盖见 [test_verify_member_candidates.py](<team-workspace>/scripts/tests/test_verify_member_candidates.py:21)，包括真实 Node 正常和全跳过子进程。

测试记录：

- 修复前：4/12 通过、8/12 失败，符合旧逻辑缺陷。
- 修复后合成用例：12/12 通过。
- 最终既有证据：14/14 通过，含两个真实 Node 子进程用例。
- 本次获准命令实际运行：12 个通过、2 个错误；错误均因只读沙箱不存在可写临时目录，未进入 Node 子进程，不是断言失败。按要求未改变沙箱或测试。
- 日志：[negative](<team-workspace>/workspace/evidence/followup-harness-negative.log)、[positive](<team-workspace>/workspace/evidence/followup-harness-positive.log)、[final](<team-workspace>/workspace/evidence/followup-harness-final.log)。

## ExportRedlineDocument 争议

依据完整用户授权，删除该声明属于授权内修正，不构成 P1：

- 精确 `members.lock.json` 基线中，Lead 和 Reporter 原先确实声明了 `ExportRedlineDocument`。
- 平台精确 HEAD 为 `1536138e8c71db71b906d436212812086268e3c9`。
- 指定平台 catalog、`export-document.ts` 和 `docs/exporter.ts` 中不存在 `ExportRedlineDocument`。
- 平台实际提供 `StructuredFileValidate` 和普通 `ExportDocument`；后者只是把 Markdown/文档转换为 PDF/DOCX，不提供修订跟踪或红线能力。
- 因此不应恢复不存在的工具名称；当前候选也**不能据此宣称自主红线 DOCX 已实现**。

## 源文件 SHA-256

审查前后完全一致：

- `scripts/verify-member-candidates.py`：`ce60cffb85b66cf99d106f498a37c11f7e9ada17cc3529c7f22a48858ee3523b`
- `scripts/tests/test_verify_member_candidates.py`：`af7ea803929fcadbdb93cbe7a3dd4f394a7158c96648d042190132cb5271f206`

未修改源码，未 commit/push，未启动 App、模型或实例，未访问端口、进程或凭据。
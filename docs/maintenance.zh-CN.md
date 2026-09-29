---
last-reviewed: 2026-09-29
---

# 维护与发布

[English](maintenance.md) · [设计](design.zh-CN.md) · [测试](testing.zh-CN.md)

## 权威来源与版本

| 文件 | 核对内容 |
|---|---|
| [team.json](../team.json) | 团队身份、组长、成员和分发版本；已发布基线 0.1.37。 |
| [members.lock.json](../members.lock.json) | 每个成员仓库、准确 commit、版本和内容摘要。 |
| [共享规则](../shared/rules.md) | 注入成员的指令；行为改动需真机回归。 |
| [资源](../shared/resources/README.md) | 包版本、范围、规则、法条和来源；读取各包元数据。 |
| [package.json](../package.json)、[package-lock.json](../package-lock.json) | 本地 guard 依赖；manifest 当前为 0.1.30，与团队 0.1.37 不同。本文不推断其历史意图。 |
| [CHANGELOG](../CHANGELOG.md) | 面向人的历史，不推断未记录版本的内容。 |

仓库内容和市场记录是不同发布面。团队 PR 合并不证明市场已更新或安装成功。

## 本地检查

在仓库根目录执行，环境需有 Node 和 npm：

```sh
npm ci
npm run check:gates
node shared/resources/jurisdiction-packs/jurisdiction-cn/statutes/check-temporal.mjs
node testdata/contracts/check-evidence.mjs
node shared/resources/check-member-tool-ceiling.mjs   # 读取已安装成员仓库
```

先核对当前目录存在 `team.json` 和 `package.json`。`check:gates` 调用门禁字面量和 intake 契约检查。temporal 脚本按自身所在目录查文件，检查法条登记与时间元数据一致性。`check-evidence.mjs` 运行时只用 Node 核心模块，按 oracle/source 原始字节和当前 normative literal 核对已审阅 JSON 索引。只能显式执行 `npm ci && node testdata/contracts/generate-evidence-index.mjs` 重新派生并审阅 diff；运行时不会自动重建来掩盖漂移。成员 checker 不依赖 NPM 包但要求 native Git，先核对已安装目录确为仓库根、HEAD 等于完整锁定提交、`agent.json` 与提交 blob 原始字节相同，再检查工具上限；开发布局可传 `--agents-dir` 与 `--lock`。缺 Git/仓库/commit 或配置 dirty 都按未验证失败。这不是平台 v3 content hash 或全树/运行能力证明。它们不调用真实模型、不从市场安装、不验证全部历史 oracle、不证明法律正确性，也不证明 DOCX 已可用；当前对可选 `ExportDocument` 的排除仍留下已知 DOCX 能力债。

成员工具检查仅证明所选精确源码中的有限、明确工具名关系：先扣除成员自身 denied，再检查组长 allowed/denied，并排除平台禁止子体继承的 Delegate、DelegateControl 和 spawn_agent。`allowed: []` 在平台表示不施加白名单，不是零工具；本检查无法枚举真实注册表时明确返回未验证失败。`["none"]` 才表示禁用全部工具。畸形、空白或通配策略不能获得静态通过，可选 ExportDocument 缺口单列能力债，不计作已满足。证据索引绑定每个规范 source，包括只有阴性检索或没有 literal 的案例；源声明摘要不符时生成器拒绝写出。重新生成索引后需独立审阅并同步 checker 中的已审阅摘要围栏，不能在运行时自行接受新摘要。

另需检查 Markdown 链接、中英文配对，以及数量/版本与源文件一致。修改语料时重新核对证据引用和版本对比不变量。明确解决已知 oracle 差异并记录含义，不能为通过测试静默重写历史。

## 成员与资源更新

1. 在成员或资源所属仓库修改并审阅，说明受影响目标、预期行为和失败样例。
2. 使用 DesireCore 支持的发布/锁定流程登记已审阅成员的准确 commit 和版本。通过平台权威实现验证内容摘要，不另造 hash 算法或沿用陈旧摘要。
3. 确认每个成员解析到预期内容；本机凭据和模型偏好不写入发布资产。工具权限有改动时运行成员工具上限 checker。
4. 执行相关 guard 与真机场景。委派、范围、证据处理或导出改动需要对应端到端验收，不仅检查文本。
5. 同步双语文档与日志，记录实际结果和未完成检查。纯文档更正不能关闭运行缺陷。

新增外国法目录不扩大当前 CN-only 团队范围。范围变更需要政策、知识、成员行为与验收协同完成后发布。

## 发布、升级与恢复

通过团队仓库已审阅 PR，遵守当前分支保护。记录合并 commit 和实际创建的 release/tag，不能声称未创建的 tag 已发布。通过市场仓库审阅流程更新对应条目，核对团队来源和锁定依赖。

随后在新实例通过市场安装，核对团队/成员版本及摘要，执行[验收](testing.zh-CN.md)。已有实例升级单独测试，保留原文与旧审查产物。记录安装失败或本地漂移，不能只凭目录元数据声称成功。

升级前保留旧团队 commit、成员锁、市场引用和用户产物。恢复时发布已审阅的 revert，或通过平台支持的方式恢复已知正常分发，核对实际安装内容并重跑相关检查。恢复必须保留用户文档，并解释剩余兼容性问题。

## 未完成工作

共享七步指令与 O0–O5 设计仍需对齐行为并真机回归。公开可复验全流程证据、重复一致性、获授权真实合同验证及自主修订导出仍是验收工作。商业待决不妨碍交付待确认报告或明确模拟的产品测试。历史证据限制见[设计](design.zh-CN.md)。

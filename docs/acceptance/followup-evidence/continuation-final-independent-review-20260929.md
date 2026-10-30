## 最终窄范围只读 Review

**结论：GO（仅限团队侧源码与 fixture）**

- P0：0
- P1：0
- P2：0
- HEAD：`9fe002a96d366ce9f3825f7dd9a6b442d794275e`
- 未修改文件，未执行 commit/push/fetch/merge，未访问成员上游源码、实例、端口或凭据，未委派 agent。
- 未独立重跑受只读沙箱限制的 fixture 测试；协调者日志仅作为外部执行证据引用。

## 原 P1 关闭结论

1. **成员自身 denied 未参与有效权限计算：已关闭。**

   [check-member-tool-ceiling.mjs:132](<team-workspace>/shared/resources/check-member-tool-ceiling.mjs:132) 建立成员 denied 集，[第 135 行](<team-workspace>/shared/resources/check-member-tool-ceiling.mjs:135) 在与父级比较前排除成员自有 denied。

   对 `allowed: ["Read","Bash"]`、`denied: ["bAsH"]`，有效需求仅为 `Read`；测试确实要求该场景成功，不再产生原误报。

2. **generator 未绑定所有 normative source：已关闭。**

   [generate-evidence-index.mjs:26](<team-workspace>/testdata/contracts/generate-evidence-index.mjs:26) 对每个 normative case 先读取并登记其自有 source，不再依赖 literal evidence。

   empty evidence 和 negative-only evidence 均有生成、检查、修改 source 后失败的完整测试，因此不是仅检查生成 JSON 键数的表面覆盖。

## 关键语义核对

- 空或缺失 `allowed`：明确按平台 unrestricted 处理；有限静态 checker 在无法枚举真实 registry 时 fail-as-unverified，没有伪装成零权限。
- `none` sentinel：映射为 deny-all；混有其他名称时也不会把其他项误当有效能力。
- `DelegateControl`、`Delegate`、`spawn_agent`：规范化后按递归工具集合排除。
- 父级 denied：即使工具同时出现在父级 allowed，仍阻止成员的有效需求。
- 成员自身 denied：大小写归一后优先从有效需求扣除。
- optional `ExportDocument`：只记录并输出能力债务，不计为已经满足；成功摘要同时报告实际豁免数。
- 空白、非字符串、畸形名称及 `server__*` 等通配策略：均 fail-as-unverified，不会误绿。
- generator 遇到声明的 source SHA-256 与当前字节不符时，在最终 `writeFileSync` 之前抛错；测试逐字节确认旧 index 保持不变。
- 默认 index 仍为 **96 literals / 14 sources**。
- 默认 index pin 仍为 `b4dbbe6effca260f8bab99b3548865d69c0c309505038eaa729d46081b9900fb`，未改变。
- 相关测试直接断言上述行为；不要求它们实现通用平台权限引擎，也没有把静态测试表述为真实模型运行验证。

协调者证据记录：

- 负向回归：四项在修复前全部失败。
- 正向回归：`4/4`。
- 团队最终测试：`115/115`。

## 当前准确 SHA-256

```text
2d26fd8571c970ff4e03f1cb4f2cc763ce9fe88c7ab669e101da6276fb000fd3  shared/resources/check-member-tool-ceiling.mjs
60e6346cea5a5b0e7aa6c4c1e6c44546aa17c4a0e4f535b5ae2f6b7961ca1c23  shared/resources/tests/member-tool-ceiling.test.mjs
08515fd79ff889bb0e889a02698b49d14db11672596b0bcb7ccd1d75451cf80c  testdata/contracts/generate-evidence-index.mjs
0a9f3b699b57af8c9728f3093efaf20f74b32b90f93ca1716fd6163cc41521cc  shared/resources/tests/evidence-index.test.mjs
3c53ce047adbdf3be3d51bbccf4c2764f49efd6dd3c7f9b3c7cfbb128673203e  testdata/contracts/check-evidence.mjs
b4dbbe6effca260f8bab99b3548865d69c0c309505038eaa729d46081b9900fb  testdata/contracts/evidence-index.json
```

本结论严格限定于当前团队侧源码和 fixture。**成员 0.1.37 实际兼容性、真实平台权限行为及真机运行仍未验证。**
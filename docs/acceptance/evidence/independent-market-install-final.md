## 独立复核结论

**候选可继续进入人工/真机验证；未发现 P0/P1。旧 P1 已确认修复。**

### Confirmed

- `partial + []` 与 `partial + undefined` 均进入 `incomplete`，不会显示 clear、ready、绿色卡片或“已安装”。
- `partial + pending` 保留并渲染实际 todos；完整安装的 pending todos 同样保留。
- 两个反例测试覆盖 `[]` 和 `undefined`。
- UI 操作仅调用普通导航回调，没有代替规则核准、执行授权或目录绑定。
- 真实中英文 i18n 均含 incomplete 文案；真实字典结构、非空值及占位符契约测试通过。
- installer：
  - 首次浅 clone 后 checkout 精确 SHA。
  - 失败时执行 `fetch(ref: commit, depth: 1)`，随后仍 checkout 相同 SHA。
  - 精确 fetch 失败才进行一次完整 clone；不回退默认分支。
  - 最终读取实际 HEAD 并与锁定 SHA 比较。
  - `callerAgentId`、`extraGitConfig` 透传浅 clone、精确 fetch和完整 clone。
  - SSRF 策略在创建目标目录前检查。
  - 最终失败进入统一清理。
  - 重试有界：一次浅 clone、一次精确 fetch、至多一次完整 clone。
  - 完整 clone 失败时通过 `AggregateError` 保留浅 checkout 与精确 fetch 原因。

### 潜在缺口（非 P0/P1）

- [installer.ts](<platform-workspace>/packages/agent-service/src/team/installer.ts:516) 的 JSDoc 仍描述“checkout 失败直接完整 clone”，与当前“先精确 SHA fetch”实现漂移。
- resource 测试验证了真实 Git 行为、精确 HEAD、浅仓库和失败清理，但尚无 mock 用例逐项锁定 `remoteOptions`、调用次数上界及完整 cause 结构。
- `market-i18n-real-repo.test.ts` 因外部 market repo 夹具不存在而 22 tests 全部跳过；不计为通过。
- resource 测试存在 watcher/socket/异步 auto-commit stderr 噪声，但测试和断言均通过。

### 实际验证

- MarketTeamPostInstall unit：1 文件，12/12 tests 通过。
- installer resource：1 文件，5/5 tests 通过。
- installer unit：1 文件，14/14 tests 通过。
- 真实内置 i18n 契约：1 文件，4/4 tests 通过。
- 合计：**4 个文件，35/35 tests 通过；另 1 文件 22 tests skipped。**
- ESLint：仅两个小 app 文件，**通过**。
- `git diff --check`：通过。
- 测试层次：jsdom UI、mock installer unit、真实本地 Git/file:// resource；**没有真机或真实网络市场安装证据，不能声称真机通过。**

### 当前六文件 SHA-256

```text
2b85b8c832b70c47d2c6770242468e2e3f0c68171c685cea8fb322693ba5153c  MarketTeamPostInstall.tsx
f96749e7bc57969f43d290c36859dd2070c2f753b4419be593351fe3620f146b  MarketTeamPostInstall.test.tsx
98a9c7ab1ffbc7a0be21ae5ddb773d5f061b4a833f50d2e676d4cf4260d42ab6  en-US.ts
a40684cdfb83da66ad3eb8f44437c0a5c6070b9f5396cab70778ec321a7e1183  zh-CN.ts
b36552465797536276b6246fd3eb67cb8ed9c9fcb9ae8783ab3375bc4c7bf5ab  team-installer-shallow-retry.resource.test.ts
03d1504219387252ac2618afda3e0fec143f44ea6f0cbb8a1d1b357ab1025453  installer.ts
```

起止 HEAD 均为 `244a84b1bb562a23936d8d5de50bde694ebb666f`，六个源码文件起止 SHA 一致。未改源码、未 commit/push、未启动或停止 App、未触碰凭据/模型/授权。
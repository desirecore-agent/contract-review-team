已完成 P1-2 / P1-3，未修改禁止范围文件，HEAD 仍为 `9fe002a96d366ce9f3825f7dd9a6b442d794275e`，未 commit/fetch/push/merge/rebase/reset。

主要变更：

- [check-member-tool-ceiling.mjs](<team-workspace>/shared/resources/check-member-tool-ceiling.mjs)
  - 核验完整 lock commit、真实 repo 根、HEAD 和提交内 `agent.json` 原始字节。
  - 缺 Git、非仓库、缺 commit/blob、配置 dirty 均 fail closed。
  - 保留默认布局、`--agents-dir`、`--lock`。
  - 明确 native Git 前置；不声称验证全树、运行能力或平台 v3 hash。
  - `ExportDocument` 仅为 optional 排除，并明确当前 DOCX capability debt。

- [check-evidence.mjs](<team-workspace>/testdata/contracts/check-evidence.mjs)
  - 安装后仅使用 Node 核心模块。
  - 校验 oracle 原始字节 SHA、全部 source 原始字节 SHA、96 条 current normative literal。
  - 空 quote、未知 source case、非法路径、零 source/literal、索引漂移均失败且错误输出有界。

- 新增显式生成器 [generate-evidence-index.mjs](<team-workspace>/testdata/contracts/generate-evidence-index.mjs) 和派生索引 [evidence-index.json](<team-workspace>/testdata/contracts/evidence-index.json)。
  - 生成路径需要 `npm ci`/`yaml`。
  - 仅从 `normative.cases` 派生，不读取 history。
  - 运行时不会自动重建索引。

验证结果：

- 新增专用测试：`13/13` 通过。
- 负例覆盖：同版本错 HEAD、无 repo、dirty 配置、lock 缺项、参数不全、oracle/index 漂移、空 quote、未知 source case、非法路径、零 cases/literals。
- 实际 evidence CLI：`96 literals / 14 source files` 通过。
- `npm run check`：`98/98` 测试通过；oracle/workflow/evidence 均通过。
- `git diff --check`：通过。
- 正式成员源码仍受安全检查阻断，未运行真实成员 ceiling；该范围保持 **unverified**。

关键 SHA-256：

- ceiling checker：`00d8aee7935f75d65ccba959fa6d31b4f74b1757326795b9fab368ebd71bb632`
- evidence checker：`1c5d58ed3df22455f96ee1685a0a52b609a6782db197ed6f21a865081816e22c`
- evidence generator：`557abd6463598d0e6adcd6082c39b5f66406e1ea3b0d57a69c67ff4bf7d4cf86`
- evidence index：`b4dbbe6effca260f8bab99b3548865d69c0c309505038eaa729d46081b9900fb`
- 最终 YAML 原始字节：`c4474f683f2b4dbb46e41787b9f8ef73d617c5edae7422bd8342e24c65f73e6a`

同时恢复了双语 README、maintenance、contracts README 和 CHANGELOG 中要求保留的 0.1.37 逐项事实、命令、失败语义、C09 派生约束及单次非盲历史限制。
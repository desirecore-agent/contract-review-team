# Contract Review Team

## 关于此团队

本目录是 [DesireCore](https://desirecore.net) 团队仓库,记录了团队的组织架构(`team.json`)、成员声明(`members.json`)、精确锁定(`members.lock.json`)和共享资源(`shared/`)。

## 文件说明

- `team.json` — 团队配置(成员列表、supervisor、类型等)
- `members.json` — 成员声明(类似 npm 的 dependencies)
- `members.lock.json` — 成员精确锁定(类似 package-lock.json)
- `shared/` — 团队公共技能、记忆与协作规则
- `testdata/` — 回归语料与 ground truth(见下)
- `workspace/` — 团队共享工作目录(默认不入版本)

## `shared/resources/jurisdiction-packs/jurisdiction-cn/statutes/` — 法条全文库

判据与原文分家：`rules.yaml` 是**判据**(「试用期不得超过六个月」这类可直接比对的阈值),
`statutes/` 是**原文**(法条逐字文本,供报告引用与人工复核)。有了原文,报告里的条号才能
写成可验证的东西,而不是「包内记载」。

9 部法、2030 条、584 KB,来自 [ouyangyipeng/Legalize-CN](https://github.com/ouyangyipeng/Legalize-CN)
(默认分支 `history-rebuild`,不是 main)。法律法规文本依《中华人民共和国著作权法》第五条
不受著作权保护。

**检索前先读 `statutes/index.yaml`** —— 那里记着三条纪律和几个会静默产生错误结论的坑:

- 上游 frontmatter 有系统性错误:9 部里 5 部的 `status`/`title` 不可信
- **条号在、内容对不上**:仲裁法 2025 修订后序号整体重排,旧条号指向完全不同的内容
- 库内有三种条文标题格式,只按 `^#### 第X条` 检索会让整整 261 条查不到、看起来像「法条不存在」
- 索引本身也可能出错,与全文文件冲突时**永远以全文为准**

## `testdata/` — 回归语料

11 份合同 + `ground-truth.yaml`,每次改动提示词、工具或流水线后跑一遍,用同一份 ground truth
判定通过或失败。分两类:

- `C01`–`C08` 虚构语料,缺陷是人工植入的 —— 保证每个检查点都有对应语料
- `R01`–`R02` 真实公开文档,缺陷是原文档自带的 —— 人工构造想不到的那类

R 系列的价值在 `README.md` 里有完整说明。一个例子:R01 引用了已废止五年多的《合同法》,
这种缺陷不会出现在虚构语料里,因为写语料的人不会想到去引用一部废止的法律。

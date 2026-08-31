# 合同审查团队共享资源（`shared/resources/`）

> **版本**：本体 `onto-v1` ｜ 规则 `rules-v1` ｜ 动作 `actions-v1` ｜
> 知识包 `base-v1` / `cn-v1` / `us-v1` / `custom-v1`
> **知识库基准日期**：2026-08-31
> **设计依据**：`.design/合同审查智能体团队-设计蓝本.md`（权威来源）

这套资产是**整个团队的事实基准**。蓝本第十四节把它说得很清楚：
「几个 Agent 处理的是不是同一个对象」是最关键的质量指标。
多 Agent 系统里最难发现的失败不是某个 Agent 出错，而是每个 Agent 各自输出都说得通，
放进业务链就错了——因为它们处理的根本不是同一个对象。这套文件存在的全部意义，
就是让「同一个对象」成为一件可验证的事。

全部内容是 **YAML 与 Markdown**，没有一行代码。按 DesireCore 的数据驱动原则，
行为由数据决定：要改变团队的判断，改这里的规则和描述，不是改 Agent 的提示词。

---

## 一、目录结构

```
shared/resources/
├── README.md                      ← 本文件
├── business-ontology/             ← 业务本体：对象、关系、规则、动作
│   ├── contract.yaml              ← 对象模型（合同/附件/修订/当事方/条款/回执）
│   ├── relations.yaml             ← 对象间关系与 10 项派生检查
│   ├── rules.md                   ← 企业规则与例外（流程与协作层）
│   ├── actions.yaml               ← 可执行动作的前置条件 + 4 道 Human Gate
│   └── test-cases/                ← 8 个历史错误样本 + 索引
│       ├── _index.yaml
│       ├── TC-001-attachment-swap-zero-diff.yaml
│       ├── TC-002-party-name-drift.yaml
│       ├── TC-003-placeholder-passthrough.yaml
│       ├── TC-004-jurisdiction-conflict-missed.yaml
│       ├── TC-005-liability-cap-exists-but-unreasonable.yaml
│       ├── TC-006-blank-merged-into-pass.yaml
│       ├── TC-007-reviewer-echoed-prior-reasoning.yaml
│       └── TC-008-boilerplate-false-positive.yaml
├── jurisdiction-packs/            ← 法域三层知识包
│   ├── base/                      ← 通用层（与法域无关）
│   │   ├── pack.yaml
│   │   ├── missing-clauses.yaml   ← 9 项关键缺失条款检查
│   │   └── market-benchmarks.yaml ← 4 条市场标尺 + 偏差阈值
│   ├── jurisdiction-cn/           ← 中国法
│   │   ├── pack.yaml
│   │   └── rules.yaml
│   ├── jurisdiction-us/           ← 美国法
│   │   ├── pack.yaml
│   │   └── rules.yaml
│   └── custom/                    ← 企业红线（模板，交给用户改）
│       ├── pack.yaml
│       └── redlines.yaml
├── risk-lexicon/                  ← 风险触发词库（29 条触发项 / 8 类目 / 177 条反例）
│   ├── pack.yaml                  ← 版本、五步判读协议 M1–M5、benchmark_locators
│   ├── triggers-zh.yaml           ← 中文触发条目
│   ├── triggers-en.yaml           ← 英文触发条目（与中文同 id、同顺序、语义字段零漂移）
│   └── README.md                  ← 扩展方法：先找到失败样本再加条目
└── severity-mapping.yaml          ← 严重度词表权威映射（蓝本三档 ↔ 评分四档 ↔ 验收判据）
```

---

## 二、三层优先级：`custom > jurisdiction > base`

蓝本第六节。三层各管一件事，职责不重叠：

| 层 | precedence | 管什么 | 不管什么 |
|---|---|---|---|
| `base` | 10 | 通用风控与行业惯例：该有哪些条款、数值通常在什么区间 | 任何国别法条 |
| `jurisdiction` | 20 | 国家/地区制度约束：强制性规定、法定上限、无效情形 | 企业内部偏好 |
| `custom` | 30 | 企业自定义：模板、审批习惯、内部红线 | 放宽法律强制性规定 |

### 合并算法

1. **合并键**是规则条目的 `id`。跨层同 `id` 视为同一条规则的不同层版本。
2. 高层覆盖低层时，高层条目**必须**写 `overrides` 字段列出被覆盖的 id，
   并写 `override_reason`。不写 `overrides` 的条目视为**新增**，与低层规则并存。
3. 新增与低层并存时，两条都判，**取更保守者**。
4. **强制性下限**：`custom` 层不得放宽 `jurisdiction` 层 `mandatory: true` 的规则。
   企业红线可以比法律更严，不能比法律更松。试图放宽的条目被忽略、按
   `jurisdiction` 层执行，并输出冲突提示（不阻断流程，但必须在报告中显示）。
5. 同优先级两条规则判定相反时，取更保守者并记 `failure_mark`，
   **禁止 Agent 自行择一**。

### `base` 层的一条硬约束

`base` 层的结论**永远不能单独构成合规结论**。没加载法域包时只能输出
「通用风控视角的观察」，不能写「合规无异常」——样本 `TC-004` 记录的正是这个错误：
用 base 层审一份声明适用中国法与 GDPR 的合同，输出了格式完整、内容整体无效的报告。

---

## 三、版本号语义

### 三种版本号

| 版本号 | 格式 | 何时递增 | 不一致时 |
|---|---|---|---|
| `ontology_version` | `onto-v1` | 对象模型字段增删或语义变化 | 人工确认 |
| `pack_version` | `<pack_id>-v<n>` | 规则数值或判据变化 | **阻断**（法域包与法域线索不一致时） |
| `knowledge_base_version` | `YYYY-MM-DD` | 知识内容基准日期更新 | 重算历史样本 |

`jurisdiction_pack_version` 的取值就是所加载法域包的 `pack_version`（`cn-v1` / `us-v1`）。
蓝本第八节明确：**与法域线索不一致时阻断**，不是提示后继续。

### 完整版本矩阵（蓝本第八节）

每份报告与每条回执必须携带五个维度，缺一则无法做历史回放：

| 维度 | 不一致时的处理 |
|---|---|
| `skill_version` | 重跑 |
| `server_version` | 人工确认 |
| `knowledge_base_version` | 重算历史样本 |
| `jurisdiction_pack_version` | **阻断** |
| `parser_revision` | OCR 升级后不复用旧结论 |

任一不一致时输出「数据对齐建议」，**而非自动放行**。

---

## 四、每个文件被谁消费

| 文件 | lead | intake | extractor | scanner | auditor | reporter |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| `business-ontology/contract.yaml` | ● | ●核心 | ● | ● | ● | ● |
| `business-ontology/relations.yaml` | ○ | ●核心 | ● | ○ | ● | ● |
| `business-ontology/rules.md` | ●核心 | ● | ● | ● | ● | ●核心 |
| `business-ontology/actions.yaml` | ●核心 | ● | ● | ● | ● | ●核心 |
| `business-ontology/test-cases/` | ● | ○ | ○ | ● | ● | ● |
| `base/missing-clauses.yaml` | ○ | — | ○ | ●核心 | ○ | ● |
| `base/market-benchmarks.yaml` | ○ | — | ○ | ●核心 | — | ● |
| `jurisdiction-cn/rules.yaml` | — | — | — | ● | ●核心 | ● |
| `jurisdiction-us/rules.yaml` | — | — | — | ● | ●核心 | ● |
| `custom/redlines.yaml` | ○ | — | — | ●核心 | ○ | ● |
| `risk-lexicon/triggers-*.yaml` | ○ | — | ○ | ●核心 | ○ | ● |
| `risk-lexicon/pack.yaml` | ○ | — | ○ | ●核心 | — | ● |
| `severity-mapping.yaml` | ● | ● | ● | ● | ● | ●核心 |

列名对应成员 ID：`lead` = `contract-review-lead`（统筹/组长）｜`intake` = `contract-intake`｜
`extractor` = `clause-extractor`｜`scanner` = `risk-scanner`｜`auditor` = `jurisdiction-auditor`｜
`reporter` = `review-reporter`。

●核心 = 主要消费方，改这个文件必须回归对应 Agent ｜ ● = 需要读 ｜ ○ = 按需 ｜ — = 不读

### 分工要点

- **`contract-review-lead`**（组长）不做实质审查判断，只负责三件事：
  按 `rules.md#R-001` 的 7 步固定顺序调度、按 `rules.md#R-004` 校验交接载荷只含四段、
  以及在 `actions.yaml` 的前置条件不满足时执行「退回重审」而非放行。
  **它不得代替 `review-reporter` 给结论**，也不得代替人确认 Human Gate。
  组长读 `rules.md` 与 `actions.yaml` 是为了知道什么时候该拦，不是为了自己判。
- **`contract-intake`** 用本体的不变量 `INV-001..INV-008` 与派生检查
  `DC-001/002/003/005/007` 做 5 分钟硬校验，输出 `pass` / `conditional_pass` / `reject`。
  `reject` 时后续 Agent **一律不启动**——这是「阻断而非放行」的执行点。
- **`clause-extractor`** 只产出事实（条款、页码、数值、引用边），不产出判断。
- **`risk-scanner`** 消费 `base` 与 `custom`，做缺失检查、市场标尺对标与红线检查。
- **`jurisdiction-auditor`** 消费 `jurisdiction-*`，做规则匹配与冲突标注（`DC-006`）。
- **`review-reporter`** 是唯一有权输出结论等级、评分与动作的 Agent，
  且**不读前序推理**（`rules.md#R-003`）——它的输入只有原文、结构化事实、规则集与
  覆盖矩阵骨架。样本 `TC-007` 记录了这条约束被违反时会发生什么。

---

## 五、四道 Human Gate（蓝本第十二节）

法务四类不可替代动作，系统无法自动放行。**不满足则退回重审，不做默认通过**。

| Gate | 范围 | 由谁触发 |
|---|---|---|
| `HG-01` | 付款触发与回款 | 付款条款抽取、版本对比发现付款变化、付款红线命中 |
| `HG-02` | 争议解决机制 | 争议解决/准据法条款、法域冲突、`dispute-resolution` 缺失 |
| `HG-03` | 责任与违约分配 | 责任/赔偿/担保/不可抗力条款、市场标尺偏差 |
| `HG-04` | 生效要件 | 签署状态缺陷、附件未取得、签署权限不明、生效条件未成就 |

Gate 的通过**只能由人给出**，Agent 不得代为确认，也不得预填。
无超时自动通过；未确认即停在该动作。

---

## 六、如何扩展一个新法域

以新增德国法为例：

1. **建目录**：`jurisdiction-packs/jurisdiction-de/`
2. **写 `pack.yaml`**，必须包含：
   - `meta.pack_id: jurisdiction-de`、`meta.pack_version: de-v1`
   - `meta.precedence: 20`（与其他 jurisdiction 层同级）
   - `meta.requires_pack: [base]`
   - `jurisdiction.detection_clues`：准据法文本、争议机构、数据制度关键词、
     当事方住所线索——**这是自动加载的唯一依据**，写不全会导致该法域的合同
     加载不到包，进而在 `INV-008` 被阻断
   - `confidence_levels` 与 `citation_discipline`：引用纪律不能省，
     它是防止编造法条的机制
   - `applies_to.coverage_gap_disclosure` 与 `known_gaps`：如实披露没覆盖什么
3. **写 `rules.yaml`**，每条规则必须有：
   `id` / `title` / `category` / `mandatory` / `confidence` / `statement` /
   `legal_basis`（含 `article_confidence` 与 `content_confidence`）/
   `detection` / `verdict_rules` / `human_gate`
4. **写 `conflicts` 段**：至少覆盖「准据法双重声明」「与 GDPR 并列」
   「仲裁与诉讼并存」三类，它们是 `relations.yaml#DC-006` 的判定表
5. **写 `known_gaps` 与 `gap_policy`**：命中缺口领域时留白，禁止按通过计
6. **加回归样本**：在 `business-ontology/test-cases/` 至少加一个该法域的样本，
   否则无法证明新规则真的拦住了什么
7. **更新本 README** 的目录结构与消费方表格

### 写法域规则时最容易犯的错

**为了让结论看起来完整而补一个法条编号。**
法律会修订，条文序号会变。每条规则都有 `confidence` 字段，取值含义：

- `high` —— 内容与出处均有把握，可直接引用
- `content_high_article_uncertain` —— 写内容，条文序号注明「需人工确认」
- `needs_state_determination`（仅美国）—— 须先确定适用州法才能下结论
- `needs_human_confirmation` —— 原样写出「需人工确认」

`rules.md#R-061` 把这条写成了硬规则：**一个错误的条文号会让整段结论
在法务眼里失去可信度，且比不引用更糟。**

---

## 七、如何修改企业红线

`custom/redlines.yaml` 的 8 条示例红线**全部默认 `enabled: false`**。
模板不携带任何未经用户确认的判定标准——默认开启会让团队在用户不知情的情况下
按某个陌生标准出结论，这比不检查更糟。

启用步骤见 `custom/redlines.yaml#enablement_checklist`。三个最容易踩的：

1. **先确定企业在该类合同中的主要角色**（客户方 / 供应方）。
   责任上限对客户方是「越高越好」，对供应方恰好相反——方向搞反会得到相反的结论。
2. **判断是新增还是覆盖**。写 `overrides` = 替换低层标准；不写 = 与低层并存取更保守者。
   两者行为完全不同。
3. **填 `owner` 与 `effective_from`**。无责任人的红线在争议时无人能解释它为什么存在。

修改后必须递增 `custom/pack.yaml` 的 `pack_version` 并在 `changelog` 记录。
若这条红线来自一次真实的人工纠正，同时在 `test-cases/` 增加样本（`rules.md#R-052`）。

---

## 八、历史错误样本怎么用

`test-cases/` 里的 8 个样本**不是测试数据集**，是教训的固化形式。
它们与 D 轨的 8 份测试语料（C01-C08）职责不同：

- 测试语料 = 端到端跑通用的完整合同文件
- `test-cases/` = 单个失败模式的最小复现 + 它现在被哪条规则拦住

每个样本回答三个问题：**错在哪**、**当时为什么没发现**、**现在靠哪条规则拦住**。
`guarded_by` 字段指向真实存在的规则 id——指不到规则，说明这条教训还没被固化。

反过来也成立：**一条规则如果在 `test-cases/` 找不到对应样本，说明它是凭空加的，
无法证明它修好了什么。**

7 个 `must_detect` 样本覆盖 7 种失败模式，1 个 `must_not_flag` 样本（`TC-008`）
用于统计误报——蓝本第十六节把误报数量与漏检数量并列为衡量标准，因为
一份没人信的报告和一份没查出问题的报告，实际效果一样。

---

## 九、修改这套资产的纪律

1. **改 `contract.yaml` = 改团队的事实基准。**
   必须同时更新 `relations.yaml` 的引用、本 README 的消费方表格，
   并在 `test-cases/` 增加对应回归样本。
2. **改判定标准必须递增版本号。** 版本号会写进回执，是历史任务回放的输入。
   不递增等于让旧回执指向已经不存在的标准。
3. **规则文件不是 Agent 的自留地。** Agent 可以起草修改，
   **生效必须经用户确认**（`rules.md#R-052`）。
4. **不确定就写「需人工确认」。** 这不是保守，是唯一诚实的做法。
5. **不要硬编码运行时根目录路径。** 本目录下的所有路径引用都是相对于
   团队 `shared/resources/` 的相对路径；需要绝对路径时由运行时解析，
   数据文件里不写任何形如 `~/.desirecore` 的字面量。

---

## 十、与蓝本的对应关系

| 蓝本章节 | 落地位置 |
|---|---|
| 第二节 独立复核约束 | `rules.md#R-002/R-003`、样本 `TC-007` |
| 第四节 前置输入治理 | `contract.yaml#INV-001..INV-008`、`actions.yaml#run_intake_gate` |
| 第五节 风险评分与阈值 | `rules.md#R-032`、`actions.yaml#compute_score` 及四个档位动作 |
| 第六节 法域三层知识 | `jurisdiction-packs/` 全部 + 本 README 第二节 |
| 第七节 结论四元组 | `contract.yaml#types.evidence_ref`、`INV-011`、`rules.md#R-012` |
| 第八节 版本矩阵 | `contract.yaml#entities.version_matrix`、本 README 第三节 |
| 第九节 版本对比陷阱 | `relations.yaml#DC-004`、`INV-009/INV-010`、样本 `TC-001` |
| 第十节 关键缺失条款 | `base/missing-clauses.yaml`（9 项统一 slug） |
| 第十一节 市场标尺 | `base/market-benchmarks.yaml`（4 条 + 偏差阈值） |
| 第十二节 法务四类动作 | `actions.yaml#human_gates`（HG-01..HG-04） |
| 第十四节 业务本体 | `business-ontology/` 全部 |
| 第十五节 响应矩阵与经验固化 | `contract.yaml#entities.coverage_matrix_row`、`rules.md#R-014/R-052`、`test-cases/` |
| 第十六节 衡量标准 | `test-cases/_index.yaml`（must_detect / must_not_flag 计数） |
| 第十七节 适用边界 | `rules.md#R-060`、`actions.yaml#release_to_legal.forbidden_wording` |

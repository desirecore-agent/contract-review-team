# 风险触发词库（`shared/resources/risk-lexicon/`）

> **版本**：`lexicon-v1` ｜ **知识库基准日期**：2026-08-31
> **主要消费方**：`risk-scanner`（风险识别 Agent）｜ **次要消费方**：`review-reporter`
> **设计依据**：`.design/合同审查智能体团队-设计蓝本.md` 第二节「按词库匹配、触发条件分析」

这套词库补的是 A1 交付法域知识包时点名的**最大缺口**。在它之前，风险识别只有两件武器：

| 已有 | 回答的问题 | 覆盖不到的 |
|---|---|---|
| `base/missing-clauses.yaml`（9 项） | 该有的条款**有没有** | 条款有，但里面那句话本身就是争议点 |
| `base/market-benchmarks.yaml`（4 条） | 有的那条**数值落在哪个区间** | 没有数值可比的争议点（排他、单方权力、归属倒挂……） |

本词库回答第三个问题：**写在里面的那句话，是不是一个争议点。**
三者并列使用，缺任何一份，风险识别都只剩另外两份的覆盖面。

---

## 一、目录与规模

```
risk-lexicon/
├── README.md          ← 本文件
├── pack.yaml          ← 元数据、类目、判定路径、五步协议、7 条明令禁止的发现、条目索引
├── triggers-zh.yaml   ← 29 个触发条目的中文匹配面与完整语义定义
└── triggers-en.yaml   ← 同 29 个 id 的英文匹配面与完整语义定义
```

| 指标 | 数值 |
|---|---|
| 类目 | 8 |
| 触发条目 | 29（中英各一份，id 一一对应） |
| 反误报样例（`counter_examples`） | 173 条（中文 86 / 英文 87） |
| 正则模式 | 190 条（中文 93 / 英文 97） |
| 明令禁止的发现（`forbidden_findings`） | 7 条 |

八个类目：锁定与排他 `lockin_exclusivity`（4）｜单方权力与不对等 `unilateral_power`（6）｜
责任敞口 `liability_exposure`（5）｜期限、续约与退出 `term_renewal_exit`（2）｜
知识产权与数据权利 `ip_data_rights`（4）｜验收与履约 `acceptance_performance`（2）｜
人员限制 `restraint_personnel`（4）｜措辞精度 `drafting_precision`（2）。

---

## 二、最重要的一条：命中关键词不是结论

这套词库最容易被误用的方式，是把 `keywords` 当判据。样本
`business-ontology/test-cases/TC-008-boilerplate-false-positive.yaml` 记录的正是这个后果：

> 一份条款质量良好的服务协议被输出 11 条高风险，其中 3 条是误报。
> 法务反馈：这份报告需要逐条排除误报，比自己读一遍合同还慢。

TC-008 的根因写得很清楚：**判据不是「是否合理」，而是「是否出现关键词」。**
所以本词库的结构是围绕「怎么把候选打回去」设计的，而不是围绕「怎么多命中」设计的：

```
M1 匹配   keywords / patterns 命中 → 建立候选（不是结论）
M2 限定   qualifiers + counter_examples → 打回的必须写进 suppressed[]，留痕
M3 分流   按 resolution 决定这条命中能不能单独下结论
M4 结论   组装结论四元组：条款编号 + 页码证据 + 结论等级 + 对应动作
M5 合并   按 dedup_group 合并；29 项全部写进覆盖矩阵，包括 pass 与 not_triggered
```

六种 `resolution` 中，**只有三种可以单独下结论**：

| resolution | 能单独下结论 | 说明 |
|---|:--:|---|
| `element_check` | ✅ | 按要素齐备性判定，缺哪一项写哪一项 |
| `symmetry_check` | ✅ | 先判双方对等性；对等与单方是两个结论，不是同一结论的两档 |
| `direct` | ✅ | 仅用于约定本身即自相矛盾的少数情形（v1 未使用） |
| `benchmark_compare` | ❌ | 必须抽数值比 `market-benchmarks.yaml`，抽不到判 `unknown` |
| `defer_to_jurisdiction` | ❌ | 受强制性规定约束，只登记候选，转 `jurisdiction-auditor` |
| `defer_to_version_comparison` | ❌ | 「与上一版比是否变差」，转 `review-reporter` 的 `compare_versions` |

**`benchmark_compare` 的阈值一律取自 `base/market-benchmarks.yaml`，本词库不另定数值。**
这是刻意的：两处各定一套阈值，改了一处就会得到两个互相矛盾的结论。

词库另提供 `pack.yaml#benchmark_locators`：四条标尺的**定位线索**（标题 + 正则）。
它不产生任何结论，只保证标尺能找到该看的那句话——真实语料里责任上限的落点是
「累计赔偿责任总额，不超过……费用总额」，而 `missing-clauses.yaml#liability-cap` 的
`keywords_zh` 中没有任何一项是它的连续子串；只按缺失检查的关键词找会整条漏掉。
`liability-cap-months` 的定位还必须追进附件——真实语料 C06b 的责任上限写在附件二第 5.1 条，
主合同第 10.1 款只作指向。

---

## 三、`counter_examples` 是必填字段

每个条目至少给出 2 条、多数给出 3–4 条「命中了也不算风险」的具体形态，每条含三段：
`form`（形态名）+ `example`（具体句子）+ `why_not_risk`（为什么不是风险）。

**它们绝大多数直接来自 `.testdata/contracts/` 的真实语料**，不是假想的边界情况。举两个最要命的：

- **`rt-joint-several-liability`**：C01 是 8 份语料里**唯一的干净基线**（`expected_risks: []`），
  而它的第 13.2 款写着「乙方对分包方的行为向甲方承担连带责任」。按关键词「连带责任」必然命中——
  但这句话恰恰是 `missing-clauses.yaml#subcontracting` 要求的「分包方行为的责任归属」要素，
  是**条款齐备的标志**。在这里报风险，等于在零缺陷样本上制造误报。
- **`rt-unilateral-amendment`**：C03 第 7.5 款写着「均须由双方授权代表签署书面**变更单方**为有效」。
  这里的「单」属于「变更单」，不是「单方」。按子串匹配必然命中，而这句话的实际含义
  与本条目要抓的风险**完全相反**——它是变更控制的要素齐备表现。

英文侧的三个同类陷阱（全部来自 C07 / C08）：
`exclusive jurisdiction` 与 `non-exclusive licence` 里的 exclusive 不是商业排他；
`assign personnel` 里的 assign 是指派人员不是合同转让；
`promptly … within ten (10) business days` 里的 promptly 有确定期限兜底，不构成模糊时限。

---

## 四、`forbidden_findings`：不是「谨慎输出」，是不得输出

`pack.yaml#forbidden_findings` 有 7 条，全部来自 TC-008 及其外推。它们的共同点是
**没有客观基准，属于主观判断补位**：

| id | 不得输出 |
|---|---|
| FB-01 | 把「存在责任上限」本身报为风险 |
| FB-02 | 报「不可抗力范围过宽 / 可能被滥用」 |
| FB-03 | 把双方对等的标准反转让条款报为风险 |
| FB-04 | 数值抽不到时按风险计 |
| FB-05 | 无基准、无要素、无对等性依据时凭「看起来不利」报风险 |
| FB-06 | 把行业样板条款（通知、可分割性、完整协议、副本签署）报为风险 |
| FB-07 | 给出法律效力判断（有效 / 无效 / 不受保护 / 超出法定上限） |

FB-07 是边界规则：法律效力属 `jurisdiction-auditor`，本词库与 `base` 层受同一条约束——
**结论永远不能单独构成合规结论**（见 `jurisdiction-packs/README` 语境下的样本 `TC-004`）。

---

## 五、双语文件的一致性

同一个 `id` 在两份文件中各定义一次，两份文件**各自自足、可单独阅读**。

- **语义字段必须逐字段相等**：`category`、`severity`、`resolution`、`recommended_action`、
  `human_gate`、`benchmark_link`、`missing_clause_link`、`dedup_group`、`requires_symmetry_check`
- **语言面字段各自独立**：`title`、`why`、`typical_position`、`keywords`、`patterns`、
  `qualifiers`、`counter_examples`、`notes`

改任一语义字段必须**同改两份文件**并递增 `pack_version`。只改一份，中英文合同就会得到不同结论——
而这类错误在报告表面完全看不出来。

某语言确实没有对应表述时，该语言文件**仍须登记该 id**，写 `coverage.status = not_applicable`
并说明原因，禁止整条省略；省略会让覆盖矩阵少一行，而漏检恰好藏在那一行里。

---

## 六、怎么新增一个触发条目

1. **先找到它的失败样本。** 一条触发条目如果在 `business-ontology/test-cases/` 或
   `.testdata/contracts/` 里找不到对应形态，说明它是凭空加的，无法证明它修好了什么
   （与 `shared/resources/README.md` 第八节对规则的要求同源）。
2. **想清楚 `resolution`。** 这是最重要的一个字段：它决定这条命中能不能单独下结论。
   拿不准时选 `benchmark_compare` 或 `defer_*`，不要选 `direct`——滥用 `direct` 就是回到 TC-008。
3. **先写 `counter_examples`，再写 `keywords`。** 顺序反过来会写出一个只会命中、不会打回的条目。
   至少 2 条，且必须是具体句子，不能写「视情况而定」。
4. **两份语言文件同步新增**，语义字段逐字段对齐。
5. **更新 `pack.yaml`** 的 `entry_index`、`meta.entries_total` 与 `changelog`，递增 `pack_version`。
6. **更新本文件第一节的规模表**。

### 最容易犯的错

**为了「多抓一点」而放宽 `qualifiers`。** 词库的价值不在命中率，在**信噪比**。
蓝本第十六节把误报数量与漏检数量并列为衡量标准，理由是
「一份没人信的报告和一份没查出问题的报告，实际效果一样」。
放宽一次限定条件带来的误报，会稀释掉这个类目下所有真实发现的可信度。

---

## 七、判定方向依赖「己方角色」

多个条目（`rt-uncapped-indemnity`、`rt-asymmetric-termination-right`、`rt-ip-ownership-inversion`、
`rt-non-compete-term`）的结论方向取决于**己方是客户方还是供应方**：
责任上限对客户方是「越高越好」，对供应方恰好相反；便利终止权在对方手上是风险，在己方手上是筹码。

角色搞反会得到**相反的结论**。因此：

- 角色由上游交接块或用户输入确定，**不得由 Agent 推测**
- 角色未确认时，相关条目输出 `conclusion = unknown` 并写明「己方角色未确认」，
  **不得默认按不利处理**——那是把不确定性洗成了确定性

这与 `custom/redlines.yaml#enablement_checklist` 的第一条提醒同源。

---

## 八、不要在这里做的事

- ❌ 定义自己的市场阈值（用 `base/market-benchmarks.yaml`）
- ❌ 判断某条约定在某法域是否有效（用 `jurisdiction-packs/`，由 `jurisdiction-auditor` 执行）
- ❌ 判断「与上一版相比是否变差」（属 `review-reporter` 的 `compare_versions`）
- ❌ 输出评分或最终动作建议（属 `review-reporter`）
- ❌ 在数据文件里写任何形如运行时根目录的绝对路径字面量（路径一律相对于 `shared/resources/`）

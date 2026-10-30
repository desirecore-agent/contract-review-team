# 独立只读 Oracle Review

结论：**NO-GO**

- P0：0
- P1：5
- 起始源码 SHA：`e1837f2931ec077b7bf522f5c223c0af5df840cf`
- 结束源码 SHA：`e1837f2931ec077b7bf522f5c223c0af5df840cf`
- 未修改文件、未 commit/push、未联网、未访问实例/凭据/端口、未使用其他 Agent。
- 工作树 dirty 状态前后未发生可见变化。

本审查逐项枚举了 69 个历史 mandatory ID，并核对当前集合、极性、`required`、证据引用和对应源文本。范围限于 ID 级输出契约及仓内固定源文本事实；不对自由文本报告作完整语义判定，也不作新的法律结论，因此不能称自然语言审查能力已完整验证。

## Findings

### P1-1 — `evaluateOracleOutput` 对畸形输出 fail-open，且部分输入直接抛异常

位置：[check-oracle-contract.mjs](<team-workspace>/shared/resources/check-oracle-contract.mjs:42)

`new Set(output.detected_ids ?? [])` 没有验证：

- `output` 是否为普通对象；
- `detected_ids` 是否为字符串数组；
- 元素是否为已知 ID；
- 是否存在重复或非字符串元素。

实测最小反例：

```text
C01 detected_ids = null                    => pass:true
C01 detected_ids = [null]                  => pass:true
C01 detected_ids = ["unknown-id"]          => pass:true
C01 detected_ids = "amount-in-words-mismatch" => pass:true
C01 detected_ids = 42                      => TypeError
C01 detected_ids = {}                      => TypeError
```

字符串会被拆成字符集合，因此明确报出被禁止的 `amount-in-words-mismatch` 仍然通过。未知 case 能正确返回失败，但未知 target 和畸形输出不能可靠 fail-closed。

影响：实际评测可以误通过禁止误报，也可能因未捕获异常中断整批评测。

### P1-2 — 新 normative 目标默认被降为 optional；45 项当前目标不参与评估

位置：

- [check-oracle-contract.mjs](<team-workspace>/shared/resources/check-oracle-contract.mjs:114)
- [check-oracle-contract.mjs](<team-workspace>/shared/resources/check-oracle-contract.mjs:192)
- [ground-truth.yaml](<team-workspace>/testdata/contracts/ground-truth.yaml:175)

Guard 只强制69个历史项目为 `required:true`；普通新增 normative target 没有同样要求。当前 114 个检测/禁报 target 中：

- 69 个 `required:true`
- 45 个没有 `required:true`

最小反例：

```js
C01.must_detect.push({
  id: "new-normative-required-in-meaning",
  evidence_ref: "c01-total"
})
```

结果：

```text
validateOracle => []
evaluateOracleOutput(C01, detected_ids:[]) => pass:true
```

这已经影响当前真实目标，包括：

- C03 三个明确的 `*-missing`
- C04 三个安全的源文事实 ID
- C05 域外事实/禁止实体结论
- C06 附件替换及全局覆盖
- R02/R03 party/date/source-text 检查

例如 `attachment-version-replaced` 虽被静态 `requireIds` 检查存在，却没有 `required:true`，运行 evaluator 可完全漏报而通过。

影响：guard 宣称存在的当前 normative 必检，不等于评测时真正必检。

### P1-3 — 证据校验只验证“存在”，无关 existing evidence 可自由交换

位置：[check-oracle-contract.mjs](<team-workspace>/shared/resources/check-oracle-contract.mjs:207)

除 C01 金额这一条硬编码特例外，guard 只确认 `evidence_ref` 是本 case 已存在的 ID，不检查证据与 target 的类别、极性或事实关系。

实测：

```text
C01 must_not_flag:grace-period
evidence_ref: c01-grace → c01-audit
validateOracle => []
```

`c01-audit` 是“审计权”标题，与宽限期无关，但 guard 通过。相同交换可作用于其余绝大多数69项。

影响：同 ID、同集合、`required:true` 仍不能证明源证据语义一致；候选仍可制造证据绑定误通过。

### P1-4 — `scope_change` 与旧法律效果 ID 的可执行语义相互矛盾

位置：

- [ground-truth.yaml](<team-workspace>/testdata/contracts/ground-truth.yaml:172)
- [ground-truth.yaml](<team-workspace>/testdata/contracts/ground-truth.yaml:202)
- [ground-truth.yaml](<team-workspace>/testdata/contracts/ground-truth.yaml:346)
- [ground-truth.yaml](<team-workspace>/testdata/contracts/ground-truth.yaml:387)

候选把旧法律/市场效果 ID 本身设为 required，同时用 `fact_only`、`scope_change`、`pending_professional_review` 声称其已缩窄。Evaluator 不读取这些字段，只要求输出旧 ID。

C04 最小反例：

```text
仅输出安全事实 ID：
five-year-non-compete-text
no-economic-compensation-text
twelve-month-probation-text
=> FAIL，缺三个旧法律效果 ID

仅输出旧标签：
non-compete-term-excessive
non-compete-without-compensation
probation-exceeds-statutory-limit
=> PASS
```

同类冲突还涉及：

- C05 `governing-law-conflict`
- C05/C07 `jurisdiction-rulepack-unavailable`
- C06b/C07 `liability-cap-below-market`
- C07 `renewal-notice-window-too-short`
- R01/R02 `repealed-law-citation`
- R02 `arbitration-institution-unspecified`

其中 R03 的 required `must_not_flag:repealed-law-citation` 更没有可执行的 `scope_change + pending_professional_review` 判定；它仍以 ID 字面要求一个签署时点法律效果结论。本审查只确认合同日期和引用文字，不确认该法律效果。

旧49条 disposition 仍位于 `normative.history_target_dispositions`，[ground-truth.yaml](<team-workspace>/testdata/contracts/ground-truth.yaml:16)，并保留已知错误映射，例如 C01 金额仍指向 `amount-arithmetic-mismatch`。实现报告称其仅为 provenance，但其处在 normative 树内，guard 又既不验证也不拒绝这些矛盾内容，仍可能被其他消费者误当权威。

影响：会误拒谨慎的源文事实输出，并误通过使用旧法律效果标签的输出；这不是单纯格式问题。

### P1-5 — Guard 接受跨正反集合的同 ID，能够生成永远无法通过的 Oracle

位置：

- [check-oracle-contract.mjs](<team-workspace>/shared/resources/check-oracle-contract.mjs:114)
- [check-oracle-contract.mjs](<team-workspace>/shared/resources/check-oracle-contract.mjs:198)

当前只检查每个历史 ID 在其历史集合中恰好出现一次；不检查：

- 当前集合内部重复；
- 非历史 target 重复；
- 同 ID 同时出现在 `must_detect` 和 `must_not_flag`。

最小反例：向 C01 `must_detect` 加入 required `grace-period`，而现有 `must_not_flag:grace-period` 保留。

```text
validateOracle => []

未输出 grace-period => missing mandatory detection
输出 grace-period   => forbidden false positive
```

Oracle 因而不存在任何通过输出。

影响：未来修改可以在 guard 全绿时产生自相矛盾、必然误拒的评测契约。

## 已确认事项

- 当前历史枚举确为69项。
- 69项目前都能在相同 case、相同集合、相同 ID 下找到一个 `required:true` target。
- C01 大写金额禁报与可选算术检测已经分离；正常数组输入下专项测试有效。
- R01 两项禁报均保留：
  - `attachment-missing`
  - `party-name-inconsistency`
- R01 两项均有可在源文件定位的文本证据。
- 12份源样本 SHA 与 YAML 声明一致；guard 未报告样本字节变化。
- `history` 解析摘要冻结测试通过。
- C05/C07 保留域外服务边界和转介要求；本审查不恢复外国法实体断言。
- 但上述局部正确性不能抵消 evaluator 与 guard 的系统性误通过/误拒。

## 实际执行

- `node shared/resources/check-oracle-contract.mjs`
  - 1 次，退出码 0。
- `node --test shared/resources/tests/oracle-contract.test.mjs`
  - 33 tests，33 pass，0 fail/skipped/todo。
- 只读内存反例：
  - 17 个 guard/evaluator 检查；
  - 复现了无关证据交换、缺 `required` 新目标、畸形输出、未知 ID、跨极性重复及法律范围缩窄误拒。
- 未运行任何其他测试入口。

因此，现有 33/33 只证明当前测试覆盖的变异通过，不能支持69项语义契约已经可靠可执行。当前候选仍为 **NO-GO，P0=0，P1=5**。
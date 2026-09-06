#!/usr/bin/env node
// 门禁裁决字面量自检。零依赖（团队目录一路到 home 都没有 node_modules）。
//
// 为什么需要这个脚本：rules.md#三之一 早就写明「只有 passed | conditional | blocked」，
// 并且举了一次真实返工做教训。然后 rules.md **第二节自己**继续写着
// 「verdict: reject 时立即终止」——而 reject 正是它禁用的字面量。
// 编排官和两个下游成员的 principles 全都照着 reject 写。
// 结果：「闸门不可绕过」这条最硬的规则，按字面永远不触发；真机里闸门还是关上了，
// 靠的是模型看懂了 blocked 的语义。**不报错、不漏做，只是规则没在起作用。**
//
// 这类漂移只能靠机械检查兜住——人写文档时不会注意到自己刚定的枚举被自己违反了。
//
// 用法：node shared/resources/check-gate-verdict.mjs [扫描根] [canonical 的 rules.md]
//   团队仓库：  node shared/resources/check-gate-verdict.mjs
//   Agent 仓库：node <团队仓库>/shared/resources/check-gate-verdict.mjs . <团队仓库>/shared/rules.md
// canonical 只有一份（团队仓库的 rules.md），Agent 仓库自己没有也不该有。
// 退出码 0 = 通过；1 = 有违规。

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = process.argv[2] ? process.argv[2] : join(here, '..', '..')

// ── canonical 枚举从 rules.md 读，不在本脚本里再抄一份 ────────────────────
const rulesPath = process.argv[3] ? process.argv[3] : join(root, 'shared', 'rules.md')
let canonical = null
try {
  const rules = readFileSync(rulesPath, 'utf8')
  // 「门禁三态枚举」标题之后第一个 ``` 代码块
  const sec = rules.split(/^###\s+门禁三态枚举/m)[1]
  const block = sec && sec.match(/```\s*\n([^`]+)\n```/)
  if (block) canonical = block[1].trim().split('|').map((s) => s.trim()).filter(Boolean)
} catch { /* 下面统一报 */ }

const problems = []
if (!canonical || canonical.length === 0) {
  problems.push(`读不到 canonical 枚举：${relative(root, rulesPath)} 的「门禁三态枚举」段落缺失或格式变了`)
}

// ── 禁用字面量 ──────────────────────────────────────────────────────────
// conditional_pass 没有任何合法用途，见到即违规。
// pass / reject / rejected 在别的字段里是合法取值（检查项状态、风险等级、人工审批），
// 所以只在**门禁 verdict 上下文**里才判违规——靠下面的模式限定，而不是裸词匹配。
const ALWAYS_BANNED = /conditional_pass/
// 字段名：门禁裁决在各处的叫法。漏一个就等于对那处失明——
// 2026-09-06 的第一版只写了 verdict / intake_verdict，于是编排官技能里的
// `judge=reject` 与流程图里的 `verdict=reject` 双双漏检，靠真机 run 记录才发现。
const GATE_FIELD = String.raw`(?:intake_verdict|upstream[._]verdict|verdict|judge)`
// 运算符：`=` 一开始没写，而 ASCII 流程图和一行式说明恰恰只用 `=`。
const GATE_OP = String.raw`(?:=|==|:|∈|为|是)`

const GATE_CONTEXT = [
  // verdict = reject / intake_verdict ∈ [pass, …] / `judge`=reject / verdict: reject
  new RegExp(
    String.raw`[\`']?` + GATE_FIELD + String.raw`[\`']?\s*` + GATE_OP +
    String.raw`\s*[\[{]?\s*[\`'"]?(pass|reject|rejected|conditional_pass)\b`
  ),
  // 「返回 reject 时」「判 reject 时」——编排官 principles 的写法
  /(?:返回|判|给出|产出)\s*[`'"]?(reject|rejected|conditional_pass)[`'"]?\s*时/,
  // ⚠️ 不要加「∈ {…pass…} 就算违规」这类不带字段名的模式：
  //    `conclusion ∈ {severe, important, advisory, pass}` 是合规等级，
  //    `status ∈ {pass, block, flag}` 是检查项状态，都合法。
  //    verdict 的 ∈ 写法已被上面第二条覆盖（它要求行内出现 verdict 这个词）。
]

// workspace / inbox / runs 是**运行时产物**（Agent 写出来的 PLAN、交接块、回执），
// 不是源码。在它们里面读到旧字面量是预期的——那是修法前跑出来的东西，
// 而且恰恰是这次能抓到证据的地方：
//   plan-c08.../PLAN.md:61  「verdict=reject → 终止；conditional → 全量派发；passed → 进 O2」
//     三分支里两支用对字面量，终止那支用了 intake 永不产出的 reject
//   clause-extractor/inbox/027b9d8d....json
//     「上游回执 `verdict: conditional`（属 `conditional_pass` 等价情形），可启动」
//     ——模型当场手工桥接了这个不匹配，这就是「靠宽容解读兜底」的原话
// 扫源码是为了防止再写错，不是为了追溯已产出的东西。
const SKIP_DIRS = new Set(['.git', 'node_modules', 'testdata', 'workspace', 'inbox', 'runs', 'memory'])
const EXTS = ['.md', '.yaml', '.yml', '.json']

function walk(dir, out = []) {
  let entries
  try { entries = readdirSync(dir, { withFileTypes: true }) } catch { return out }
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name)) continue
    const p = join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (EXTS.some((x) => e.name.endsWith(x))) out.push(p)
  }
  return out
}

// 跳过：本脚本自己（禁用清单写在这儿）、CHANGELOG（历史记录描述的是**过去**的状态，
// 「v0.1.1 统一了 pass/conditional_pass/reject」这句话本身必须写出那些词）。
const SKIP_FILES = ['check-gate-verdict.mjs', 'CHANGELOG.md']
const files = walk(root).filter((f) => !SKIP_FILES.some((s) => f.endsWith(s)))

for (const f of files) {
  let text
  try { text = readFileSync(f, 'utf8') } catch { continue }
  // Normalize the relative path before matching repository-owned exclusions.
  // Windows returns `shared\\rules.md`; the rules-file exemptions must behave
  // identically on Windows and POSIX.
  const rel = relative(root, f).replaceAll('\\', '/')
  const isRules = rel.endsWith('shared/rules.md') || rel === 'shared/rules.md'
  text.split('\n').forEach((line, i) => {
    // rules.md 里「不得使用变体」那一行和实测教训段落本来就要写出禁用词
    if (isRules && /不得使用变体|实测教训|期望\s*`conditional_pass`|禁用的字面量|恰恰是本节禁用/.test(line)) return
    // 本体里那条解释「此前写的是什么」的注释同理
    if (/^\s*#.*此前(这里)?写的是/.test(line)) return
    const hit = ALWAYS_BANNED.test(line) || GATE_CONTEXT.some((rx) => rx.test(line))
    if (hit) problems.push(`${rel}:${i + 1}: ${line.trim().slice(0, 140)}`)
  })
}

if (problems.length) {
  console.error(`✗ 门禁裁决字面量自检未通过（canonical = ${canonical ? canonical.join(' | ') : '未读到'}）：`)
  for (const p of problems) console.error('  -', p)
  console.error('\n  合法的同名用法（检查项状态 / 风险等级 / 覆盖状态 / 人工审批）见 rules.md#三之一 的表格。')
  process.exit(1)
}
console.log(`✓ 门禁裁决字面量一致：canonical = ${canonical.join(' | ')}，扫描 ${files.length} 个文件无违规`)

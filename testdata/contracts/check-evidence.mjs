#!/usr/bin/env node
/**
 * ground-truth.yaml 证据字符串自检：每条证据必须能在对应语料 .md 中按**固定字符串**原文找到。
 *
 * 为什么要有这个：README 第 3 节写着「全部证据字符串通过校验，改动语料后必须重跑」，
 * 但仓库里一直没有能跑的校验。结果 R01/R02/R03 的仲裁条款证据写成了全角空格，
 * 而原文是 .doc→textutil 转换留下的「换行 + ASCII 空格」——三条都匹配不上，没人发现。
 * 证据匹配不上的后果不是报错，是**判据悄悄失效**：验收时拿它去原文里找，找不到，
 * 就无法判断 Agent 报的那条到底对不对。
 *
 * 覆盖三类证据：`evidence`、`additional_evidence`（列表）、`clause_presence_evidence`（映射）。
 * 只认双引号标量；遇到任何其他写法**直接失败**而不是跳过——跳过就是空转。
 *
 * ⚠️ 零依赖，刻意不用 js-yaml：testdata/ 随团队目录分发到用户实例，那里没有 node_modules
 *    （jurisdiction-cn/statutes/check-temporal.mjs 第一版就栽在这上面）。
 *
 * 用法：node testdata/contracts/check-evidence.mjs   （零退出码 = 全部命中）
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const lines = readFileSync(join(here, 'ground-truth.yaml'), 'utf8').split('\n')

const ENTRY_KEY = /^(C0\d[ab]?|R0\d):\s*$/
const indentOf = (s) => s.match(/^ */)[0].length

/** YAML 双引号标量的最小反转义。证据里只出现过 \" 与 \\，其余按规范一并处理。 */
function unquote(raw, where) {
  const m = raw.match(/^"((?:[^"\\]|\\.)*)"\s*(#.*)?$/)
  if (!m) throw new Error(`${where}: 证据不是单行双引号标量，本脚本不支持这种写法：${raw.slice(0, 60)}`)
  return m[1].replace(/\\(u[0-9a-fA-F]{4}|.)/g, (_, e) => {
    if (e[0] === 'u') return String.fromCharCode(parseInt(e.slice(1), 16))
    return { n: '\n', t: '\t', '"': '"', '\\': '\\', '/': '/', ' ': ' ' }[e] ?? e
  })
}

const items = []          // { entry, file, kind, text, line }
const problems = []
let entry = null
let file = null
let block = null          // { kind, indent } —— 正在读的 additional_evidence 列表或 clause_presence_evidence 映射

lines.forEach((raw, i) => {
  const ln = i + 1
  if (/^\S/.test(raw) && !raw.startsWith('#')) {       // 顶层键：切换条目
    const m = raw.match(ENTRY_KEY)
    entry = m ? m[1] : null
    file = null
    block = null
    return
  }
  if (!entry || /^\s*(#.*)?$/.test(raw)) return

  const fm = raw.match(/^ {2}file:\s*(\S+)\s*$/)
  if (fm) { file = fm[1]; return }

  const ind = indentOf(raw)
  if (block && ind <= block.indent) block = null

  if (block) {
    const where = `ground-truth.yaml:${ln}`
    if (block.kind === 'additional_evidence') {
      const lm = raw.match(/^\s+-\s+(.*)$/)
      if (!lm) { problems.push(`${where}: additional_evidence 下出现非列表项`); return }
      try { items.push({ entry, file, kind: block.kind, text: unquote(lm[1].trim(), where), line: ln }) }
      catch (e) { problems.push(e.message) }
    } else {
      const km = raw.match(/^\s+([A-Za-z0-9_-]+):\s*(.*)$/)
      if (!km) { problems.push(`${where}: clause_presence_evidence 下出现非映射项`); return }
      try { items.push({ entry, file, kind: `clause_presence_evidence.${km[1]}`, text: unquote(km[2].trim(), where), line: ln }) }
      catch (e) { problems.push(e.message) }
    }
    return
  }

  const em = raw.match(/^\s+evidence:\s*(.*)$/)
  if (em) {
    try { items.push({ entry, file, kind: 'evidence', text: unquote(em[1].trim(), `ground-truth.yaml:${ln}`), line: ln }) }
    catch (e) { problems.push(e.message) }
    return
  }
  const bm = raw.match(/^(\s+)(additional_evidence|clause_presence_evidence):\s*$/)
  if (bm) block = { kind: bm[2], indent: bm[1].length }
})

const cache = new Map()
const source = (f) => {
  if (!cache.has(f)) cache.set(f, readFileSync(join(here, f), 'utf8'))
  return cache.get(f)
}

let ok = 0
for (const it of items) {
  if (!it.file) { problems.push(`ground-truth.yaml:${it.line}: 条目 ${it.entry} 没有 file 字段，无法定位语料`); continue }
  let text
  try { text = source(it.file) } catch { problems.push(`ground-truth.yaml:${it.line}: 语料文件不存在：${it.file}`); continue }
  if (text.includes(it.text)) ok++
  else problems.push(`ground-truth.yaml:${it.line}: ${it.entry}.${it.kind} 在 ${it.file} 中找不到：${JSON.stringify(it.text.slice(0, 50))}`)
}

// 反空转：一条都没抽到时不能报绿
if (items.length === 0) problems.push('一条证据都没有抽到——解析器很可能已经跟文件格式脱节')

if (problems.length) {
  console.error(`✗ 证据自检未通过（${ok}/${items.length} 命中）：`)
  for (const p of problems) console.error('  -', p)
  process.exit(1)
}
const entries = new Set(items.map((i) => i.entry)).size
console.log(`✓ ${items.length} 条证据全部在原文中命中（${entries} 份语料）`)

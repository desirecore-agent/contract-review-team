#!/usr/bin/env node
/**
 * temporal.yaml 与 statutes/ 目录的一致性自检。
 *
 * 建这个是因为第一版就漏登记了一部（e-signature-law.md），而漏登记的后果不是报错，
 * 是**静默**：Agent 查那部法时拿不到版本区间，只能当作"没有时间约束"照用，
 * 于是回到「拿现行版套旧合同」那个最危险的失败模式上。
 *
 * ⚠️ **零依赖，刻意不用 js-yaml。** 第一版用了，在开发机上跑得好好的，装到用户
 * 实例上立刻 `Cannot find module 'js-yaml'`——团队目录一路到 home 都没有
 * node_modules。随知识包分发的脚本只能依赖 node 内置模块。
 * 这里只需读几个固定字段，行扫描足够，不值得为它引一个 parser。
 *
 * 用法：node check-temporal.mjs   （零退出码 = 一致）
 */
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const lines = readFileSync(join(here, 'temporal.yaml'), 'utf8').split('\n')

// 逐条解析 statutes: 下的条目。条目以 "  - file: xxx" 开头，字段缩进 4 空格。
const entries = []
let cur = null
let inStatutes = false
for (const raw of lines) {
  if (/^statutes:\s*$/.test(raw)) { inStatutes = true; continue }
  if (inStatutes && /^[a-z_]+:/.test(raw)) { inStatutes = false }   // 到了下一个顶层键
  if (!inStatutes) continue
  const m = raw.match(/^ {2}- file:\s*(\S+)/)
  if (m) { cur = { file: m[1] }; entries.push(cur); continue }
  if (!cur) continue
  const f = raw.match(/^ {4}(applicable_from|applicable_from_source|applicable_from_note):\s*(.*)$/)
  if (f) cur[f[1]] = f[2].trim() || '(block)'
}

const num = (key) => {
  const m = lines.find((l) => new RegExp(`^\\s{2}${key}:`).test(l))
  return m ? Number(m.split(':')[1].trim().split(/\s+/)[0]) : undefined
}

const onDisk = readdirSync(here).filter((f) => f.endsWith('.md'))
const listed = entries.map((e) => e.file)
const problems = []

const missing = onDisk.filter((f) => !listed.includes(f))
const extra = listed.filter((f) => !onDisk.includes(f))
if (missing.length) problems.push(`目录里有但 temporal.yaml 未登记：${missing.join(', ')}`)
if (extra.length) problems.push(`temporal.yaml 登记了但目录里没有：${extra.join(', ')}`)
const dup = listed.filter((f, i) => listed.indexOf(f) !== i)
if (dup.length) problems.push(`重复登记：${[...new Set(dup)].join(', ')}`)

const confirmed = entries.filter((e) => e.applicable_from && e.applicable_from !== 'unknown_needs_human').length
const unknown = entries.filter((e) => e.applicable_from === 'unknown_needs_human').length
if (num('total') !== onDisk.length) problems.push(`summary.total=${num('total')} 与实际 ${onDisk.length} 部不符`)
if (num('applicable_from_confirmed') !== confirmed) problems.push(`summary.applicable_from_confirmed=${num('applicable_from_confirmed')} 与实际 ${confirmed} 不符`)
if (num('applicable_from_unknown') !== unknown) problems.push(`summary.applicable_from_unknown=${num('applicable_from_unknown')} 与实际 ${unknown} 不符`)

// 每条都得说清 applicable_from 的来源，或为何未知——不许留白
for (const e of entries) {
  if (!e.applicable_from) problems.push(`${e.file}: 缺 applicable_from`)
  else if (e.applicable_from === 'unknown_needs_human') {
    if (!e.applicable_from_note) problems.push(`${e.file}: unknown 却没说明为何未知`)
  } else if (!e.applicable_from_source) {
    problems.push(`${e.file}: 有 applicable_from 却没给出处`)
  }
}

// pack.yaml 与 rules.yaml 的 pack_version 必须一致。
// 不一致会让整条流水线在版本矩阵校验处停机（on_mismatch=block），而症状
// ——「最终报告未出具」——离真正的原因（改了一处忘了另一处）很远。
// 这次就是这么撞上的：rules.yaml 改成 cn-v2，pack.yaml 还是 cn-v1。
const packDir = join(here, '..')
const readVer = (f) => {
  try {
    const m = readFileSync(join(packDir, f), 'utf8').match(/^\s*pack_version:\s*(\S+)/m)
    return m ? m[1] : null
  } catch { return null }
}
const vPack = readVer('pack.yaml')
const vRules = readVer('rules.yaml')
if (vPack && vRules && vPack !== vRules) {
  problems.push(`pack.yaml 的 pack_version=${vPack} 与 rules.yaml 的 ${vRules} 不一致 —— 会导致流水线在版本矩阵校验处停机`)
}

if (problems.length) {
  console.error('✗ temporal.yaml 自检未通过：')
  for (const p of problems) console.error('  -', p)
  process.exit(1)
}
console.log(`✓ temporal.yaml 与 statutes/ 一致：${onDisk.length} 部，${confirmed} 部有施行日出处，${unknown} 部待人工确认`)

#!/usr/bin/env node
/**
 * temporal.yaml 与 statutes/ 目录的一致性自检。
 *
 * 建这个是因为第一版就漏登记了一部（e-signature-law.md），而漏登记的后果不是报错，
 * 是**静默**：Agent 查那部法时拿不到版本区间，只能当作"没有时间约束"照用，
 * 于是又回到「拿现行版套旧合同」那个最危险的失败模式上。
 *
 * 用法：node check-temporal.mjs   （零退出码 = 一致）
 */
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const here = dirname(fileURLToPath(import.meta.url))
const yaml = createRequire(join(here, 'x.js'))('js-yaml')

const doc = yaml.load(readFileSync(join(here, 'temporal.yaml'), 'utf8'))
const listed = doc.statutes.map((s) => s.file)
const onDisk = readdirSync(here).filter((f) => f.endsWith('.md'))

const problems = []
const missing = onDisk.filter((f) => !listed.includes(f))
const extra = listed.filter((f) => !onDisk.includes(f))
if (missing.length) problems.push(`目录里有但 temporal.yaml 未登记：${missing.join(', ')}`)
if (extra.length) problems.push(`temporal.yaml 登记了但目录里没有：${extra.join(', ')}`)
const dup = listed.filter((f, i) => listed.indexOf(f) !== i)
if (dup.length) problems.push(`重复登记：${[...new Set(dup)].join(', ')}`)
if (doc.summary?.total !== onDisk.length) {
  problems.push(`summary.total=${doc.summary?.total} 与实际 ${onDisk.length} 部不符`)
}
const confirmed = doc.statutes.filter(
  (s) => s.applicable_from && s.applicable_from !== 'unknown_needs_human',
).length
const unknown = doc.statutes.filter((s) => s.applicable_from === 'unknown_needs_human').length
if (doc.summary?.applicable_from_confirmed !== confirmed) {
  problems.push(`summary.applicable_from_confirmed=${doc.summary?.applicable_from_confirmed} 与实际 ${confirmed} 不符`)
}
if (doc.summary?.applicable_from_unknown !== unknown) {
  problems.push(`summary.applicable_from_unknown=${doc.summary?.applicable_from_unknown} 与实际 ${unknown} 不符`)
}
// 每条都得说清 applicable_from 的来源或为何未知——不许留白
for (const s of doc.statutes) {
  if (!s.applicable_from) problems.push(`${s.file}: 缺 applicable_from`)
  else if (s.applicable_from === 'unknown_needs_human') {
    if (!s.applicable_from_note) problems.push(`${s.file}: unknown 却没说明为何未知`)
  } else if (!s.applicable_from_source) {
    problems.push(`${s.file}: 有 applicable_from 却没给出处`)
  }
}

if (problems.length) {
  console.error('✗ temporal.yaml 自检未通过：')
  for (const p of problems) console.error('  -', p)
  process.exit(1)
}
console.log(`✓ temporal.yaml 与 statutes/ 一致：${onDisk.length} 部，${confirmed} 部有施行日出处，${unknown} 部待人工确认`)

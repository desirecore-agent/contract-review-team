import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const read = (p) => readFile(path.join(repo, p), 'utf8')
const section4 = (text) => {
  const a = text.indexOf('## 四、证据链')
  const b = text.indexOf('\n## ', a + 1)
  assert.ok(a > 0 && b > a, '找不到第四节')
  return text.slice(a, b)
}

// 按第四节的写法推算页码：按部件分页码序列；部件最后一处页码行之后还有编号条款或落款签署栏即页眉，否则页脚
const MARK = /^(.*?)(?:第\s*(\d+)\s*页\s*[/，,]\s*共\s*\d+\s*页|Page\s+(\d+)\s+of\s+\d+)/
const CLAUSE = /^(?:#+\s*)?(?:第\s*[一二三四五六七八九十百零\d]+\s*条|\d+(?:\.\d+)+\s|\d+\.\s|[一二三四五六七八九十]+、|(?:Section|Article|Clause)\s+\d)/
const SIGNATURE = /授权代表签字|签字（盖章）|（公章）|^\s*Signature:/
const label = (s) => s.replace(/[—\-\s*　]/g, '')
const paginate = (lines) => {
  const parts = new Map()
  lines.forEach((l, i) => {
    const m = l.match(MARK)
    if (!m) return
    const key = label(m[1]) || 'body'
    if (!parts.has(key)) parts.set(key, { marks: [] })
    parts.get(key).marks.push([i, Number(m[2] ?? m[3])])
  })
  // 附件从它的标题行开始；正文到第一个附件标题之前为止
  const heads = [...parts.keys()].filter((k) => k !== 'body')
    .map((k) => [k, lines.findIndex((l) => /^#/.test(l) && label(l).includes(k))])
  for (const [k, p] of parts) {
    p.start = k === 'body' ? 0 : heads.find(([h]) => h === k)[1]
    assert.ok(p.start >= 0, `页码行前缀「${k}」找不到对应的附件标题行`)
  }
  for (const p of parts.values()) {
    const later = [...parts.values()].map((q) => q.start).filter((s) => s > p.start)
    p.end = later.length ? Math.min(...later) : lines.length
    const last = p.marks.at(-1)[0]
    p.header = lines.slice(last + 1, p.end).some((l) => CLAUSE.test(l) || SIGNATURE.test(l))
  }
  return parts
}
const partOf = (parts, i) => [...parts].find(([, p]) => i >= p.start && i < p.end)?.[0]
const pageOf = (parts, key, i) => {
  const p = parts.get(key)
  if (!p) return 'unknown'
  if (p.header) return ([...p.marks].reverse().find(([at]) => at <= i) ?? p.marks[0])[1]
  return p.marks.find(([at]) => at >= i)?.[1] ?? 'unknown'
}
const lineIndexes = (text, quote) => {
  const out = []
  for (let at = text.indexOf(quote); at >= 0; at = text.indexOf(quote, at + 1)) out.push(text.slice(0, at).split('\n').length - 1)
  return out
}

// 2026-10-30 E 轮：最后一页（第 8 页页码行之后）的 16.1、17.4 被记成第 8 页；复审又指出附件页眉形态与正文后附表格
test('第四节写明按部件判读页码行，以尾部是否还有编号条款或落款签署栏区分页眉与页脚', async () => {
  const s = section4(await read('shared/rules.md'))
  assert.match(s, /「第 N 页 \/ 共 M 页」「第 N 页，共 M 页」「Page N of M」）按部件分别判读/)
  assert.match(s, /最后一处页码行之后、到该部件结束之前还有编号条款或落款签署栏的，\s*是页眉——该行到下一处页码行之前属于第 N 页，第一处页码行之前的部件标题与说明并入第一处页码行那一页/)
  assert.match(s, /否则是页脚——该行连同它上方到上一处页码行之间的内容属于第 N 页/)
  assert.match(s, /没有页码，或推出的页码与页码行矛盾（如超出「共 M 页」）时写 `page: unknown` 加行号 `locator`/)
  assert.match(s, /页码按行号对照页码行推算，不凭印象估；页码行跳号时以印出的页码为准/)
})

test('按该写法推算：C01 页脚、C06b 正文页脚而附件二页眉、C07 英文页脚、R02 逗号格式', async () => {
  const at = async (file) => {
    const text = await read(path.join('testdata/contracts', file))
    const lines = text.split('\n')
    const parts = paginate(lines)
    return (prefix) => { const i = lines.findIndex((l) => l.startsWith(prefix)); assert.ok(i >= 0, prefix); return pageOf(parts, partOf(parts, i), i) }
  }
  const c01 = await at('C01-saas-subscription.md')
  assert.equal(c01('4.1 '), 4)
  assert.equal(c01('16.1 '), 9)
  assert.equal(c01('17.4 '), 9)
  const c06b = await at('C06b-saas-v2.md')
  assert.equal(c06b('# 软件即服务'), 1)
  assert.equal(c06b('| 附件二 |'), 'unknown', '正文最后一处页码行之后的附件清单表没有页码')
  assert.equal(c06b('# 附件二'), 1, '页眉形态下附件标题并入第一页')
  assert.equal(c06b('2.1 乙方承诺服务的月度可用性'), 1)
  assert.equal(c06b('5.1 乙方就本服务水平协议'), 2)
  const c07 = await at('C07-master-services-agreement.md')
  assert.equal(c07('12.1 This Agreement shall be governed'), 6)
  const r02 = await at('R02-govt-purchase-executed.md')
  assert.equal(r02('二、组成合同的文件'), 1)
})

// 同日核对：oracle 有 33 处 literal 证据的 page 与页码行对不上（28 处按页眉读，C02 一处按页码行出现次序数，C07/C08 英文页码 4 处）
test('oracle 每条 literal 证据的 page 与按第四节推算的页码一致', async () => {
  const { parse } = await import('yaml')
  const cases = parse(await read('testdata/contracts/ground-truth.yaml')).normative.cases
  const files = {}
  const load = async (cid) => {
    if (!files[cid]) {
      const text = await read(path.join('testdata/contracts', cases[cid].source.file))
      files[cid] = { text, parts: paginate(text.split('\n')) }
    }
    return files[cid]
  }
  const bad = []
  let checked = 0
  for (const cid of Object.keys(cases)) {
    const evidence = []
    const visit = (x) => {
      if (!x || typeof x !== 'object') return
      if (Array.isArray(x)) return x.forEach(visit)
      if (x.kind === 'literal' && typeof x.page === 'number' && typeof x.quote === 'string') evidence.push(x)
      Object.values(x).forEach(visit)
    }
    visit(cases[cid])
    for (const x of evidence) {
      const { text, parts } = await load(x.source_case ?? cid)
      if (!parts.size) { bad.push(`${cid}/${x.id}: 材料没有页码行，page 应写 unknown`); continue }
      const key = x.part === 'body' ? 'body' : label(x.part.replace(/^attachment:/, ''))
      const hits = lineIndexes(text, x.quote).filter((i) => partOf(parts, i) === key)
      assert.ok(hits.length, `${cid}/${x.id}：quote 在 ${x.part} 里零命中`)
      const pages = [...new Set(hits.map((i) => pageOf(parts, key, i)))]
      checked++
      if (pages.length !== 1 || pages[0] !== x.page) bad.push(`${cid}/${x.id}: page=${x.page}，推算=${pages.join('|')}`)
    }
  }
  assert.ok(checked >= 85, `只核对到 ${checked} 条，遍历可能失效`)
  assert.deepEqual(bad, [])
})

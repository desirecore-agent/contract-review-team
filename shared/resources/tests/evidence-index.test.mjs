import test, { afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const checker = fileURLToPath(new URL('../../../testdata/contracts/check-evidence.mjs', import.meta.url))
const generator = fileURLToPath(new URL('../../../testdata/contracts/generate-evidence-index.mjs', import.meta.url))
const roots = new Set()
afterEach(() => { for (const root of roots) rmSync(root, { recursive: true, force: true }); roots.clear() })
function fixture() {
  const dir = mkdtempSync(join(tmpdir(), 'evidence-test-')), oracle = join(dir, 'ground-truth.yaml'), index = join(dir, 'index.json')
  roots.add(dir)
  writeFileSync(join(dir, 'C01.md'), 'CURRENT literal\n')
  writeFileSync(oracle, 'history:\n  cases:\n    OLD:\n      source: { file: missing.md }\n      evidence:\n        - { kind: literal, quote: "HISTORY literal" }\nnormative:\n  normative: true\n  cases:\n    C01:\n      source: { file: C01.md }\n      evidence:\n        - id: E1\n          kind: literal\n          quote: "CURRENT literal"\n')
  const g = spawnSync(process.execPath, [generator, '--oracle', oracle, '--index', index], { encoding: 'utf8' }); assert.equal(g.status, 0, g.stderr)
  return { dir, oracle, index, indexSha256: createHash('sha256').update(readFileSync(index)).digest('hex') }
}
const check = (f) => spawnSync(process.execPath, [checker, '--oracle', f.oracle, '--index', f.index, '--index-sha256', f.indexSha256], { encoding: 'utf8' })
test('default reviewed index passes with no custom pin override', () => { const r=spawnSync(process.execPath,[checker],{encoding:'utf8'}); assert.equal(r.status,0,r.stderr); assert.match(r.stdout,/96.*14/) })
test('generator derives only normative.cases and checker passes', () => { const f = fixture(), data = JSON.parse(readFileSync(f.index)); assert.equal(data.literals.length, 1); assert.equal(data.literals[0].quote, 'CURRENT literal'); assert.equal(check(f).status, 0) })
test('index quote substitution fails even when the replacement remains a literal substring', () => { const f=fixture(), x=JSON.parse(readFileSync(f.index)); x.literals[0].quote='CURRENT'; writeFileSync(f.index,JSON.stringify(x)); const r=check(f); assert.equal(r.status,1); assert.match(r.stderr,/index digest mismatch/) })
test('unknown nonempty source case in the index cannot pass', () => { const f=fixture(), x=JSON.parse(readFileSync(f.index)); x.literals[0].sourceCase='INVENTED'; writeFileSync(f.index,JSON.stringify(x)); const r=check(f); assert.equal(r.status,1); assert.match(r.stderr,/index digest mismatch/) })
test('malformed literals return bounded failure rather than an uncaught TypeError', () => { const f=fixture(), x=JSON.parse(readFileSync(f.index)); x.literals={}; writeFileSync(f.index,JSON.stringify(x)); const r=check(f); assert.equal(r.status,1); assert.doesNotMatch(r.stderr,/TypeError|at file:/) })
test('oracle byte drift fails without automatic regeneration', () => { const f = fixture(); writeFileSync(f.oracle, readFileSync(f.oracle, 'utf8') + '# drift\n'); const r = check(f); assert.equal(r.status, 1); assert.match(r.stderr, /binding mismatch/) })
for (const evidence of ['[]', '[{id: NEG, kind: negative_search, patterns: [absent]}]']) test(`negative-only or empty-evidence input remains digest-bound: ${evidence}`, () => {
  const f = fixture()
  writeFileSync(join(f.dir, 'C02.md'), 'negative-only input\n')
  writeFileSync(f.oracle, readFileSync(f.oracle, 'utf8') + `    C02:\n      source: {file: C02.md}\n      evidence: ${evidence}\n`)
  const g = spawnSync(process.execPath, [generator, '--oracle', f.oracle, '--index', f.index], { encoding: 'utf8' })
  assert.equal(g.status, 0, g.stderr)
  const bytes = readFileSync(f.index), data = JSON.parse(bytes)
  assert.equal(Object.keys(data.sources).length, 2); assert.ok(data.sources['C02.md'])
  f.indexSha256 = createHash('sha256').update(bytes).digest('hex')
  assert.equal(check(f).status, 0)
  writeFileSync(join(f.dir, 'C02.md'), 'changed input\n')
  const r = check(f); assert.equal(r.status, 1); assert.match(r.stderr, /C02.md: source SHA-256 mismatch/)
})
test('generator refuses a false declared source digest rather than blessing current bytes', () => {
  const f = fixture()
  writeFileSync(f.oracle, readFileSync(f.oracle, 'utf8').replace('source: { file: C01.md }', `source: {file: C01.md, sha256: '${'0'.repeat(64)}'}`))
  const before = readFileSync(f.index)
  const r = spawnSync(process.execPath, [generator, '--oracle', f.oracle, '--index', f.index], { encoding: 'utf8' })
  assert.equal(r.status, 1); assert.match(r.stderr, /declared source SHA-256 mismatch/)
  assert.deepEqual(readFileSync(f.index), before)
})
for (const [name, mutate, pattern] of [
  ['blank quote', x => { x.literals[0].quote = ' ' }, /blank quote/],
  ['unknown source case', x => { x.literals[0].sourceCase = '' }, /missing case\/sourceCase/],
  ['invalid path', x => { x.literals[0].file = '../outside' }, /invalid or unindexed/],
  ['zero literals', x => { x.literals = [] }, /zero literals/],
  ['zero sources', x => { x.sources = {} }, /zero source files/],
]) test(`${name} fails closed`, () => { const f = fixture(), x = JSON.parse(readFileSync(f.index)); mutate(x); writeFileSync(f.index, JSON.stringify(x)); const r = check(f); assert.equal(r.status, 1); assert.match(r.stderr, pattern) })

import test, { afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const script = fileURLToPath(new URL('../check-member-tool-ceiling.mjs', import.meta.url))
const ids = ['contract-review-lead', 'contract-intake', 'clause-extractor', 'risk-scanner', 'jurisdiction-auditor', 'review-reporter']
const runGit = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim()

const roots = new Set()
afterEach(() => { for (const root of roots) rmSync(root, { recursive: true, force: true }); roots.clear() })

function fixture(overrides = {}) {
  const root = mkdtempSync(join(tmpdir(), 'ceiling-test-')), agents = join(root, 'agents'), lock = { agents: {} }
  roots.add(root)
  mkdirSync(agents)
  for (const id of ids) {
    const repo = join(agents, id); mkdirSync(repo)
    const allowed = id === 'contract-review-lead' ? ['Read', 'ExportDocument'] : id === 'review-reporter' ? ['Read', 'ExportDocument'] : ['Read']
    writeFileSync(join(repo, 'agent.json'), JSON.stringify({ version: '1.0.0', tool_permissions: overrides[id] ?? { allowed, denied: [] } }, null, 2))
    runGit(repo, 'init', '-q'); runGit(repo, 'add', 'agent.json'); runGit(repo, '-c', 'user.name=T', '-c', 'user.email=t@example.invalid', 'commit', '-qm', 'fixture')
    lock.agents[id] = { source: 'git', version: '1.0.0', commit: runGit(repo, 'rev-parse', 'HEAD') }
  }
  const lockPath = join(root, 'lock.json'); writeFileSync(lockPath, JSON.stringify(lock))
  return { root, agents, lockPath, lock }
}
const run = (f, extra = []) => spawnSync(process.execPath, [script, '--agents-dir', f.agents, '--lock', f.lockPath, ...extra], { encoding: 'utf8' })

test('matching repositories, exact HEADs and blobs pass', () => { const f = fixture(); const r = run(f); assert.equal(r.status, 0, r.stderr); assert.match(r.stdout, /5 名成员/) })
test('same version but wrong HEAD fails', () => { const f = fixture(), repo = join(f.agents, 'contract-intake'); writeFileSync(join(repo, 'note'), 'x'); runGit(repo, 'add', 'note'); runGit(repo, '-c', 'user.name=T', '-c', 'user.email=t@example.invalid', 'commit', '-qm', 'other'); const r = run(f); assert.equal(r.status, 1); assert.match(r.stderr, /HEAD/) })
test('missing repository fails source identity', () => { const f = fixture(); f.agents = join(f.root, 'missing'); const r = run(f); assert.equal(r.status, 1); assert.match(r.stderr, /读不到|未验证/) })
test('present matching-version config without its repository cannot pass', () => { const f=fixture(); rmSync(join(f.agents,'contract-intake','.git'),{recursive:true,force:true}); const r=run(f); assert.equal(r.status,1); assert.match(r.stderr,/native Git 源身份未验证|不是实际 Git repo 根/) })
test('dirty agent.json fails byte identity', () => { const f = fixture(), p = join(f.agents, 'risk-scanner', 'agent.json'); const c = JSON.parse(readFileSync(p)); c.extra = true; writeFileSync(p, JSON.stringify(c)); const r = run(f); assert.equal(r.status, 1); assert.match(r.stderr, /配置 dirty/) })
test('missing lock entry fails closed', () => { const f = fixture(); delete f.lock.agents['clause-extractor']; writeFileSync(f.lockPath, JSON.stringify(f.lock)); const r = run(f); assert.equal(r.status, 1); assert.match(r.stderr, /no object entry/) })
test('incomplete CLI parameter is usage error', () => { const r = spawnSync(process.execPath, [script, '--lock'], { encoding: 'utf8' }); assert.equal(r.status, 2); assert.match(r.stderr, /缺少路径参数/) })

test('empty allowed is unrestricted, not a successful finite ceiling proof', () => {
  const r = run(fixture({ 'contract-intake': { allowed: [], denied: [] } }))
  assert.equal(r.status, 1); assert.match(r.stderr, /unrestricted/)
})
for (const allowed of [[' '], [42], ['server__*']]) test(`unsupported allowed ${JSON.stringify(allowed)} is unverified`, () => {
  const r = run(fixture({ 'contract-intake': { allowed, denied: [] } }))
  assert.equal(r.status, 1); assert.match(r.stderr, /明确工具名字符串/)
})
test('member denied wins over its allowed list before comparing with parent', () => {
  const r = run(fixture({ 'contract-intake': { allowed: ['Read', 'Bash'], denied: ['bAsH'] } }))
  assert.equal(r.status, 0, r.stderr)
})
test('parent denied still blocks an effective child requirement', () => {
  const r = run(fixture({ 'contract-review-lead': { allowed: ['Read', 'Bash'], denied: ['Bash'] }, 'contract-intake': { allowed: ['Read', 'Bash'], denied: [] } }))
  assert.equal(r.status, 1); assert.match(r.stderr, /编排官 denied/)
})
test('none sentinel means deny-all, not an unknown required tool', () => {
  const r = run(fixture({ 'contract-intake': { allowed: ['none', 'Bash'], denied: [] } }))
  assert.equal(r.status, 0, r.stderr)
})
test('DelegateControl is excluded by the runtime recursive-tool ceiling', () => {
  const r = run(fixture({ 'contract-intake': { allowed: ['Read', 'DelegateControl'], denied: [] } }))
  assert.equal(r.status, 0, r.stderr)
})
test('optional excluded export is disclosed as debt, not a satisfied requirement', () => {
  const r = run(fixture({ 'contract-review-lead': { allowed: ['Read'], denied: [] } }))
  assert.equal(r.status, 0, r.stderr); assert.match(r.stderr, /DOCX.*不.*满足|必要导出能力不会.*已满足/)
  assert.match(r.stdout, /实际豁免 1 项/)
})

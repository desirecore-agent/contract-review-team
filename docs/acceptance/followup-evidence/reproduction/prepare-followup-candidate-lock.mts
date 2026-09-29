import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { isAbsolute, join, relative, resolve } from 'node:path'
import { assertCandidateLockPreconditions, EXPECTED_PLATFORM_COMMIT } from './candidate-lock-preconditions.mjs'

// Source-only release preparation. This does not install, approve or run agents.
const platform = process.cwd()
const team = process.argv[2]
const home = process.env.DESIRECORE_HOME
if (!team || !isAbsolute(team) || !home || !isAbsolute(home)) throw new Error('Explicit absolute team and diagnostic home required')
const homeRelative = relative(join(platform, 'workspace'), home)
if (!homeRelative || homeRelative.startsWith('..') || isAbsolute(homeRelative) || existsSync(home)) throw new Error('A fresh diagnostic home below platform workspace is required')
if (process.env.DESIRECORE_TEST_ROOT) throw new Error('Unexpected higher-priority test root')
const evidenceName = process.argv[3] ?? 'followup'
if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(evidenceName)) throw new Error('A safe evidence run name is required')
const output = join(team, 'workspace', 'evidence', `${evidenceName}-members.candidate.lock.json`)
const reportPath = join(team, 'workspace', 'evidence', `${evidenceName}-candidate-lock-verification.json`)
if (existsSync(output) || existsSync(reportPath)) throw new Error('Evidence is write-once; select a new run')
const git = (cwd: string, ...args: string[]) => execFileSync('/usr/bin/git', ['-C', cwd, ...args], { maxBuffer: 16 * 1024 * 1024 })
const sha = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex')
const publishedPath = join(team, 'members.lock.json')
const publishedBytes = readFileSync(publishedPath)
const published = JSON.parse(publishedBytes.toString('utf8'))
const assertFixedPlatformAndRoster = () => assertCandidateLockPreconditions({
  platformHead: git(platform, 'rev-parse', 'HEAD').toString().trim(),
  platformTrackedClean: git(platform, 'status', '--porcelain', '--untracked-files=no').toString().trim() === '',
  memberIds: Object.keys(published.agents ?? {}),
})
assertFixedPlatformAndRoster()
const snapshots: { id: string; head: string; tree: string; version: string; byteHashes: Record<string, string> }[] = []
for (const id of Object.keys(published.agents)) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) throw new Error('Invalid member id')
  const source = join(team, 'workspace', 'sources', id)
  const dirty = git(source, 'status', '--porcelain', '--untracked-files=all').toString().trim()
  if (dirty) throw new Error(`Member candidate must be committed and clean: ${id}`)
  const head = git(source, 'rev-parse', 'HEAD').toString().trim()
  const tree = git(source, 'rev-parse', 'HEAD^{tree}').toString().trim()
  if (!/^[a-f0-9]{40}$/.test(head)) throw new Error('Invalid pinned head')
  const agent = JSON.parse(git(source, 'show', `${head}:agent.json`).toString())
  snapshots.push({ id, head, tree, version: agent.version, byteHashes: {} })
}
mkdirSync(home, { recursive: false })
for (const snapshot of snapshots) {
  const source = join(team, 'workspace', 'sources', snapshot.id)
  const destination = join(home, 'agents', snapshot.id)
  mkdirSync(destination, { recursive: true })
  for (const name of ['agent.json', 'persona.md', 'principles.md']) {
    const bytes = git(source, 'show', `${snapshot.head}:${name}`)
    writeFileSync(join(destination, name), bytes, { flag: 'wx' })
    snapshot.byteHashes[name] = sha(bytes)
  }
}
const { getDesireCoreRoot } = await import('../packages/shared/src/utils/desirecore-root.ts')
if (resolve(getDesireCoreRoot()) !== resolve(home)) throw new Error('Resolved diagnostic root mismatch')
const { computeMemberContentHash } = await import('../packages/agent-service/src/team/lock.ts')
const { validateTeamLockFile } = await import('../packages/schemas/src/agent-service/team-members.ts')
const timestamp = new Date().toISOString()
const candidate = { ...published, resolvedAt: timestamp, agents: {} as Record<string, unknown> }
for (const snapshot of snapshots) {
  const contentHash = computeMemberContentHash(snapshot.id)
  if (!/^v3:[a-f0-9]{64}$/.test(contentHash)) throw new Error(`Canonical hash failed: ${snapshot.id}`)
  candidate.agents[snapshot.id] = { ...published.agents[snapshot.id], commit: snapshot.head, version: snapshot.version, contentHash, syncedAt: timestamp }
}
const validation = validateTeamLockFile(candidate)
if (!validation.success) throw new Error(`Candidate lock does not satisfy platform schema: ${JSON.stringify(validation.errors)}`)
if (!readFileSync(publishedPath).equals(publishedBytes)) throw new Error('Published lock changed during preparation')
assertFixedPlatformAndRoster()
const candidateBytes = JSON.stringify(candidate, null, 2) + '\n'
const report = {
  observedAt: timestamp, scope: 'candidate-source-preflight-only-not-published-or-installed',
  platformCommit: git(platform, 'rev-parse', 'HEAD').toString().trim(),
  expectedPlatformCommit: EXPECTED_PLATFORM_COMMIT, platformTrackedClean: true, exactMemberCount: snapshots.length,
  canonicalImplementation: 'packages/agent-service/src/team/lock.ts#computeMemberContentHash',
  implementationSha256: sha(readFileSync(join(platform, 'packages/agent-service/src/team/lock.ts'))),
  publishedLockUnchanged: true, publishedLockSha256: sha(publishedBytes),
  candidateLockSha256: sha(candidateBytes), platformSchemaValid: true,
  hashCoverage: ['agent.json', 'persona.md', 'principles.md'],
  note: 'v3 is not a full skill-tree digest. Exact Git commit and tree pin complete member source identity. This is not an installation or model result.',
  members: snapshots,
}
writeFileSync(output, candidateBytes, { flag: 'wx' })
writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify(report, null, 2))

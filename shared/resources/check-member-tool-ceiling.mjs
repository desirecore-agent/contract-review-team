#!/usr/bin/env node
/**
 * 成员工具上限与所选源码身份自检。
 *
 * 零 NPM 依赖，但明确要求 PATH 中有 native Git。Git 只作本地只读查询，绝不 fetch。
 * 对每个成员核对：lock 的完整 commit、目录的 repo root/HEAD，以及工作区 agent.json
 * 与该 commit 中 agent.json blob 的原始字节。它锁定本检查所读取的配置，不证明全树内容
 * 或全部运行能力；contentHash v3 仍由平台安装器负责。
 *
 * 用法：node shared/resources/check-member-tool-ceiling.mjs [--agents-dir <目录>] [--lock <锁文件>]
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, realpathSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const teamRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const failures = []
const SHA40 = /^[0-9a-f]{40}$/
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function parseArgs(argv) {
  const options = { agentsDir: resolve(teamRoot, '..', '..', 'agents'), lockPath: join(teamRoot, 'members.lock.json') }
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i]
    if (flag !== '--agents-dir' && flag !== '--lock') throw new Error(`未知参数：${flag}`)
    const value = argv[++i]
    if (!value || value.startsWith('--')) throw new Error(`${flag} 缺少路径参数`)
    if (flag === '--agents-dir') options.agentsDir = resolve(value)
    else options.lockPath = resolve(value)
  }
  return options
}

let options
try { options = parseArgs(process.argv.slice(2)) } catch (error) { console.error(`✗ 参数错误：${error.message}`); process.exit(2) }
const { agentsDir, lockPath } = options

// Matches the pinned platform's RECURSIVE_DELEGATE_TOOL_NAMES; not a capability grant.
const RECURSIVE = new Set(['delegate', 'delegatecontrol', 'spawn_agent'])
const TOOL_NAME = /^[a-zA-Z][a-zA-Z0-9_-]*$/
const INTENTIONAL = {
  'review-reporter': {
    ExportDocument: '通用 ExportDocument 是可选的普通 Word/PDF 转换能力，编排官未提供。已知能力债：当前委派路径没有可用的 DOCX 导出能力；必要导出能力不会因本豁免而视为已满足。',
  },
}
const norm = (name) => String(name).trim().toLowerCase()

function readJson(path, label) {
  try { return JSON.parse(readFileSync(path, 'utf8')) }
  catch (error) { failures.push(`${label}: 读不到或不是有效 JSON：${path}（${error.code ?? error.message}）`); return null }
}

const members = readJson(join(teamRoot, 'members.json'), 'members.json')?.agents ?? {}
const lock = readJson(lockPath, 'selected lock')
const ids = Object.keys(members)
for (const id of ids) if (!ID.test(id)) failures.push(`members.json: 非法成员 ID ${JSON.stringify(id)}`)
if (!lock || !lock.agents || typeof lock.agents !== 'object' || Array.isArray(lock.agents)) failures.push('selected lock: 缺少 agents 映射')
for (const id of Object.keys(lock?.agents ?? {})) {
  if (!ID.test(id)) failures.push(`selected lock: 非法成员 ID ${JSON.stringify(id)}`)
  else if (!(id in members)) failures.push(`selected lock: 未知成员 ${id}`)
}
const supervisors = ids.filter((id) => members[id]?.role === 'supervisor')
if (supervisors.length !== 1) failures.push(`members.json 应恰好有一名 supervisor，实际 ${supervisors.length} 名：${supervisors.join(', ') || '无'}`)
const supervisorId = supervisors[0]

function git(repo, args, encoding = 'utf8') {
  return execFileSync('git', ['-C', repo, ...args], { encoding, stdio: ['ignore', 'pipe', 'pipe'] })
}

function readPermissions(id) {
  if (!ID.test(id)) return null
  const repo = resolve(agentsDir, id)
  const configPath = join(repo, 'agent.json')
  const locked = lock?.agents?.[id]
  if (!locked || typeof locked !== 'object' || Array.isArray(locked)) { failures.push(`${id}: selected lock ${lockPath} has no object entry`); return null }
  if (locked.source !== 'git') failures.push(`${id}: lock source 必须为 git`)
  if (!SHA40.test(locked.commit ?? '')) failures.push(`${id}: lock commit 必须是 40 位小写十六进制完整 SHA`)
  if (typeof locked.version !== 'string' || !locked.version.trim()) failures.push(`${id}: lock version 缺失`)
  let bytes
  try { bytes = readFileSync(configPath) } catch (error) { failures.push(`${id}: 读不到 ${configPath}（${error.code ?? error.message}）`); return null }
  let config
  try { config = JSON.parse(bytes.toString('utf8')) } catch (error) { failures.push(`${id}: agent.json 不是有效 JSON（${error.message}）`); return null }
  try {
    const root = git(repo, ['rev-parse', '--show-toplevel']).trim()
    if (realpathSync(root) !== realpathSync(repo)) failures.push(`${id}: ${repo} 不是实际 Git repo 根（实际 ${root}）`)
    const head = git(repo, ['rev-parse', 'HEAD']).trim()
    if (SHA40.test(locked.commit ?? '') && head !== locked.commit) failures.push(`${id}: repo HEAD ${head} 不等于 lock commit ${locked.commit}`)
    if (SHA40.test(locked.commit ?? '')) {
      git(repo, ['cat-file', '-e', `${locked.commit}^{commit}`])
      const committed = git(repo, ['show', `${locked.commit}:agent.json`], null)
      if (!Buffer.from(committed).equals(bytes)) failures.push(`${id}: 工作区 agent.json 与 lock commit ${locked.commit} 中的 blob 字节不一致（配置 dirty）`)
    }
  } catch (error) {
    const detail = String(error.stderr ?? error.message).trim().split('\n')[0]
    failures.push(`${id}: native Git 源身份未验证（缺 Git、非仓库、commit/blob 不存在或不可读）：${detail}`)
  }
  const permissions = config.tool_permissions
  // agent.json allowed:[] means unrestricted in production, NOT zero tools.
  // Without the live registry this finite static checker cannot prove an unrestricted
  // or wildcard policy. Fail as unverified; never silently reinterpret that policy.
  if (!Array.isArray(permissions?.allowed) || permissions.allowed.length === 0) {
    failures.push(`${id}: 本检查要求显式非空的有限工具清单；空/缺失 allowed 在平台表示 unrestricted，不能据此证明工具上限`)
    return null
  }
  if (permissions.denied !== undefined && !Array.isArray(permissions.denied)) {
    failures.push(`${id}: tool_permissions.denied 必须是字符串数组`)
    return null
  }
  const denied = permissions.denied ?? []
  for (const [field, values] of [['allowed', permissions.allowed], ['denied', denied]]) {
    if (values.some(value => typeof value !== 'string' || !TOOL_NAME.test(value.trim()))) {
      failures.push(`${id}: ${field} 仅支持非空的明确工具名字符串；通配策略须由真实平台核验`)
      return null
    }
  }
  if (config.version !== locked.version) failures.push(`${id}: agent.json version ${config.version ?? 'missing'} 不等于 lock version ${locked.version}`)
  const declaredAllowed = permissions.allowed.map(norm)
  return { allowed: declaredAllowed.includes('none') ? [] : declaredAllowed, denied: denied.map(norm) }
}

const lead = supervisorId ? readPermissions(supervisorId) : null
let checked = 0
const optionalGaps = []
if (lead) {
  const leadAllowed = new Set(lead.allowed.map(norm)); const leadDenied = new Set(lead.denied.map(norm))
  for (const id of ids) {
    if (id === supervisorId) continue
    const member = readPermissions(id); if (!member) continue
    checked++
    const exempt = new Map(Object.entries(INTENTIONAL[id] ?? {}).map(([name, reason]) => [norm(name), reason]))
    const memberDenied = new Set(member.denied)
    for (const tool of new Set(member.allowed)) {
      const key = norm(tool)
      if (memberDenied.has(key) || RECURSIVE.has(key)) continue
      const deniedByParent = leadDenied.has(key)
      const absentFromParent = !leadAllowed.has(key)
      if ((deniedByParent || absentFromParent) && exempt.has(key)) {
        optionalGaps.push(`${id}/${tool}: ${exempt.get(key)}`)
        continue
      }
      if (deniedByParent) failures.push(`${id}: 需要 ${tool}，但编排官 denied 了它`)
      else if (absentFromParent) failures.push(`${id}: 需要 ${tool}，编排官白名单里没有`)
    }
  }
}
if (lead && checked === 0) failures.push('一名成员都没有核对到')
if (failures.length) {
  console.error(`✗ 成员工具上限/源码身份自检未通过（编排官 ${supervisorId ?? '未知'}，成员目录 ${agentsDir}）：`)
  for (const failure of failures) console.error('  -', failure)
  process.exit(1)
}
for (const gap of optionalGaps) console.warn(`  - 可选能力欠账（不计作已满足）：${gap}`)
console.log(`✓ ${checked} 名成员的有限工具有效清单与 agent.json 源身份通过检查（锁 ${lockPath}；native Git；实际豁免 ${optionalGaps.length} 项；非运行能力证明）`)

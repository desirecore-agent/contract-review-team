#!/usr/bin/env node
/**
 * 成员工具上限自检：每名成员白名单里的工具，编排官（supervisor）白名单里也必须有。
 *
 * 为什么要有这个：平台委派时，子会话的工具上限是发起方已注册工具的子集
 * （desirecore delegate.ts 的 buildChildRegisteredTools：任何 allowlist 只能继续缩小父集合；
 * 发起方的 denied 也整体传给子会话）。成员在自己的 agent.json 里加了工具，编排官没加，
 * 被委派时这个工具就**静默消失**——不报错，成员只会说「本环境没有这个工具」然后走兜底。
 * 2026-09-29 真机：contract-intake 1.0.7 加了 StructuredFileValidate，被委派后照样拿不到；
 * 同时查出 UnderstandImage 在四名成员身上一直是这个状态，扫描件与签章图像从没真正看过。
 *
 * 用法：
 *   node shared/resources/check-member-tool-ceiling.mjs [--agents-dir <目录>]
 * 默认按安装布局找成员：<根>/teams/<团队目录>/ 与 <根>/agents/<成员 id>/agent.json。
 * 开发时各成员仓库不在这个布局下，用 --agents-dir 指向放着各成员目录的父目录。
 *
 * ⚠️ 零依赖：随团队目录分发到用户实例，那里没有 node_modules。
 * ⚠️ 任何成员的 agent.json 找不到或读不懂，直接失败——跳过就是空转。
 */
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const teamRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const argIndex = process.argv.indexOf('--agents-dir')
const agentsDir = argIndex > 0 ? resolve(process.argv[argIndex + 1] ?? '') : resolve(teamRoot, '..', '..', 'agents')

/** 递归委派工具：平台永远不给子会话，成员白名单里写了也不会生效，不算缺口。 */
const RECURSIVE = new Set(['delegate', 'spawn_agent'])

/**
 * 刻意由编排官禁用、成员侧只作可选能力的工具。每一条都必须写明理由；
 * 新增条目等于承认「这名成员被委派时用不了它」，要在对应成员的技能里有兜底写法。
 */
const INTENTIONAL = {
  'review-reporter': {
    ExportDocument: '编排官自建仓起禁用通用导出；带修订的 DOCX 走 ExportRedlineDocument。'
      + 'report-composition 只在「确有需要把 Markdown 报告转成普通 Word/PDF」时才用它。',
  },
}

const norm = (name) => String(name).trim().toLowerCase()
const failures = []

const members = JSON.parse(readFileSync(join(teamRoot, 'members.json'), 'utf8')).agents ?? {}
const ids = Object.keys(members)
const supervisors = ids.filter((id) => members[id].role === 'supervisor')
if (supervisors.length !== 1) {
  console.error(`✗ members.json 应恰好有一名 supervisor，实际 ${supervisors.length} 名：${supervisors.join(', ') || '无'}`)
  process.exit(1)
}
const supervisorId = supervisors[0]

function readPermissions(id) {
  const path = join(agentsDir, id, 'agent.json')
  let config
  try {
    config = JSON.parse(readFileSync(path, 'utf8'))
  } catch (error) {
    failures.push(`${id}: 读不到 ${path}（${error.code ?? error.message}）。开发环境请用 --agents-dir 指向成员目录的父目录`)
    return null
  }
  const allowed = config.tool_permissions?.allowed
  if (!Array.isArray(allowed)) {
    failures.push(`${id}: agent.json 没有 tool_permissions.allowed 数组，无法判断它需要哪些工具`)
    return null
  }
  return { allowed, denied: Array.isArray(config.tool_permissions?.denied) ? config.tool_permissions.denied : [] }
}

const lead = readPermissions(supervisorId)
let checked = 0
if (lead) {
  const leadAllowed = new Set(lead.allowed.map(norm))
  const leadDenied = new Set(lead.denied.map(norm))
  for (const id of ids) {
    if (id === supervisorId) continue
    const member = readPermissions(id)
    if (!member) continue
    checked++
    const exempt = new Set(Object.keys(INTENTIONAL[id] ?? {}).map(norm))
    for (const tool of member.allowed) {
      const key = norm(tool)
      if (RECURSIVE.has(key) || exempt.has(key)) continue
      if (leadDenied.has(key)) failures.push(`${id}: 需要 ${tool}，但编排官 denied 了它——委派时整体传给子会话，成员拿不到`)
      else if (!leadAllowed.has(key)) failures.push(`${id}: 需要 ${tool}，编排官白名单里没有——委派时会被静默截掉`)
    }
    // 豁免条目要真的还在用，否则就是一条过期的借口
    for (const tool of Object.keys(INTENTIONAL[id] ?? {})) {
      if (!member.allowed.map(norm).includes(norm(tool))) failures.push(`${id}: 豁免了 ${tool}，但它已不在该成员白名单里，删掉这条豁免`)
    }
  }
}

// 反空转：一名成员都没核对到不能报绿
if (lead && checked === 0) failures.push('一名成员都没有核对到——members.json 与成员目录很可能对不上')

if (failures.length) {
  console.error(`✗ 成员工具上限自检未通过（编排官 ${supervisorId}，成员目录 ${agentsDir}）：`)
  for (const failure of failures) console.error('  -', failure)
  process.exit(1)
}
console.log(`✓ ${checked} 名成员的工具白名单都在编排官 ${supervisorId} 的上限之内`
  + `（豁免 ${Object.values(INTENTIONAL).reduce((n, m) => n + Object.keys(m).length, 0)} 项，理由见脚本 INTENTIONAL）`)

#!/usr/bin/env node
// Cross-file guard for the intake verdict contract.  This repository owns the
// shared rules and ontology consumed by every member; a member release must
// not silently make these three sources disagree again.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseDocument } from 'yaml'

const root = join(dirname(fileURLToPath(import.meta.url)), 'business-ontology')
const read = (name) => readFileSync(join(root, name), 'utf8')
const rules = read('rules.md')
const actions = read('actions.yaml')
const contract = read('contract.yaml')
const relations = read('relations.yaml')
const failures = []

const assertYamlParses = (name, source) => {
  const document = parseDocument(source, { prettyErrors: false })
  if (document.errors.length) {
    console.error(`✗ YAML parse failed: shared/resources/business-ontology/${name}`)
    for (const error of document.errors) console.error(`  - ${error.message}`)
    process.exit(1)
  }
  console.log(`✓ parsed YAML: shared/resources/business-ontology/${name}`)
  return document
}

// Parse before any local text assertions. A readable token in malformed YAML is not a valid contract.
assertYamlParses('actions.yaml', actions)
assertYamlParses('contract.yaml', contract)
assertYamlParses('relations.yaml', relations)

const requireText = (source, value, message) => {
  if (!source.includes(value)) failures.push(message)
}

const forbidText = (source, value, message) => {
  if (source.includes(value)) failures.push(message)
}

const requireTokens = (source, tokens, message) => {
  const missing = tokens.filter((token) => !source.includes(token))
  if (missing.length) failures.push(`${message}: missing ${missing.join(', ')}`)
}

const markdownSection = (source, heading) => {
  const start = source.indexOf(heading)
  if (start === -1) return ''
  const next = source.indexOf('\n### ', start + heading.length)
  return source.slice(start, next === -1 ? undefined : next)
}

const lineFor = (source, prefix) => source.split(/\r?\n/).find((line) => line.startsWith(prefix)) ?? ''

const yamlListEntry = (source, id) => {
  const marker = `  - id: ${id}`
  const start = source.indexOf(marker)
  if (start === -1) return ''
  const next = source.indexOf('\n  - id: ', start + marker.length)
  return source.slice(start, next === -1 ? undefined : next)
}

const yamlMapEntry = (source, indent, key) => {
  const marker = `${indent}${key}:`
  const start = source.indexOf(marker)
  if (start === -1) return ''
  const sibling = new RegExp(`\\n${indent}[^\\s]`, 'g')
  sibling.lastIndex = start + marker.length
  const next = sibling.exec(source)?.index
  return source.slice(start, next)
}

const r020a = markdownSection(rules, '### R-020A R7 范围事实与 R9 权威清单缺失必须分流')
const r7Rule = lineFor(r020a, '- **R7 规则**：')
const r9Rule = lineFor(r020a, '- **R9 规则**：')
const intakeAction = yamlListEntry(actions, 'run_intake_gate')
const intakeVerdictNode = yamlMapEntry(contract, '      ', 'intake_verdict')
const dc002 = yamlListEntry(relations, 'DC-002')

requireText(rules, '### R-020 五类对象不成立直接阻断', 'R-020 blocking rule is missing')
requireText(rules, '输入治理裁决为 `blocked`', 'R-020 must use the canonical blocked literal')
requireText(rules, '### R-020A R7 范围事实与 R9 权威清单缺失必须分流', 'R-020A R7/R9 split rule is missing')
requireTokens(r7Rule, ['SCOPE-ATTACHMENT-BODY-ABSENT', 'delivered: false', 'passed', '不得生成', 'PEND-001', 'not_covered'], 'R7 rule must preserve scope-only passed semantics')
// R7 反例：已知清单条目的正文未送达不得被提升为 conditional/PEND-001。
forbidText(r7Rule, '裁决为 `conditional`', 'R7 counterexample: a known manifest entry body must not become conditional')
requireTokens(r9Rule, ['权威正式附件清单', 'declared', 'conditional', 'FLG-ATTACHMENT-MANIFEST-INCOMPLETE', 'PEND-001', 'must_escalate: true', 'in_scope', '下游阶段范围不得缩减', 'not_covered', '受限断言', '不得当作已覆盖'], 'R9 rule must preserve the full conditional handoff contract')
requireText(r020a, '程序性组成文件的列举不等同正式附件清单', 'R-020A must preserve the procedural-document boundary')
requireTokens(intakeAction, ['rules.md#R-020A 的 R9', 'conditional', 'FLG-ATTACHMENT-MANIFEST-INCOMPLETE', 'PEND-001', 'must_escalate: true', 'in_scope', '下游阶段范围不得缩减', 'not_covered', '受限断言', '不得当作已覆盖'], 'run_intake_gate must preserve the R9 full conditional handoff contract')
requireTokens(intakeAction, ['R7', 'SCOPE-ATTACHMENT-BODY-ABSENT', '保持原裁决', '不得生成 PEND-001', '降级为 conditional'], 'run_intake_gate must preserve the R7 counterexample')
requireText(intakeAction, 'verdict=blocked 时后续 Agent 一律不得启动', 'run_intake_gate must use blocked for the stop branch')
// R9 正例只在 intake_verdict 节点验证，不能由 contract.yaml 的其他说明替代。
requireTokens(intakeVerdictNode, ['R9', 'conditional', 'FLG-ATTACHMENT-MANIFEST-INCOMPLETE', 'PEND-001', 'must_escalate', 'in_scope', '下游阶段范围不得缩减', 'not_covered', '受限断言', '不得当作已覆盖'], 'intake_verdict ontology node must preserve the R9 full handoff contract')
requireTokens(intakeVerdictNode, ['R7', 'SCOPE-ATTACHMENT-BODY-ABSENT', 'passed', '不得生成 PEND-001'], 'intake_verdict ontology node must preserve the R7 scope-only contract')
requireText(dc002, 'DC-002 对应 R7', 'DC-002 must treat the known manifest body gap as R7')
requireText(dc002, '它不改变 intake verdict，也不得生成 PEND-001', 'DC-002 must preserve the R7 verdict')
requireText(dc002, 'R9 才输出 FLG-ATTACHMENT-MANIFEST-INCOMPLETE 与 conditional', 'DC-002 must reserve conditional for R9')

if (failures.length) {
  console.error('✗ intake verdict contract drift:')
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}
console.log('✓ intake verdict contract agrees across shared rules, actions, and ontology')

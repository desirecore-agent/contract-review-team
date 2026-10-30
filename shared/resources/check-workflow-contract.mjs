#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'yaml'

export const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const ontologyRoot = join(repositoryRoot, 'shared', 'resources', 'business-ontology')

export const loadWorkflowDocuments = (root = ontologyRoot) => ({
  actions: parse(readFileSync(join(root, 'actions.yaml'), 'utf8')),
  contract: parse(readFileSync(join(root, 'contract.yaml'), 'utf8')),
  relations: parse(readFileSync(join(root, 'relations.yaml'), 'utf8')),
})

export const TERMINAL_RECORD_FIELDS = ['event_type', 'branch_id', 'invocation_id', 'outcome', 'receipt_ref', 'searched_scope', 'reason']
const TERMINAL_OUTCOMES = new Set(['success', 'failed', 'cancelled'])
export const validateTerminalRecord = (record, { expectedInvocationId, expectedBranchId } = {}) => {
  const errors = []
  if (record?.event_type !== 'branch_invocation_terminal') errors.push('event_type must be branch_invocation_terminal')
  if (!['jurisdiction-auditor', 'risk-scanner'].includes(record?.branch_id)) errors.push('branch_id must identify an O3 branch')
  if (typeof record?.invocation_id !== 'string' || !record.invocation_id.trim()) errors.push('invocation_id must be a non-empty string')
  if (!TERMINAL_OUTCOMES.has(record?.outcome)) errors.push('outcome must be success, failed, or cancelled')
  for (const field of ['receipt_ref', 'searched_scope', 'reason']) if (typeof record?.[field] !== 'string' || !record[field].trim()) errors.push(`${field} must be a non-empty string`)
  if (expectedInvocationId !== undefined && record?.invocation_id !== expectedInvocationId) errors.push('invocation_id must match the same invocation')
  if (expectedBranchId !== undefined && record?.branch_id !== expectedBranchId) errors.push('branch_id must match the settled branch')
  return errors
}

export const runnableWorkflowActions = ({ actions, completed = [], invocations = {}, terminalEvents = [] }) => {
  const done = new Set(completed)
  const eventFor = (node) => terminalEvents.some((event) =>
    validateTerminalRecord(event, { expectedInvocationId: invocations?.[node?.invocation_ref], expectedBranchId: node?.performed_by }).length === 0
    && (node?.terminal_outcomes ?? []).includes(event?.outcome))
  return (actions?.actions ?? []).filter((node) =>
    !done.has(node.id)
    && (node.depends_on ?? []).every((id) => done.has(id))
    && (!node.terminal_event || eventFor(node)))
    .map(({ id }) => id)
}

const sameMembers = (actual = [], expected) =>
  actual.length === expected.length && expected.every((value) => actual.includes(value))
const sameOrder = (actual = [], expected) =>
  actual.length === expected.length && expected.every((value, index) => actual[index] === value)

export const validateWorkflowContract = ({ actions, contract, relations }) => {
  const errors = []
  const fail = (condition, message) => { if (!condition) errors.push(message) }
  const actionList = actions?.actions ?? []
  const byId = new Map(actionList.map((action) => [action.id, action]))
  const phases = actions?.workflow_contract?.phases ?? {}
  const gates = actions?.human_gates ?? []
  const allowedPhases = new Set(['O0', 'O1', 'O2', 'O3', 'O4', 'O5', 'reconcile', 'post'])
  const phaseRank = { O0: 0, O1: 1, O2: 2, O3: 3, O4: 4, O5: 5, reconcile: 6, post: 7 }

  fail(actions?.meta?.ontology_version === 'onto-v2', 'actions ontology_version must be onto-v2')
  fail(contract?.meta?.ontology_version === 'onto-v2', 'contract ontology_version must be onto-v2')
  fail(relations?.meta?.ontology_version === 'onto-v2', 'relations ontology_version must be onto-v2')
  fail(actions?.meta?.actions_version === 'actions-v3', 'actions_version must be actions-v3')
  for (const [name, doc] of Object.entries({ actions, contract, relations })) {
    fail(doc?.meta?.updated_at === '2026-09-29', `${name} updated_at must be 2026-09-29`)
  }

  fail(actions?.policy?.action_ordering?.rule?.includes('stage 仅保留为 legacy'), 'numeric stage must be documented as legacy coverage, not call ordering')
  fail(sameOrder(actions?.workflow_contract?.phase_order, ['O0', 'O1', 'O2', 'O3', 'O4', 'O5', 'reconcile']), 'workflow phase_order must order O0..O5 then reconcile')
  fail(phases?.O0?.owner === 'contract-review-lead', 'O0 must be owned by contract-review-lead')
  fail(phases?.O1?.owner === 'contract-intake' && sameMembers(phases?.O1?.depends_on, ['O0']), 'O1 must depend on O0 and be owned by intake')
  fail(phases?.O2?.owner === 'clause-extractor' && sameMembers(phases?.O2?.depends_on, ['O1']), 'O2 must depend on O1 and be owned by extractor')
  fail(phases?.O3?.invocation === 'fan_out_parallel_isolated', 'O3 must be one isolated parallel fan-out')
  fail(sameMembers(phases?.O3?.owners, ['jurisdiction-auditor', 'risk-scanner']), 'O3 owners must be exactly jurisdiction and risk')
  fail(sameMembers(phases?.O3?.required_branches, ['jurisdiction-auditor', 'risk-scanner']), 'O3 must require exactly jurisdiction and risk branches')
  fail(phases?.O4?.owner === 'review-reporter' && sameMembers(phases?.O4?.depends_on, ['O3']), 'O4 must be a reporter call depending on O3')
  fail(phases?.O5?.owner === 'review-reporter' && sameMembers(phases?.O5?.depends_on, ['O4']), 'O5 must be a reporter call depending on O4')
  fail(phases?.O4?.call_id && phases?.O5?.call_id && phases.O4.call_id !== phases.O5.call_id, 'O4 and O5 must be distinct calls')
  fail(phases?.O5?.required_receipt === 'O4_independent_evidence_receipt', 'O5 must require the qualified O4 receipt')
  fail(actions?.workflow_contract?.hard_stops?.O1_blocked?.includes('不启动 O2/O3/O4/O5'), 'O1 blocked must stop every downstream phase')
  fail(phases?.reconcile?.owner === 'contract-review-lead' && sameMembers(phases?.reconcile?.depends_on, ['O5']), 'reconcile must be owned by lead and depend on O5')

  fail(byId.get('register_case')?.performed_by === 'contract-review-lead' && byId.get('register_case')?.phase === 'O0', 'register_case must belong to lead at O0')
  fail(byId.get('verify_candidate_evidence')?.phase === 'O4', 'an explicit O4 independent evidence action is required')
  fail(sameMembers(byId.get('verify_candidate_evidence')?.depends_on, ['collect_o3_branch_receipts']), 'O4 must depend on an O3 join ledger, not successful completion of every branch action')
  fail((byId.get('collect_o3_branch_receipts')?.outputs ?? []).includes('O3_branch_receipt_ledger'), 'O3 needs a join ledger preserving success or failure per branch')
  const join = byId.get('collect_o3_branch_receipts') ?? {}
  const receiptNodes = ['settle_jurisdiction_branch_receipt', 'settle_risk_branch_receipt']
  const invocationNodes = {
    settle_jurisdiction_branch_receipt: { id: 'invoke_jurisdiction_branch', ref: 'jurisdiction_branch_invocation.invocation_id' },
    settle_risk_branch_receipt: { id: 'invoke_risk_branch', ref: 'risk_branch_invocation.invocation_id' },
  }
  fail(sameMembers(join.depends_on, receiptNodes), 'O3 join must depend on both settled branch-receipt nodes before it may run')
  for (const nodeId of receiptNodes) {
    const node = byId.get(nodeId)
    fail(Boolean(node) && node.phase === 'O3' && ['jurisdiction-auditor', 'risk-scanner'].includes(node.performed_by), `${nodeId} must exist with an O3 branch owner`)
    fail(node?.terminal_requirement === 'settled' && sameMembers(node?.terminal_outcomes, ['success', 'failed', 'cancelled']), `${nodeId} must settle on success, failed, or cancelled rather than success only`)
    const { id: invokeId, ref: invocationRef } = invocationNodes[nodeId]
    const invoke = byId.get(invokeId)
    fail(invoke?.performed_by === 'contract-review-lead' && invoke?.phase === 'O3' && sameMembers(invoke?.depends_on, ['extract_clauses']), `${invokeId} must be a real O3 branch invocation after extraction`)
    fail(sameMembers(node?.depends_on, [invokeId]), `${nodeId} must depend on its real branch invocation, not extraction or business-action success`)
    fail(node?.invocation_ref === invocationRef, `${nodeId} must bind its terminal event to the invoked branch invocation_id`)
    fail(node?.terminal_event?.event_type === 'branch_invocation_terminal' && node?.terminal_event?.invocation_id_must_equal === node?.invocation_ref && sameMembers(node?.terminal_event?.required_fields, TERMINAL_RECORD_FIELDS), `${nodeId} terminal event must carry the unified typed terminal record and match invocation_id`)
  }
  fail(sameMembers(Object.keys(join.branch_inputs ?? {}), ['jurisdiction-auditor', 'risk-scanner']), 'O3 join must declare both branch inputs')
  fail(sameMembers(join?.output_schema?.O3_branch_receipt_ledger?.per_branch_required, TERMINAL_RECORD_FIELDS), 'O3 join ledger must use the unified terminal record per branch')
  fail(sameMembers(relations?.relations?.terminal_event_of?.required_fields, TERMINAL_RECORD_FIELDS), 'terminal_event_of must use the unified terminal record fields')
  const terminalFields = contract?.entities?.branch_terminal_record?.fields ?? {}
  fail(TERMINAL_RECORD_FIELDS.every((field) => terminalFields[field]?.required === true), 'contract must define every unified terminal record field as required')
  fail(byId.get('emit_final_report')?.phase === 'O5', 'emit_final_report must be an O5 action')
  fail(byId.get('emit_final_report')?.invocation_id !== byId.get('verify_candidate_evidence')?.invocation_id, 'O4 and O5 action invocation ids must differ')
  fail((byId.get('emit_final_report')?.preconditions ?? []).some((x) => String(x.check).includes('O4_independent_evidence_receipt')), 'emit_final_report must validate the O4 receipt')
  fail((byId.get('emit_final_report')?.outputs ?? []).includes('redline_docx_or_export_failure'), 'O5 must return a real DOCX or an explicit export failure')
  fail(byId.get('reconcile_delivery')?.performed_by === 'contract-review-lead' && byId.get('reconcile_delivery')?.phase === 'reconcile', 'lead must perform an explicit reconcile action')
  for (const gate of gates) fail(!(gate.blocks_action ?? []).includes('emit_final_report'), `${gate.gate_id} must not block emit_final_report`)
  fail(String(actions?.policy?.human_gate_semantics?.pending_effect).includes('不阻止报告'), 'pending Human Gates must not block report availability')
  fail(String(actions?.policy?.human_gate_semantics?.simulated_decision).includes('不得写入真人确认'), 'simulated approval must not count as human approval')

  for (const action of actionList) {
    fail(allowedPhases.has(action.phase), `${action.id} must declare a reasonable phase`)
    for (const dependency of action.depends_on ?? []) {
      const predecessor = byId.get(dependency)
      fail(Boolean(predecessor), `${action.id} depends on missing action ${dependency}`)
      if (predecessor && action.phase !== 'post') fail(phaseRank[predecessor.phase] <= phaseRank[action.phase], `${action.id} has a backward dependency on ${dependency}`)
    }
  }
  const visiting = new Set()
  const visited = new Set()
  const hasCycle = (id) => {
    if (visiting.has(id)) return true
    if (visited.has(id)) return false
    visiting.add(id)
    for (const dependency of byId.get(id)?.depends_on ?? []) if (byId.has(dependency) && hasCycle(dependency)) return true
    visiting.delete(id); visited.add(id); return false
  }
  fail(!actionList.some((item) => hasCycle(item.id)), 'workflow action dependencies must be acyclic')

  const direction = contract?.enums?.risk_direction?.values ?? {}
  fail(sameMembers(Object.keys(direction), ['up', 'down', 'flat', 'undetermined']), 'risk_direction must be exactly up/down/flat/undetermined')
  fail(contract?.enums?.comparison_applicability?.values?.not_applicable, 'single-version applicability must support not_applicable')
  const comparisonRules = String(byId.get('compare_versions')?.output_constraints)
  fail((byId.get('compare_versions')?.outputs ?? []).includes('comparison_applicability') && comparisonRules.includes('not_applicable') && comparisonRules.includes('省略 risk_direction') && comparisonRules.includes('applicable 且 risk_direction = undetermined'), 'compare_versions must omit direction for not_applicable and reserve undetermined for a requested but insufficient comparison')
  fail(String(contract?.invariants?.find((x) => x.id === 'INV-010')?.statement).includes('not_applicable 并省略 risk_direction'), 'INV-010 must omit direction for single-version not_applicable')
  const party = contract?.entities?.party?.fields ?? {}
  fail(party?.identifier_applicability?.required === true && contract?.enums?.identifier_applicability?.values?.required && contract?.enums?.identifier_applicability?.values?.not_applicable && contract?.enums?.identifier_applicability?.values?.unknown, 'party identifier applicability must be required|not_applicable|unknown')
  const objectRef = contract?.types?.object_ref?.fields ?? {}
  fail(objectRef?.content_digest?.description?.includes('完整 64 位'), 'content_digest must require a full SHA-256')
  fail(sameMembers(objectRef?.digest_state?.enum, ['verified', 'frozen_without_digest']), 'digest_state must permit frozen_without_digest')
  fail(objectRef?.canonical_absolute_path?.required === true && objectRef?.case_id?.required === true, 'digest identity must bind case and canonical absolute path')
  const coverage = Object.keys(contract?.enums?.coverage_status?.values ?? {})
  fail(sameMembers(coverage, ['covered', 'blank', 'blocked', 'deferred', 'unknown', 'not_applicable']), 'coverage status vocabulary is incomplete')
  fail(String(contract?.invariants?.find((x) => x.id === 'INV-008')?.statement).includes('不得要求 foreign pack'), 'INV-008 must preserve CN-only service scope without foreign packs')
  const clues = contract?.entities?.contract_document?.fields?.jurisdiction_clues?.fields ?? {}
  fail(clues.signing_places?.required === true && clues.legislation_referenced?.required === true && clues.governing_law_declared?.required === true && clues.dispute_forum_declared?.required === true, 'all four jurisdiction trigger fields must be required')
  fail(String(contract?.invariants?.find((x) => x.id === 'INV-004')?.statement).includes('negotiation_draft'), 'INV-004 must encode the explicit draft-only signature exception')
  fail(String(contract?.invariants?.find((x) => x.id === 'INV-002')?.statement).includes('即阻断'), 'INV-002 must block every exhibit_referenced_only object')
  fail(String(relations?.derived_checks?.find((x) => x.id === 'DC-006')?.description).includes('未读适用专业包前不得断定'), 'DC-006 must treat multiple declarations as clues until a professional pack is read')
  fail(String(relations?.derived_checks?.find((x) => x.id === 'DC-002')?.description).includes('delivered = false'), 'DC-002 must model R7 as delivered=false scope fact')
  fail((relations?.relations?.has_attachment?.required_fields ?? []).includes('delivered'), 'R7 delivered must be required on has_attachment edges')
  const confirmations = contract?.entities?.receipt?.fields?.human_confirmations?.fields ?? {}
  for (const field of ['gate_id', 'confirmed_by', 'confirmed_at', 'decision', 'decision_source']) {
    fail(confirmations[field]?.required === true, `human confirmation ${field} must be required`)
  }
  fail(sameMembers(confirmations?.decision_source?.enum, ['authorized_human', 'pending_no_decision']), 'human confirmation source must distinguish authorized humans from pending')
  const confirmationRules = contract?.entities?.receipt?.fields?.human_confirmations?.conditional_constraints ?? []
  fail(confirmationRules.length >= 3, 'Human Gate decisions must conditionally bind source, identity and timestamp')
  const coverageRules = contract?.entities?.coverage_matrix_row?.conditional_constraints ?? []
  fail(coverageRules.length >= 4, 'coverage states must conditionally require receipts, reasons and search scope')
  return errors
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let documents
  try {
    documents = loadWorkflowDocuments()
    console.log('✓ parsed YAML: actions.yaml, contract.yaml, relations.yaml')
  } catch (error) {
    console.error(`✗ workflow YAML parse failed: ${error.message}`)
    process.exit(1)
  }
  const errors = validateWorkflowContract(documents)
  if (errors.length) {
    console.error('✗ workflow contract drift:')
    for (const error of errors) console.error(`  - ${error}`)
    process.exit(1)
  }
  console.log('✓ workflow contract: O0→O5 dependencies, Human Gates, evidence, scope and digest semantics agree')
}

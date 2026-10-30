import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parse, stringify } from 'yaml'
import { loadWorkflowDocuments, runnableWorkflowActions, validateTerminalRecord, validateWorkflowContract } from '../check-workflow-contract.mjs'

const baseline = () => parse(stringify(loadWorkflowDocuments()))
const rejected = (mutate, pattern) => {
  const documents = baseline()
  mutate(documents)
  const errors = validateWorkflowContract(documents)
  assert.ok(errors.some((error) => pattern.test(error)), `expected ${pattern}; got:\n${errors.join('\n')}`)
}
const action = (documents, id) => documents.actions.actions.find((item) => item.id === id)

test('the normative parsed YAML workflow contract passes', () => {
  assert.deepEqual(validateWorkflowContract(baseline()), [])
})

test('rejects a Human Gate that blocks report delivery', () => rejected(
  (x) => x.actions.human_gates[0].blocks_action.push('emit_final_report'),
  /HG-01 must not block emit_final_report/,
))

test('rejects O3 without both parallel isolated branches', () => rejected(
  (x) => { x.actions.workflow_contract.phases.O3.required_branches = ['risk-scanner'] },
  /O3 must require exactly jurisdiction and risk branches/,
))

test('rejects O3 whose declared owners diverge from its branches', () => rejected(
  (x) => { x.actions.workflow_contract.phases.O3.owners = ['risk-scanner', 'review-reporter'] },
  /O3 owners must be exactly jurisdiction and risk/,
))

test('rejects merged O4 and O5 reporter calls', () => rejected(
  (x) => { x.actions.workflow_contract.phases.O5.call_id = x.actions.workflow_contract.phases.O4.call_id },
  /O4 and O5 must be distinct calls/,
))

test('rejects O5 without a qualified O4 receipt', () => rejected(
  (x) => { delete x.actions.workflow_contract.phases.O5.required_receipt },
  /O5 must require the qualified O4 receipt/,
))

test('rejects O4 hard-depending on every successful O3 subaction', () => rejected(
  (x) => { action(x, 'verify_candidate_evidence').depends_on = ['load_jurisdiction_packs', 'assess_missing_clauses'] },
  /O4 must depend on an O3 join ledger/,
))

test('rejects an O3 join ledger without auditable branch fields', () => rejected(
  (x) => { action(x, 'collect_o3_branch_receipts').output_schema.O3_branch_receipt_ledger.per_branch_required = ['branch_id', 'outcome'] },
  /join ledger must use the unified terminal record/,
))

test('rejects an O3 join missing either settled receipt dependency', () => rejected(
  (x) => { action(x, 'collect_o3_branch_receipts').depends_on = ['settle_risk_branch_receipt'] },
  /depend on both settled branch-receipt nodes/,
))

test('rejects a branch receipt that settles on success only', () => rejected(
  (x) => { action(x, 'settle_risk_branch_receipt').terminal_outcomes = ['success'] },
  /success, failed, or cancelled/,
))

test('rejects a branch-receipt dependency cycle', () => rejected(
  (x) => { action(x, 'settle_risk_branch_receipt').depends_on = ['collect_o3_branch_receipts'] },
  /dependencies must be acyclic/,
))

test('rejects an early join that depends only on extraction', () => rejected(
  (x) => { action(x, 'collect_o3_branch_receipts').depends_on = ['extract_clauses'] },
  /depend on both settled branch-receipt nodes/,
))

test('event-level join cannot run before both matching branch invocation terminal events', () => {
  const documents = baseline()
  const completed = ['extract_clauses', 'invoke_jurisdiction_branch', 'invoke_risk_branch']
  const invocations = {
    'jurisdiction_branch_invocation.invocation_id': 'inv-j-1',
    'risk_branch_invocation.invocation_id': 'inv-r-1',
  }
  assert.deepEqual(runnableWorkflowActions({ actions: documents.actions, completed, invocations, terminalEvents: [] }).filter((id) => id.startsWith('settle_') || id === 'collect_o3_branch_receipts'), [])

  const jurisdictionTerminal = { event_type: 'branch_invocation_terminal', branch_id: 'jurisdiction-auditor', invocation_id: 'inv-j-1', outcome: 'failed', receipt_ref: 'receipt:j', searched_scope: 'jurisdiction branch', reason: 'bounded failure' }
  assert.deepEqual(runnableWorkflowActions({ actions: documents.actions, completed, invocations, terminalEvents: [jurisdictionTerminal] }).filter((id) => id.startsWith('settle_')), ['settle_jurisdiction_branch_receipt'])

  const afterOneSettle = [...completed, 'settle_jurisdiction_branch_receipt']
  assert.equal(runnableWorkflowActions({ actions: documents.actions, completed: afterOneSettle, invocations, terminalEvents: [jurisdictionTerminal] }).includes('collect_o3_branch_receipts'), false)

  const wrongRiskTerminal = { ...jurisdictionTerminal, branch_id: 'risk-scanner', invocation_id: 'inv-r-wrong', outcome: 'cancelled', receipt_ref: 'receipt:r' }
  assert.equal(runnableWorkflowActions({ actions: documents.actions, completed: afterOneSettle, invocations, terminalEvents: [jurisdictionTerminal, wrongRiskTerminal] }).includes('settle_risk_branch_receipt'), false)

  const riskTerminal = { ...wrongRiskTerminal, invocation_id: 'inv-r-1' }
  assert.equal(runnableWorkflowActions({ actions: documents.actions, completed: afterOneSettle, invocations, terminalEvents: [jurisdictionTerminal, riskTerminal] }).includes('settle_risk_branch_receipt'), true)
  const bothSettled = [...afterOneSettle, 'settle_risk_branch_receipt']
  assert.equal(runnableWorkflowActions({ actions: documents.actions, completed: bothSettled, invocations, terminalEvents: [jurisdictionTerminal, riskTerminal] }).includes('collect_o3_branch_receipts'), true)
})

test('success, failed and cancelled use one typed terminal-record validator', () => {
  for (const outcome of ['success', 'failed', 'cancelled']) {
    const record={event_type:'branch_invocation_terminal',branch_id:'risk-scanner',invocation_id:'inv-r-1',outcome,receipt_ref:`receipt:${outcome}`,searched_scope:'risk branch fixed list',reason:outcome==='success'?'completed bounded batch':'branch debt retained'}
    assert.deepEqual(validateTerminalRecord(record,{expectedInvocationId:'inv-r-1',expectedBranchId:'risk-scanner'}),[])
  }
})

test('terminal-record validator rejects wrong field types and cross-invocation reuse', () => {
  const record={event_type:'branch_invocation_terminal',branch_id:'risk-scanner',invocation_id:7,outcome:'failed',receipt_ref:'',searched_scope:['risk'],reason:'debt'}
  assert.match(validateTerminalRecord(record,{expectedInvocationId:'inv-r-1',expectedBranchId:'risk-scanner'}).join('\n'),/invocation_id must be a non-empty string[\s\S]*receipt_ref[\s\S]*searched_scope[\s\S]*same invocation/)
})

test('rejects settle nodes wired directly to extraction instead of invocation', () => rejected(
  (x) => { action(x, 'settle_risk_branch_receipt').depends_on = ['extract_clauses'] },
  /must depend on its real branch invocation/,
))

test('rejects terminal event binding to a different invocation id', () => rejected(
  (x) => { action(x, 'settle_jurisdiction_branch_receipt').terminal_event.invocation_id_must_equal = 'other.invocation_id' },
  /terminal event must carry the unified typed terminal record and match invocation_id/,
))

test('rejects an illegal risk direction', () => rejected(
  (x) => { x.contract.enums.risk_direction.values.sideways = 'illegal' },
  /risk_direction must be exactly/,
))

test('rejects restoring a mandatory direction for single-version not_applicable', () => rejected(
  (x) => { action(x, 'compare_versions').output_constraints[3] = '单版本 comparison_applicability = not_applicable 且 risk_direction = undetermined' },
  /omit direction for not_applicable/,
))

test('rejects party identity without role applicability', () => rejected(
  (x) => { delete x.contract.entities.party.fields.identifier_applicability },
  /identifier applicability must be required/,
))

test('rejects truncated digest semantics', () => rejected(
  (x) => { x.contract.types.object_ref.fields.content_digest.description = 'SHA-256 前 16 位即可' },
  /full SHA-256/,
))

test('rejects digest identity without canonical path binding', () => rejected(
  (x) => { delete x.contract.types.object_ref.fields.canonical_absolute_path },
  /digest identity must bind case and canonical absolute path/,
))

test('rejects foreign-pack requirements outside CN service scope', () => rejected(
  (x) => { x.contract.invariants.find((item) => item.id === 'INV-008').statement = '全部法域线索必须加载对应 foreign pack' },
  /CN-only service scope/,
))

test('rejects jurisdiction scope without signing-place clues', () => rejected(
  (x) => { delete x.contract.entities.contract_document.fields.jurisdiction_clues.fields.signing_places.required },
  /all four jurisdiction trigger fields must be required/,
))

test('rejects legal conflict conclusions based only on multiple declarations', () => rejected(
  (x) => { x.relations.derived_checks.find((item) => item.id === 'DC-006').description = '存在两条 governed_by 即认定法律冲突' },
  /multiple declarations as clues/,
))

test('rejects optional R7 delivered state', () => rejected(
  (x) => { x.relations.relations.has_attachment.required_fields = ['evidence'] },
  /R7 delivered must be required/,
))

test('rejects optional or provenance-free Human Gate decisions', () => rejected(
  (x) => { delete x.contract.entities.receipt.fields.human_confirmations.fields.decision_source.required },
  /human confirmation decision_source must be required/,
))

test('rejects Human Gate provenance without decision-source coupling', () => rejected(
  (x) => { x.contract.entities.receipt.fields.human_confirmations.conditional_constraints = [] },
  /conditionally bind source, identity and timestamp/,
))

test('rejects coverage states without conditional evidence requirements', () => rejected(
  (x) => { x.contract.entities.coverage_matrix_row.conditional_constraints = [] },
  /conditionally require receipts, reasons and search scope/,
))

test('rejects actions with missing or backward phases', () => rejected(
  (x) => { action(x, 'emit_final_report').phase = 'O2' },
  /backward dependency/,
))

test('rejects an action with no phase', () => rejected(
  (x) => { delete action(x, 'benchmark_against_market').phase },
  /benchmark_against_market must declare a reasonable phase/,
))

test('rejects numeric-stage ordering replacing the phase contract', () => rejected(
  (x) => { x.actions.policy.action_ordering.rule = '按 stage 数字顺序调用' },
  /numeric stage/,
))

test('rejects reordered workflow phases', () => rejected(
  (x) => { [x.actions.workflow_contract.phase_order[3], x.actions.workflow_contract.phase_order[4]] = [x.actions.workflow_contract.phase_order[4], x.actions.workflow_contract.phase_order[3]] },
  /phase_order must order/,
))

test('rejects register_case reassigned from lead', () => rejected(
  (x) => { action(x, 'register_case').performed_by = 'contract-intake' },
  /register_case must belong to lead/,
))

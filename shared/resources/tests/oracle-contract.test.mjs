import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parse, stringify } from 'yaml'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { evaluateOracleOutput, loadOracle, loadSourceBindings, validateOracle, repositoryRoot } from '../check-oracle-contract.mjs'

const baseDir = join(repositoryRoot, 'testdata', 'contracts')
const baseline = () => parse(stringify(loadOracle()))
const requiredDetections = (oracle, caseId) => oracle.normative.cases[caseId].must_detect.filter((target) => target.required).map((target) => target.id)
const rejected = (mutate, pattern) => {
  const value = baseline()
  mutate(value)
  const errors = validateOracle(value, { baseDir })
  assert.ok(errors.some((error) => pattern.test(error)), `expected ${pattern}; got:\n${errors.join('\n')}`)
}

test('the real normative oracle and frozen bindings pass', () => assert.deepEqual(validateOracle(baseline(), { baseDir }), []))
test('the parsed historical oracle remains value-for-value frozen', () => {
  assert.equal(createHash('sha256').update(JSON.stringify(baseline().history)).digest('hex'), '1a17baa686385ee250e874b45a19696651cb797b889ccd400be0158b5a4e8cc6')
})
test('all 12 source digests remain byte-accurate', () => {
  const oracle = baseline()
  assert.equal(Object.keys(oracle.normative.cases).length, 12)
  assert.deepEqual(validateOracle(oracle, { baseDir }).filter((error) => /source\.sha256/.test(error)), [])
})
test('49 legacy scope changes are isolated in explicitly non-normative provenance', () => {
  const oracle = baseline()
  assert.equal(oracle.normative.history_target_dispositions, undefined)
  assert.equal(oracle.provenance.normative, false)
  assert.equal(Object.keys(oracle.provenance.history_target_dispositions).length, 49)
})
test('rejects a normative legacy-disposition backdoor', () => rejected((x) => { x.normative.history_target_dispositions = {} }, /forbidden in normative/))
test('rejects a missing scope-change target', () => rejected((x) => { x.provenance.history_target_dispositions['C04:must_detect:non-compete-term-excessive'].targets[0].id = 'missing' }, /target must_detect:missing.*exactly once/))
test('rejects a scope-change mapping without audit rationale', () => rejected((x) => { delete x.provenance.history_target_dispositions['C05:must_detect:governing-law-conflict'].reason }, /scope_change requires identity/))
test('rejects a missing R case with coverage diagnosis', () => rejected((x) => { delete x.normative.cases.R03 }, /exactly cover.*R03/))
test('rejects an incorrect input digest', () => rejected((x) => { x.normative.cases.C01.source.sha256 = '0'.repeat(64) }, /sha256.*does not match/))
test('rejects a fabricated literal quote', () => rejected((x) => { x.normative.cases.R01.evidence[0].quote += '伪引文' }, /literal quote is not an exact substring/))
test('rejects historical observations in normative cases', () => rejected((x) => { x.normative.cases.R02.measured_baseline = {} }, /historical field measured_baseline/))
test('rejects a foreign pack remedy', () => rejected((x) => { x.normative.cases.C07.service_scope.remedy = '配置 jurisdiction-sg 法域包' }, /foreign-law pack/))
test('rejects missing requiredness on a new current target', () => rejected((x) => { x.normative.cases.C01.must_detect.push({ id: 'new-current-target', evidence_ref: 'c01-total' }) }, /new-current-target.*missing frozen source assertion binding|required.*explicitly/))
test('rejects optional current targets without a reason', () => rejected((x) => { delete x.normative.cases.C01.must_detect[0].optional_reason }, /optional_reason/))
test('rejects duplicate IDs within a collection', () => rejected((x) => { x.normative.cases.C03.must_detect.push({ ...x.normative.cases.C03.must_detect[0] }) }, /duplicate or cross-polarity/))
test('rejects the same ID across positive and negative collections', () => rejected((x) => { x.normative.cases.C01.must_detect.push({ id: 'placeholder-unfilled', required: true, evidence_ref: 'c01-signature' }) }, /duplicate or cross-polarity/))
test('rejects grace evidence swapped to audit evidence', () => rejected((x) => { x.normative.cases.C01.must_not_flag.find((v) => v.id === 'grace-period-present').evidence_ref = 'c01-audit' }, /exact evidence binding changed/))
test('rejects liability evidence swapped to amount evidence', () => rejected((x) => { x.normative.cases.C01.must_not_flag.find((v) => v.id === 'liability-cap-missing').evidence_ref = 'c01-total' }, /exact evidence binding changed/))
test('rejects crossing R01 attachment and party-name evidence', () => rejected((x) => {
  const a=x.normative.cases.R01.must_not_flag.find((v)=>v.id==='attachment-missing')
  const p=x.normative.cases.R01.must_not_flag.find((v)=>v.id==='party-name-inconsistency')
  ;[a.evidence_ref,p.evidence_ref]=[p.evidence_ref,a.evidence_ref]
}, /exact evidence binding changed/))
test('rejects changing a frozen negative-search pattern', () => rejected((x) => { x.normative.cases.C07.negative_searches[0].patterns = ['unrelated'] }, /frozen assertion/))
test('rejects deleting either R01 false-positive prohibition', () => rejected((x) => { x.normative.cases.R01.must_not_flag=x.normative.cases.R01.must_not_flag.filter((v)=>v.id!=='attachment-missing') }, /attachment-missing.*exactly once|binding has no current/))

for (const [label, output, pattern] of [
  ['missing output', undefined, /plain object/],
  ['null output', null, /plain object/],
  ['missing detected_ids', {}, /detected_ids is required/],
  ['null detected_ids', { detected_ids: null }, /must be an array/],
  ['numeric detected_ids', { detected_ids: 42 }, /must be an array/],
  ['object detected_ids', { detected_ids: {} }, /must be an array/],
  ['single string detected_ids', { detected_ids: 'amount-in-words-mismatch' }, /must be an array/],
  ['null array element', { detected_ids: [null] }, /trimmed string/],
  ['numeric array element', { detected_ids: [42] }, /trimmed string/],
  ['blank ID', { detected_ids: [''] }, /trimmed string/],
  ['whitespace ID', { detected_ids: [' grace-period-present '] }, /trimmed string/],
  ['duplicate ID', { detected_ids: ['amount-arithmetic-mismatch','amount-arithmetic-mismatch'] }, /duplicate ID/],
  ['unknown detected ID', { detected_ids: ['unknown-id'] }, /unknown detected ID/],
]) test(`evaluator fails closed for ${label} without throwing`, () => {
  const result = evaluateOracleOutput(baseline(), 'C01', output)
  assert.equal(result.pass, false)
  assert.match(result.errors.join('\n'), pattern)
})

test('the exact independently reviewable source-binding values remain frozen', () => {
  assert.equal(createHash('sha256').update(JSON.stringify(loadSourceBindings())).digest('hex'),
    '47a07dbb1a2e7f3554fa72940ed8e3d0ff535a5d8e3b8e7bbd62b1f387458f85')
})

test('rejects erased assertions even when the target keeps its evidence refs', () => {
  const bindings = structuredClone(loadSourceBindings())
  bindings.cases.C01.targets['must_not_flag:placeholder-unfilled'].assertions = []
  assert.ok(validateOracle(baseline(), {baseDir, sourceBindings:bindings}).some((error) => /assertion|digest/.test(error)))
})

test('rejects coordinated oracle and binding substitution with unrelated existing evidence', () => {
  const oracle = baseline(), bindings = structuredClone(loadSourceBindings())
  const target = oracle.normative.cases.C01.must_not_flag.find((item) => item.id === 'grace-period-present')
  target.evidence_ref = 'c01-audit'
  const audit = oracle.normative.cases.C01.evidence.find((item) => item.id === 'c01-audit')
  bindings.cases.C01.targets['must_not_flag:grace-period-present'] = {required:true, refs:['c01-audit'],
    assertions:[{ref:'c01-audit',kind:'literal',quote:audit.quote,source_case:'C01'}]}
  assert.ok(validateOracle(oracle, {baseDir, sourceBindings:bindings}).some((error) => /digest/.test(error)))
})

test('rejects duplicate or substituted assertions even with the expected array length', () => {
  for (const mutate of [
    (target) => { target.assertions[0].ref = 'c01-audit' },
    (target) => { target.refs.push(target.refs[0]); target.assertions.push(target.assertions[0]) },
    (target) => { target.assertions[0] = null },
  ]) {
    const bindings = structuredClone(loadSourceBindings())
    mutate(bindings.cases.C01.targets['must_not_flag:placeholder-unfilled'])
    const errors = validateOracle(baseline(), {baseDir, sourceBindings:bindings})
    assert.ok(errors.some((error) => /exactly one complete assertion/.test(error)))
  }
})

test('placeholder dollar-X negative searches match literal dollar-X, not an end anchor', () => {
  const oracle = baseline()
  for (const [id, searchId] of [['C01','c01-no-placeholder'], ['R02','r02-no-unfilled-placeholder'], ['R03','r03-no-unfilled-placeholder']]) {
    const patterns = oracle.normative.cases[id].negative_searches.find((item) => item.id === searchId).patterns
    assert.ok(patterns.some((pattern) => new RegExp(pattern, 'u').test('price $X')), id)
  }
})

test('unknown observations must be explicitly unassessed and still require manual classification', () => {
  const result = evaluateOracleOutput(baseline(), 'C01', { detected_ids: [], unassessed_ids: ['new-observation'] })
  assert.equal(result.pass, false)
  assert.deepEqual(result.unassessed, ['new-observation'])
  assert.match(result.errors.join('\n'), /manual classification/)
})
test('unknown observation cannot hide among detected IDs', () => {
  const result = evaluateOracleOutput(baseline(), 'C01', { detected_ids: ['new-observation'], unassessed_ids: [] })
  assert.equal(result.pass, false)
  assert.match(result.errors.join('\n'), /unknown detected ID/)
})
test('optional C01 arithmetic observation is independent from forbidden wording mismatch', () => {
  const oracle=baseline()
  assert.equal(evaluateOracleOutput(oracle,'C01',{detected_ids:[]}).pass,true)
  assert.equal(evaluateOracleOutput(oracle,'C01',{detected_ids:['amount-arithmetic-mismatch']}).pass,true)
  assert.deepEqual(evaluateOracleOutput(oracle,'C01',{detected_ids:['amount-in-words-mismatch']}).forbidden,['amount-in-words-mismatch'])
})
test('C04 passes on required source facts and old legal-effect labels cannot substitute', () => {
  const oracle=baseline(), facts=requiredDetections(oracle,'C04')
  assert.deepEqual(facts.sort(),['five-year-non-compete-text','no-economic-compensation-text','twelve-month-probation-text'].sort())
  assert.equal(evaluateOracleOutput(oracle,'C04',{detected_ids:facts}).pass,true)
  const old=['non-compete-term-excessive','non-compete-without-compensation','probation-exceeds-statutory-limit']
  assert.equal(evaluateOracleOutput(oracle,'C04',{detected_ids:old}).pass,false)
})
test('C05 and C07 require actual out-of-scope referral, not a missing-pack label', () => {
  const oracle=baseline()
  for(const id of ['C05','C07']){
    const facts=requiredDetections(oracle,id)
    assert.ok(facts.includes('professional-referral'))
    assert.equal(evaluateOracleOutput(oracle,id,{detected_ids:facts}).pass,true)
    assert.equal(evaluateOracleOutput(oracle,id,{detected_ids:['jurisdiction-rulepack-unavailable']}).pass,false)
  }
})
test('R01/R02/R03 executable requirements are source facts and professional-review boundaries', () => {
  const oracle=baseline()
  for(const id of ['R01','R02','R03']) assert.equal(evaluateOracleOutput(oracle,id,{detected_ids:requiredDetections(oracle,id)}).pass,true)
  assert.ok(requiredDetections(oracle,'R01').includes('old-contract-law-name-text'))
  assert.ok(requiredDetections(oracle,'R02').includes('arbitration-institution-unspecified-text'))
  assert.ok(requiredDetections(oracle,'R03').includes('contract-date-2019'))
})
test('R01 keeps both source-grounded prohibitions', () => {
  const ids=baseline().normative.cases.R01.must_not_flag.map((target)=>target.id)
  assert.ok(ids.includes('attachment-missing'))
  assert.ok(ids.includes('party-name-inconsistency'))
})

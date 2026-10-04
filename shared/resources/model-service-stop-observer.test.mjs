import { test } from 'node:test'
import assert from 'node:assert/strict'
import { collectToolIntents, readDecisionReceipt } from './model-service-stop-observer.mjs'

const decision = () => ({ verdict: 'blocked', handoff: { to: null }, capability_debt: ['Service unavailable'], findings: [], score: null, artifacts: [], explanation: 'Review service is unavailable.' })
const nativeReceipt = data => ({ function: { name: 'mcp__desirecore__RecordGateDecision', arguments: JSON.stringify(data) } })

test('a native observer receipt cannot hide an XML business intent', () => {
  const collected = collectToolIntents({ tool_calls: [nativeReceipt(decision())], content: '<tool_call><function=mcp__desirecore__Delegate><parameter=task>review</parameter></function></tool_call>' })
  assert.equal(collected.encoding, 'mixed')
  assert.equal(readDecisionReceipt(collected.calls).businessCalls.length, 1)
})

test('valid native and XML observer receipts preserve stop values', () => {
  assert.equal(readDecisionReceipt(collectToolIntents({ tool_calls: [nativeReceipt(decision())] }).calls).decision.handoff.to, null)
  const xml = '<tool_call><function=mcp__desirecore__RecordGateDecision>' + Object.entries(decision()).map(([key, value]) => `<parameter=${key}>${JSON.stringify(value)}</parameter>`).join('') + '</function></tool_call>'
  assert.equal(readDecisionReceipt(collectToolIntents({ content: xml }).calls).decision.verdict, 'blocked')
})

test('capability debt must be a non-empty array of non-blank strings', () => {
  for (const invalid of ['["missing" + "route"]', [], [''], [1], [{}], null]) {
    assert.throws(() => readDecisionReceipt([nativeReceipt({ ...decision(), capability_debt: invalid })]))
  }
})

test('malformed structured XML and incomplete business intents fail closed', () => {
  assert.throws(() => collectToolIntents({ content: '<function=mcp__desirecore__RecordGateDecision><parameter=capability_debt>["a" + "b"]</parameter></function>' }))
  assert.throws(() => collectToolIntents({ tool_calls: [nativeReceipt(decision())], content: '<function=mcp__desirecore__Write>' }))
})

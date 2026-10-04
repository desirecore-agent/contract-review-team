import { parseDocument } from 'yaml'

function parseUniqueJSON(source) {
  const document = parseDocument(source, { uniqueKeys: true })
  if (document.errors.length) throw new Error('Invalid JSON or duplicate object key')
  return JSON.parse(source)
}

const observerName = 'mcp__desirecore__RecordGateDecision'

export function collectToolIntents(message) {
  const native = message.tool_calls ?? []
  const text = typeof message.content === 'string' ? message.content : ''
  const openings = [...text.matchAll(/<function=([^>]+)>/g)]
  const complete = [...text.matchAll(/<function=([^>]+)>([\s\S]*?)<\/function>/g)]
  if (openings.length !== complete.length) throw new Error('Incomplete textual tool intent')
  const wrappers = [...text.matchAll(/<tool_call>([\s\S]*?)<\/tool_call>/g)]
  if ((text.match(/<tool_call>/g) ?? []).length !== wrappers.length) throw new Error('Incomplete tool-call wrapper')
  for (const wrapper of wrappers) {
    if (!/^\s*<function=[^>]+>[\s\S]*<\/function>\s*$/.test(wrapper[1]) || [...wrapper[1].matchAll(/<function=/g)].length !== 1) throw new Error('Tool-call wrapper must contain exactly one function')
    const body = wrapper[1].replace(/^\s*<function=[^>]+>/, '').replace(/<\/function>\s*$/, '')
    if (body.replace(/<parameter=[^>]+>[\s\S]*?<\/parameter>/g, '').trim()) throw new Error('Unexpected prose in function body')
  }
  if (wrappers.length !== complete.length) throw new Error('Unwrapped textual function')
  const prose = text.replace(/<tool_call>[\s\S]*?<\/tool_call>/g, '').trim()
  if (prose) throw new Error('Assistant prose outside the structured observer is not accepted')
  const xml = complete.map(match => {
    const params = {}
    for (const part of match[2].matchAll(/<parameter=([^>]+)>([\s\S]*?)<\/parameter>/g)) {
      if (Object.hasOwn(params, part[1])) throw new Error('Duplicate XML parameter')
      const value = part[2].trim()
      try { params[part[1]] = parseUniqueJSON(value) } catch {
        if (match[1] === observerName && !['verdict'].includes(part[1])) throw new Error('Malformed structured observer parameter')
        params[part[1]] = value
      }
    }
    return { function: { name: match[1], arguments: JSON.stringify(params) } }
  })
  return { calls: [...native, ...xml], encoding: native.length && xml.length ? 'mixed' : xml.length ? 'textual-xml-intent' : 'native-tool-calls' }
}

export function readDecisionReceipt(calls) {
  const receipts = calls.filter(call => call.function?.name === observerName)
  const businessCalls = calls.filter(call => call.function?.name !== observerName)
  if (receipts.length !== 1) throw new Error('Expected exactly one observer receipt')
  const decision = parseUniqueJSON(receipts[0].function.arguments)
  const keys = ['verdict', 'handoff', 'failedPrerequisites', 'capability_debt', 'findings', 'score', 'artifacts', 'execution']
  if (Object.keys(decision).some(key => !keys.includes(key)) || keys.some(key => !(key in decision))) throw new Error('Unexpected observer receipt shape')
  if (!['passed', 'conditional', 'blocked'].includes(decision.verdict)) throw new Error('Invalid verdict')
  if (!decision.handoff || typeof decision.handoff !== 'object' || Array.isArray(decision.handoff)) throw new Error('Invalid handoff')
  if (Object.keys(decision.handoff).some(key => !['to', 'from'].includes(key)) || !('to' in decision.handoff) || !(decision.handoff.to === null || decision.handoff.to === 'contract-intake') || ('from' in decision.handoff && decision.handoff.from !== 'contract-review-lead')) throw new Error('Invalid handoff fields')
  const prerequisiteFields = ['route', 'serviceAvailable', 'processingAuthorized', 'termsAndLicenseConfirmed', 'costAuthorized']
  if (!Array.isArray(decision.failedPrerequisites) || (decision.verdict === 'blocked' && !decision.failedPrerequisites.length) || decision.failedPrerequisites.some(value => !prerequisiteFields.includes(value)) || new Set(decision.failedPrerequisites).size !== decision.failedPrerequisites.length) throw new Error('Invalid failed prerequisites')
  if (!Array.isArray(decision.capability_debt) || (decision.verdict === 'blocked' && !decision.capability_debt.length) || decision.capability_debt.some(value => !prerequisiteFields.includes(value)) || new Set(decision.capability_debt).size !== decision.capability_debt.length || decision.capability_debt.length !== decision.failedPrerequisites.length || decision.capability_debt.some(value => !decision.failedPrerequisites.includes(value))) throw new Error('Invalid capability debt')
  if (!Array.isArray(decision.findings) || decision.findings.some(value => !value || typeof value !== 'object' || Array.isArray(value))) throw new Error('Invalid findings')
  if (!(decision.score === null || typeof decision.score === 'number') || !Array.isArray(decision.artifacts) || decision.artifacts.some(value => typeof value !== 'string')) throw new Error('Invalid observer result fields')
  const expectedExecution = { controlRequestTransmitted: true, additionalBusinessCalls: 0, reviewPerformed: false, scoreProduced: false, docxProduced: false }
  if (!decision.execution || typeof decision.execution !== 'object' || Array.isArray(decision.execution) || Object.keys(decision.execution).length !== 5 || Object.entries(expectedExecution).some(([key, value]) => decision.execution[key] !== value)) throw new Error('Contradictory execution claims')
  return { decision, businessCalls, observerCalls: receipts.length }
}

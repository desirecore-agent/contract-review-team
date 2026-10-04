const observerName = 'mcp__desirecore__RecordGateDecision'

export function collectToolIntents(message) {
  const native = message.tool_calls ?? []
  const text = typeof message.content === 'string' ? message.content : ''
  const openings = [...text.matchAll(/<function=([^>]+)>/g)]
  const complete = [...text.matchAll(/<function=([^>]+)>([\s\S]*?)<\/function>/g)]
  if (openings.length !== complete.length) throw new Error('Incomplete textual tool intent')
  const xml = complete.map(match => {
    const params = {}
    for (const part of match[2].matchAll(/<parameter=([^>]+)>([\s\S]*?)<\/parameter>/g)) {
      const value = part[2].trim()
      try { params[part[1]] = JSON.parse(value) } catch {
        if (match[1] === observerName && !['verdict', 'explanation'].includes(part[1])) throw new Error('Malformed structured observer parameter')
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
  const decision = JSON.parse(receipts[0].function.arguments)
  const keys = ['verdict', 'handoff', 'capability_debt', 'findings', 'score', 'artifacts', 'explanation']
  if (Object.keys(decision).some(key => !keys.includes(key)) || keys.some(key => !(key in decision))) throw new Error('Unexpected observer receipt shape')
  if (!['passed', 'conditional', 'blocked'].includes(decision.verdict)) throw new Error('Invalid verdict')
  if (!decision.handoff || typeof decision.handoff !== 'object' || Array.isArray(decision.handoff)) throw new Error('Invalid handoff')
  if (Object.keys(decision.handoff).some(key => !['to', 'from'].includes(key)) || !('to' in decision.handoff) || !(decision.handoff.to === null || typeof decision.handoff.to === 'string') || ('from' in decision.handoff && typeof decision.handoff.from !== 'string')) throw new Error('Invalid handoff fields')
  if (!Array.isArray(decision.capability_debt) || !decision.capability_debt.length || decision.capability_debt.some(value => typeof value !== 'string' || !value.trim())) throw new Error('Invalid capability debt')
  if (!Array.isArray(decision.findings) || decision.findings.some(value => !value || typeof value !== 'object' || Array.isArray(value))) throw new Error('Invalid findings')
  if (!(decision.score === null || typeof decision.score === 'number') || !Array.isArray(decision.artifacts) || decision.artifacts.some(value => typeof value !== 'string') || typeof decision.explanation !== 'string' || !decision.explanation.trim()) throw new Error('Invalid observer result fields')
  return { decision, businessCalls, observerCalls: receipts.length }
}

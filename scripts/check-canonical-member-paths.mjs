import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import path from 'node:path'
import { assertCanonicalRoot, buildRunArtifacts } from './canonical-member-path-contract.mjs'

// Source-contract check only. This does not grant file access or exercise Delegate.
const membersRoot = process.env.CONTRACT_MEMBERS_ROOT
assert.ok(membersRoot && path.isAbsolute(membersRoot), 'Set absolute CONTRACT_MEMBERS_ROOT')
const consumers = [
  ['contract-intake', 'contract-intake-gate', ['<canonical_artifact_root>/intake/<intake_id>.receipt.yaml', '<canonical_artifact_root>/intake/<intake_id>.detail.yaml', '<canonical_artifact_root>/intake/<intake_id>.validation.json']],
  ['clause-extractor', 'clause-extraction', ['<canonical_artifact_root>/clause-extraction/<extraction_id>.checkpoint.yaml', '<canonical_artifact_root>/clause-extraction/<extraction_id>.enriched.yaml', '<canonical_artifact_root>/clause-extraction/<extraction_id>.receipt.yaml']],
  ['risk-scanner', 'risk-scanning', ['<canonical_artifact_root>/risk-scan/<risk_scan_id>.yaml', '<canonical_artifact_root>/risk-scan/<risk_scan_id>.receipt.yaml']],
  ['jurisdiction-auditor', 'jurisdiction-audit', ['<canonical_artifact_root>/jurisdiction-audit/<jurisdiction_audit_id>.yaml', '<canonical_artifact_root>/jurisdiction-audit/<jurisdiction_audit_id>.receipt.yaml']],
  ['review-reporter', 'independent-verification', ['<canonical_artifact_root>/independent-verification/<verification_id>.receipt.json']],
  ['review-reporter', 'report-composition', ['<canonical_artifact_root>/report-delivery/scorecard.json', '<canonical_artifact_root>/report-delivery/report.md', '<canonical_artifact_root>/report-delivery/pending-receipt.json', '<canonical_artifact_root>/report-delivery/export-attempts.json']],
]
function validateTemplate(text, templates) {
  for (const template of templates) assert.ok(text.includes(template), `missing canonical artifact template: ${template}`)
  assert.doesNotMatch(text, /canonical_artifact_root>?\/[<]?(?:case_id|contract_object_id|object_id)/)
  assert.doesNotMatch(text, /<workspace>\/contract-review\/<case_id>/)
}
for (const [member, skill, templates] of consumers) {
  const text = await readFile(path.join(membersRoot, member, 'skills', skill, 'SKILL.md'), 'utf8')
  validateTemplate(text, templates)
}
const lead = await readFile(path.join(membersRoot,'contract-review-lead/skills/review-orchestration/SKILL.md'),'utf8')
assert.match(lead, /canonical_artifact_root.*唯一语义.*case\/object\/version\/run/)
for (const stage of ['intake/', 'clause-extraction/', 'risk-scan/', 'jurisdiction-audit/', 'independent-verification/', 'report-delivery/']) assert.ok(lead.includes(stage), `Lead missing ${stage}`)

const scenarios = [
  { base: '/authorized/review', identity: {caseId:'CASE-A',objectId:'OBJECT-1',versionId:'V1',runId:'RUN-1'} },
  { base: '/authorized/review', identity: {caseId:'CASE-B',objectId:'OBJECT-1',versionId:'V1',runId:'RUN-1'} },
  { base: '/authorized/review', identity: {caseId:'CASE-A',objectId:'OBJECT-2',versionId:'V1',runId:'RUN-1'} },
  { base: '/authorized/review', identity: {caseId:'CASE-A',objectId:'OBJECT-1',versionId:'V1',runId:'RUN-2'} },
  { base: 'C:\\authorized\\review', identity: {caseId:'CASE-W',objectId:'OBJECT-W',versionId:'V2',runId:'RUN-W'} },
]
const all = new Set()
const evidence = []
for (const scenario of scenarios) {
  const api = /^(?:[A-Za-z]:[\\/]|\\\\)/.test(scenario.base) ? path.win32 : path.posix
  const root = api.join(scenario.base, scenario.identity.caseId, scenario.identity.objectId, scenario.identity.versionId, scenario.identity.runId)
  assertCanonicalRoot(root, scenario.identity)
  const artifacts = buildRunArtifacts({ root, identity: scenario.identity, ids: {intake:'INTAKE-1',extraction:'EXTRACT-1',risk:'RISK-1',jurisdiction:'JUR-1',o4:'VERIFY-1'} })
  assert.equal(new Set(Object.values(artifacts)).size, Object.keys(artifacts).length)
  for (const artifact of Object.values(artifacts)) { assert.equal(all.has(artifact), false, `cross-run collision: ${artifact}`); all.add(artifact) }
  evidence.push({ root, artifacts })
}
assert.throws(() => assertCanonicalRoot('/authorized/review/CASE-A', scenarios[0].identity), /case\/object\/version\/run/)
assert.throws(() => assertCanonicalRoot('relative/CASE-A/OBJECT-1/V1/RUN-1', scenarios[0].identity), /absolute/)
for (const invalid of ['.', '..', '']) {
  assert.throws(() => assertCanonicalRoot('/authorized/review/CASE-A/OBJECT-1/V1/RUN-1', { ...scenarios[0].identity, runId: invalid }), /path-safe/)
}
assert.throws(() => assertCanonicalRoot('/authorized/review/CASE-A/OBJECT-1/V1/RUN-1', { ...scenarios[0].identity, caseId: '.' }), /path-safe/)
console.log(JSON.stringify({kind:'source-contract-not-runtime-enforcement', consumers:6, scenarios:scenarios.length, artifactsChecked:all.size, legacyRootsRejected:2, invalidIdentitiesRejected:4, evidence},null,2))

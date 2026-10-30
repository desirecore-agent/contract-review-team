import path from 'node:path'

const safeSegment = /^(?!\.{1,2}$)[A-Za-z0-9._-]+$/
const stages = new Set(['intake', 'clause-extraction', 'risk-scan', 'jurisdiction-audit', 'independent-verification', 'report-delivery'])

function apiFor(value) {
  if (/^(?:[A-Za-z]:[\\/]|\\\\)/.test(value) && path.win32.isAbsolute(value)) return path.win32
  if (path.posix.isAbsolute(value)) return path.posix
  throw new TypeError('canonical_artifact_root must be absolute')
}

export function assertCanonicalRoot(root, identity) {
  const api = apiFor(root)
  const fields = ['caseId', 'objectId', 'versionId', 'runId']
  const values = fields.map((key) => identity?.[key])
  if (values.some((value) => typeof value !== 'string' || !safeSegment.test(value))) throw new TypeError('identity fields must be path-safe segments')
  const normalized = api.normalize(root)
  const suffix = values.join(api.sep)
  if (normalized !== suffix && !normalized.endsWith(api.sep + suffix)) throw new TypeError('canonical root must end in case/object/version/run identity')
  return { api, root: normalized }
}

export function buildStageArtifact({ root, identity, stage, filename }) {
  if (!stages.has(stage)) throw new TypeError('unknown stage')
  if (typeof filename !== 'string' || !safeSegment.test(filename) || filename === '.' || filename === '..') throw new TypeError('filename must be one safe segment')
  const checked = assertCanonicalRoot(root, identity)
  const artifact = checked.api.join(checked.root, stage, filename)
  if (checked.api.relative(checked.root, artifact).startsWith('..')) throw new TypeError('artifact escapes canonical root')
  return artifact
}

export function buildRunArtifacts({ root, identity, ids }) {
  return {
    intakeReceipt: buildStageArtifact({ root, identity, stage: 'intake', filename: `${ids.intake}.receipt.yaml` }),
    intakeDetail: buildStageArtifact({ root, identity, stage: 'intake', filename: `${ids.intake}.detail.yaml` }),
    intakeValidation: buildStageArtifact({ root, identity, stage: 'intake', filename: `${ids.intake}.validation.json` }),
    clauseCheckpoint: buildStageArtifact({ root, identity, stage: 'clause-extraction', filename: `${ids.extraction}.checkpoint.yaml` }),
    clauseEnriched: buildStageArtifact({ root, identity, stage: 'clause-extraction', filename: `${ids.extraction}.enriched.yaml` }),
    clauseReceipt: buildStageArtifact({ root, identity, stage: 'clause-extraction', filename: `${ids.extraction}.receipt.yaml` }),
    riskArtifact: buildStageArtifact({ root, identity, stage: 'risk-scan', filename: `${ids.risk}.yaml` }),
    riskReceipt: buildStageArtifact({ root, identity, stage: 'risk-scan', filename: `${ids.risk}.receipt.yaml` }),
    jurisdictionArtifact: buildStageArtifact({ root, identity, stage: 'jurisdiction-audit', filename: `${ids.jurisdiction}.yaml` }),
    jurisdictionReceipt: buildStageArtifact({ root, identity, stage: 'jurisdiction-audit', filename: `${ids.jurisdiction}.receipt.yaml` }),
    o4Receipt: buildStageArtifact({ root, identity, stage: 'independent-verification', filename: `${ids.o4}.receipt.json` }),
    scorecard: buildStageArtifact({ root, identity, stage: 'report-delivery', filename: 'scorecard.json' }),
    report: buildStageArtifact({ root, identity, stage: 'report-delivery', filename: 'report.md' }),
    pendingReceipt: buildStageArtifact({ root, identity, stage: 'report-delivery', filename: 'pending-receipt.json' }),
    exportAttemptReceipt: buildStageArtifact({ root, identity, stage: 'report-delivery', filename: 'export-attempts.json' }),
  }
}

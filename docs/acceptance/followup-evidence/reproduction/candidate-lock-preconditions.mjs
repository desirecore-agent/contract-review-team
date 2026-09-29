export const EXPECTED_PLATFORM_COMMIT = '1536138e8c71db71b906d436212812086268e3c9'
export const EXPECTED_MEMBERS = Object.freeze(['contract-review-lead', 'contract-intake', 'clause-extractor', 'risk-scanner', 'jurisdiction-auditor', 'review-reporter'])

export function assertCandidateLockPreconditions({ platformHead, platformTrackedClean, memberIds }) {
  if (platformHead !== EXPECTED_PLATFORM_COMMIT) throw new Error('Platform HEAD differs from the reviewed exact commit')
  if (platformTrackedClean !== true) throw new Error('Platform tracked source is dirty or its cleanliness is unknown')
  if (!Array.isArray(memberIds) || memberIds.length !== EXPECTED_MEMBERS.length
      || new Set(memberIds).size !== EXPECTED_MEMBERS.length
      || memberIds.some((id) => !EXPECTED_MEMBERS.includes(id))) {
    throw new Error('Candidate lock must contain exactly the six reviewed members')
  }
}

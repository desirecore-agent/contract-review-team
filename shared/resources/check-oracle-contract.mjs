#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, isAbsolute, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'yaml'

const here = dirname(fileURLToPath(import.meta.url))
export const repositoryRoot = resolve(here, '..', '..')
export const defaultOraclePath = join(repositoryRoot, 'testdata', 'contracts', 'ground-truth.yaml')
export const defaultSourceBindingsPath = join(repositoryRoot, 'testdata', 'contracts', 'oracle-source-bindings.json')
export const CASE_IDS = ['C01', 'C02', 'C03', 'C04', 'C05', 'C06a', 'C06b', 'C07', 'C08', 'R01', 'R02', 'R03']
// Update only with an independently reviewed source-binding change. This pins
// serialized JSON values, not whitespace; it is a review fence, not a signature.
export const SOURCE_BINDINGS_SHA256 = '47a07dbb1a2e7f3554fa72940ed8e3d0ff535a5d8e3b8e7bbd62b1f387458f85'
const GATES = new Set(['passed', 'conditional', 'blocked'])
const DIRECTIONS = new Set(['up', 'down', 'flat', 'undetermined'])
const SOURCES = new Set(['synthetic', 'public_template', 'synthetic_derivative', 'temporal_derivative'])
const TARGET_KEYS = ['must_detect', 'must_not_flag', 'coverage_targets', 'negative_searches', 'scope_targets']
const SEVERITIES = new Set(['severe', 'important', 'advisory', 'pending'])

const sha256 = (value) => createHash('sha256').update(value).digest('hex')
const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value)
const push = (errors, path, message) => errors.push(`${path}: ${message}`)

const collectHistoricalMandatoryTargets = (legacy) => {
  const targets = []
  const walk = (value, path = '') => {
    if (Array.isArray(value)) return value.forEach((entry, index) => walk(entry, `${path}[${index}]`))
    if (!isObject(value)) return
    if (value.must_detect === true && typeof (value.id ?? value.slug) === 'string') {
      targets.push({ caseId: path.split('.')[0], kind: 'must_detect', id: value.id ?? value.slug, path })
    }
    for (const [key, child] of Object.entries(value)) {
      if (key === 'must_not_flag' && Array.isArray(child)) {
        child.forEach((entry, index) => targets.push({ caseId: path.split('.')[0], kind: 'must_not_flag', id: entry?.id ?? entry?.slug, path: `${path}.${key}[${index}]` }))
      } else walk(child, path ? `${path}.${key}` : key)
    }
  }
  walk(legacy)
  return targets
}

const targetEvidenceRefs = (target) => [target?.evidence_ref, ...(target?.evidence_refs ?? [])].filter(Boolean)

// This is a normalized ID-level contract check. It does not evaluate natural
// language, legal correctness, or acceptance of a complete review matter.
export function evaluateOracleOutput(document, caseId, output) {
  const item = document?.normative?.cases?.[caseId]
  if (!item) return { pass: false, errors: [`unknown case ${caseId}`], missing: [], forbidden: [] }
  const errors = []
  if (!isObject(output)) return { pass: false, errors: ['output must be a plain object'], missing: [], forbidden: [] }
  const validateIdArray = (key, required) => {
    if (!(key in output)) {
      if (required) errors.push(`${key} is required`)
      return []
    }
    if (!Array.isArray(output[key])) {
      errors.push(`${key} must be an array of normalized ID strings`)
      return []
    }
    const seen = new Set()
    for (const [index, id] of output[key].entries()) {
      if (typeof id !== 'string' || id.length === 0 || id.trim() !== id) errors.push(`${key}[${index}] must be a non-empty, trimmed string`)
      else if (seen.has(id)) errors.push(`${key} contains duplicate ID: ${id}`)
      else seen.add(id)
    }
    return [...seen]
  }
  const detectedIds = validateIdArray('detected_ids', true)
  const unassessedIds = validateIdArray('unassessed_ids', false)
  const known = new Set(['must_detect', 'must_not_flag'].flatMap((key) => (item[key] ?? []).map((target) => target.id ?? target.slug)))
  for (const id of detectedIds) if (!known.has(id)) errors.push(`unknown detected ID: ${id}`)
  for (const id of unassessedIds) {
    if (known.has(id)) errors.push(`known ID must be classified through detected_ids, not unassessed_ids: ${id}`)
    else errors.push(`unassessed observation requires manual classification: ${id}`)
  }
  const detected = new Set(detectedIds.filter((id) => known.has(id)))
  const missing = (item.must_detect ?? [])
    .filter((target) => target.required === true && !detected.has(target.id))
    .map((target) => target.id)
  const forbidden = (item.must_not_flag ?? [])
    .filter((target) => target.required === true && detected.has(target.id))
    .map((target) => target.id)
  errors.push(
    ...missing.map((id) => `missing mandatory detection: ${id}`),
    ...forbidden.map((id) => `forbidden false positive: ${id}`),
  )
  return { pass: errors.length === 0, errors, missing, forbidden, unassessed: unassessedIds }
}

export function loadOracle(path = defaultOraclePath) {
  return parse(readFileSync(path, 'utf8'))
}

export function loadSourceBindings(path = defaultSourceBindingsPath) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

export function validateOracle(document, options = {}) {
  const errors = []
  const baseDir = options.baseDir ?? join(repositoryRoot, 'testdata', 'contracts')
  const normative = document?.normative
  if (!isObject(normative) || normative.normative !== true) {
    push(errors, 'normative', 'must be an object with normative: true')
    return errors
  }
  if (!isObject(document?.history) || document.history.normative !== false) {
    push(errors, 'history', 'must be separate and explicitly normative: false')
  }
  if ('history_target_dispositions' in normative) push(errors, 'normative.history_target_dispositions', 'legacy dispositions are forbidden in normative; keep them in non-normative provenance')
  const dispositions = document?.provenance?.history_target_dispositions
  if (document?.provenance?.normative !== false || !isObject(dispositions)) push(errors, 'provenance.history_target_dispositions', 'must be an explicit non-normative audit ledger')
  for (const forbidden of ['measured_baseline', 'measured_baseline_cn_v3', 'verdict_override']) {
    if (JSON.stringify(normative).includes(`\"${forbidden}\"`)) push(errors, 'normative', `historical field ${forbidden} is forbidden`)
  }

  const cases = normative.cases
  if (!isObject(cases)) {
    push(errors, 'normative.cases', 'must be a mapping')
    return errors
  }
  const actualIds = Object.keys(cases).sort()
  const expectedIds = [...CASE_IDS].sort()
  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
    push(errors, 'normative.cases', `must exactly cover ${CASE_IDS.join(', ')}; got ${actualIds.join(', ')}`)
  }
  if (JSON.stringify(normative.case_ids) !== JSON.stringify(CASE_IDS)) {
    push(errors, 'normative.case_ids', 'must list every C/R key exactly once in canonical order')
  }

  for (const [id, item] of Object.entries(cases)) {
    const path = `normative.cases.${id}`
    if (!GATES.has(item?.expected_gate)) push(errors, `${path}.expected_gate`, 'must be one scalar: passed | conditional | blocked')
    if (!isObject(item?.source) || !SOURCES.has(item.source.classification)) push(errors, `${path}.source.classification`, `must be one of ${[...SOURCES].join(' | ')}`)
    if (typeof item?.source?.file !== 'string') push(errors, `${path}.source.file`, 'is required')
    if (!/^[a-f0-9]{64}$/.test(item?.source?.sha256 ?? '')) push(errors, `${path}.source.sha256`, 'must be a lowercase SHA-256')
    if (typeof item?.source?.file === 'string' && /^[a-f0-9]{64}$/.test(item?.source?.sha256 ?? '')) {
      try {
        const inputPath = isAbsolute(item.source.file) ? item.source.file : join(baseDir, item.source.file)
        const actual = sha256(readFileSync(inputPath))
        if (actual !== item.source.sha256) push(errors, `${path}.source.sha256`, `does not match ${item.source.file}; got ${actual}`)
      } catch (error) { push(errors, `${path}.source.file`, `cannot read: ${error.message}`) }
    }
    if (!isObject(item?.service_scope) || typeof item.service_scope.status !== 'string') push(errors, `${path}.service_scope`, 'structured status is required')
    if (!isObject(item?.legal_review) || !['pending', 'not_required'].includes(item.legal_review.status)) push(errors, `${path}.legal_review.status`, 'must be pending or not_required')
    for (const key of TARGET_KEYS) if (!Array.isArray(item?.[key])) push(errors, `${path}.${key}`, 'must be an explicitly predeclared array')
    const targetCount = TARGET_KEYS.reduce((count, key) => count + (Array.isArray(item?.[key]) ? item[key].length : 0), 0)
    if (targetCount === 0) push(errors, path, 'must define stable predeclared check targets; empty defaults are forbidden')
    if (!Array.isArray(item?.coverage_targets) || item.coverage_targets.length === 0) push(errors, `${path}.coverage_targets`, 'must predeclare at least one coverage target')
    if (!Array.isArray(item?.scope_targets) || item.scope_targets.length === 0) push(errors, `${path}.scope_targets`, 'must predeclare at least one applicability/scope target')
    if (!Array.isArray(item?.must_detect) || item.must_detect.length === 0) push(errors, `${path}.must_detect`, 'must predeclare at least one detection target; an empty array cannot pass')
    if (!Array.isArray(item?.must_not_flag) || item.must_not_flag.length === 0) push(errors, `${path}.must_not_flag`, 'must predeclare at least one false-positive prohibition; an empty array cannot pass')
    for (const [index, target] of (item?.must_detect ?? []).entries()) {
      if (!isObject(target) || typeof target.id !== 'string') push(errors, `${path}.must_detect[${index}]`, 'requires a stable id')
      if ('severity' in (target ?? {})) {
        if (!SEVERITIES.has(target.severity)) push(errors, `${path}.must_detect[${index}].severity`, 'must use severe | important | advisory | pending')
        if (typeof target.severity_source !== 'string' || !target.severity_source.length) push(errors, `${path}.must_detect[${index}].severity_source`, 'is required when severity is asserted')
      }
      if (target?.legal_effect === 'approved' || target?.substantive_conclusion === 'approved') push(errors, `${path}.must_detect[${index}]`, 'foreign/statutory legal effect must not masquerade as approved')
    }
    for (const [index, target] of (item?.must_not_flag ?? []).entries()) if (!isObject(target) || typeof (target.id ?? target.slug) !== 'string') push(errors, `${path}.must_not_flag[${index}]`, 'requires a stable id or slug')
    const polarities = new Map()
    for (const key of ['must_detect', 'must_not_flag']) for (const [index, target] of (item?.[key] ?? []).entries()) {
      const tp = `${path}.${key}[${index}]`
      if (typeof target?.required !== 'boolean') push(errors, `${tp}.required`, 'must be explicitly true or false')
      if (target?.required === false && (typeof target.optional_reason !== 'string' || !target.optional_reason.trim())) push(errors, `${tp}.optional_reason`, 'is required for an explicitly optional target')
      const id = target?.id ?? target?.slug
      if (typeof id === 'string') {
        if (polarities.has(id)) push(errors, tp, `duplicate or cross-polarity target ID ${id}; first declared in ${polarities.get(id)}`)
        else polarities.set(id, key)
      }
    }
    for (const [index, target] of (item?.negative_searches ?? []).entries()) {
      if (!isObject(target) || typeof target.id !== 'string' || !Array.isArray(target.patterns) || !target.patterns.length || typeof target.scope !== 'string') push(errors, `${path}.negative_searches[${index}]`, 'requires id, non-empty patterns and scope')
      else try {
        const inputPath = isAbsolute(item.source.file) ? item.source.file : join(baseDir, item.source.file)
        const source = readFileSync(inputPath, 'utf8')
        for (const pattern of target.patterns) {
          if (typeof pattern !== 'string') { push(errors, `${path}.negative_searches[${index}]`, 'patterns must be strings'); continue }
          try {
            if (new RegExp(pattern, 'u').test(source)) push(errors, `${path}.negative_searches[${index}]`, `negative search pattern unexpectedly matches source bytes: ${pattern}`)
          } catch (error) { push(errors, `${path}.negative_searches[${index}]`, `invalid negative search regex ${pattern}: ${error.message}`) }
        }
      } catch { /* source diagnostic emitted above */ }
    }
    if (item?.comparison?.applicability === 'not_applicable') {
      if ('direction' in item.comparison) push(errors, `${path}.comparison.direction`, 'must be omitted when comparison is not applicable')
    } else if (!DIRECTIONS.has(item?.comparison?.direction)) {
      push(errors, `${path}.comparison.direction`, 'must be up | down | flat | undetermined')
    }

    const scopeText = JSON.stringify(item?.service_scope ?? {})
    if (/foreign.{0,20}(pack|rulepack)|jurisdiction-(eu|sg|us)|补.{0,4}包|配置.{0,12}法域包/i.test(scopeText)) push(errors, `${path}.service_scope`, 'must not prescribe a foreign-law pack')
    if (item?.service_scope?.status === 'out_of_service_scope') {
      if (item.service_scope.foreign_law_substantive_conclusions_allowed !== false) push(errors, `${path}.service_scope.foreign_law_substantive_conclusions_allowed`, 'must be false out of scope')
      if (item.service_scope.referral_required !== true) push(errors, `${path}.service_scope.referral_required`, 'must be true out of scope')
    }

    const evidence = Array.isArray(item?.evidence) ? item.evidence : []
    for (const [index, entry] of evidence.entries()) {
      const ep = `${path}.evidence[${index}]`
      if (entry?.kind === 'literal') {
        if (typeof entry.quote !== 'string' || !entry.quote.length) { push(errors, `${ep}.quote`, 'literal evidence requires a quote'); continue }
        try {
          const evidenceCase = entry.source_case && cases[entry.source_case]
          const evidenceFile = evidenceCase?.source?.file ?? item.source.file
          const inputPath = isAbsolute(evidenceFile) ? evidenceFile : join(baseDir, evidenceFile)
          const source = readFileSync(inputPath, 'utf8')
          if (!source.includes(entry.quote)) push(errors, `${ep}.quote`, 'literal quote is not an exact substring of the source')
        } catch { /* source diagnostic emitted above */ }
      } else if (entry?.kind === 'negative_search') {
        if (!Array.isArray(entry.patterns) || !entry.patterns.length || !entry.scope) push(errors, ep, 'negative_search requires patterns and scope')
        if ('quote' in entry) push(errors, `${ep}.quote`, 'negative_search must not masquerade as a literal quote')
      } else if (entry?.kind === 'rule_note') {
        if ('quote' in entry) push(errors, `${ep}.quote`, 'rule_note must not masquerade as a literal quote')
      } else push(errors, `${ep}.kind`, 'must be literal | negative_search | rule_note')
    }
  }

  const c05 = cases.C05
  const c07 = cases.C07
  const ids = (value) => new Set((value ?? []).map((entry) => entry?.id ?? entry?.slug))
  const requireIds = (id, key, required) => {
    const present = ids(cases[id]?.[key])
    for (const expected of required) if (!present.has(expected)) push(errors, `normative.cases.${id}.${key}`, `must retain predeclared target ${expected}`)
  }
  requireIds('C01', 'must_not_flag', ['placeholder-unfilled', 'attachment-missing', 'signature-status-unconfirmed', 'page-discontinuity', 'version-mismatch', 'party-name-inconsistency', 'liability-cap-missing', 'dispute-resolution-missing'])
  requireIds('C03', 'must_detect', ['liability-cap-missing', 'breach-remedy-missing', 'dispute-resolution-missing'])
  requireIds('C04', 'must_detect', ['five-year-non-compete-text', 'no-economic-compensation-text', 'twelve-month-probation-text'])
  requireIds('C05', 'must_detect', ['governing-law-forum-coexistence', 'data-export-prohibited-text'])
  requireIds('R02', 'must_detect', ['party-id-absent', 'contract-date-2026', 'old-contract-law-name-text', 'arbitration-institution-unspecified-text'])
  requireIds('R03', 'must_detect', ['party-id-absent', 'contract-date-2019', 'old-contract-law-name-text', 'arbitration-institution-unspecified-text'])
  requireIds('C06b', 'must_detect', ['attachment-version-replaced'])
  requireIds('R03', 'must_detect', ['arbitration-law-version-out-of-range'])
  for (const [id, item] of [['C05', c05], ['C07', c07]]) {
    if (item?.expected_gate !== 'passed') push(errors, `normative.cases.${id}.expected_gate`, 'must be passed when no independent hard blocker exists')
    if (item?.service_scope?.status !== 'out_of_service_scope') push(errors, `normative.cases.${id}.service_scope.status`, 'must be out_of_service_scope')
    if (item?.service_scope?.intake_object_blocked_by_scope_alone !== false) push(errors, `normative.cases.${id}.service_scope.intake_object_blocked_by_scope_alone`, 'must be false')
  }
  for (const id of ['R02', 'R03']) {
    const item = cases[id]
    if (item?.expected_gate !== 'conditional') push(errors, `normative.cases.${id}.expected_gate`, 'must be the single canonical value conditional')
    if (item?.gate_reason?.code !== 'FLG-PARTY-ID-ABSENT' || item?.gate_reason?.source !== 'contract-intake@1.0.6 S7.1' || item?.gate_reason?.downstream !== 'continue' || !Array.isArray(item?.gate_reason?.missing_for) || item.gate_reason.missing_for.length !== 2) push(errors, `normative.cases.${id}.gate_reason`, 'must gate only the two required main-party identifiers and continue downstream')
    const roles = item?.party_identifier_expectations ?? []
    const expectedRoles = [['buyer', 'required'], ['seller', 'required'], ['witness', 'unknown']]
    for (const [role, applicability] of expectedRoles) {
      const match = roles.find((entry) => entry?.party_role === role)
      if (match?.identifier_applicability !== applicability || typeof match?.basis !== 'string' || !match.basis) push(errors, `normative.cases.${id}.party_identifier_expectations`, `must retain ${role} as ${applicability} with source-based rationale`)
    }
  }

  const historicalTargets = collectHistoricalMandatoryTargets(document?.history?.legacy_oracle)
  const historicalKeys = new Set()
  for (const target of historicalTargets) {
    const key = `${target.caseId}:${target.kind}:${target.id}`
    if (historicalKeys.has(key)) push(errors, `history.legacy_oracle.${target.path}`, `duplicate historical mandatory semantic key ${key}`)
    historicalKeys.add(key)
    const mapping = dispositions?.[key]
    const coordinates = mapping?.targets ?? [{ kind: target.kind, id: target.id }]
    if (mapping && (mapping.mapping_type !== 'scope_change' || mapping.source_history_key !== key || !mapping.reason || !mapping.review_source || !Array.isArray(mapping.targets) || mapping.targets.length === 0)) push(errors, `provenance.history_target_dispositions.${key}`, 'scope_change requires identity, reason, review source and non-empty executable targets')
    for (const coordinate of coordinates) {
      const path = `normative.cases.${target.caseId}.${coordinate.kind}`
      const collection = cases[target.caseId]?.[coordinate.kind]
      const matches = Array.isArray(collection) ? collection.filter((entry) => (entry?.id ?? entry?.slug) === coordinate.id) : []
      if (matches.length !== 1) { push(errors, path, `historical mandatory ${key} target ${coordinate.kind}:${coordinate.id} must bind exactly once; got ${matches.length}`); continue }
      if (matches[0].required !== true) push(errors, `${path}.${coordinate.id}.required`, `historical mandatory ${key} mapped target must be explicitly required: true`)
    }
  }
  for (const key of Object.keys(dispositions ?? {})) if (!historicalKeys.has(key)) push(errors, `provenance.history_target_dispositions.${key}`, 'does not identify a frozen historical mandatory target')

  let bindings
  try { bindings = options.sourceBindings ?? loadSourceBindings(options.sourceBindingsPath) } catch (error) { push(errors, 'source_bindings', `cannot read/parse: ${error.message}`) }
  if (bindings && sha256(JSON.stringify(bindings)) !== SOURCE_BINDINGS_SHA256) {
    push(errors, 'source_bindings.digest', 'frozen source-binding digest changed; independent review and an explicit pin update are required')
  }
  if (bindings) for (const [caseId, item] of Object.entries(cases)) {
    const frozenCase = bindings.cases?.[caseId]
    if (frozenCase?.source_file !== item.source.file || frozenCase?.source_sha256 !== item.source.sha256) push(errors, `source_bindings.cases.${caseId}`, 'source file/SHA binding changed')
    const actualKeys = []
    const evidenceById = new Map([...(item.evidence ?? []), ...(item.negative_searches ?? [])].map((entry) => [entry.id, entry]))
    for (const kind of ['must_detect', 'must_not_flag']) for (const target of item[kind]) {
      const key = `${kind}:${target.id ?? target.slug}`; actualKeys.push(key)
      const frozen = frozenCase?.targets?.[key]
      if (!frozen) { push(errors, `source_bindings.cases.${caseId}.targets.${key}`, 'missing frozen source assertion binding'); continue }
      const refs = targetEvidenceRefs(target)
      if (JSON.stringify(refs) !== JSON.stringify(frozen.refs) || target.required !== frozen.required) push(errors, `source_bindings.cases.${caseId}.targets.${key}`, 'requiredness or exact evidence binding changed')
      if (!Array.isArray(frozen.refs) || frozen.refs.length === 0 || new Set(frozen.refs).size !== frozen.refs.length
          || !Array.isArray(frozen.assertions) || frozen.assertions.length !== frozen.refs.length
          || frozen.assertions.some((assertion) => !isObject(assertion) || typeof assertion.ref !== 'string')
          || new Set(frozen.assertions.map((assertion) => assertion.ref)).size !== frozen.refs.length
          || frozen.refs.some((ref) => !frozen.assertions.some((assertion) => assertion.ref === ref))) {
        push(errors, `source_bindings.cases.${caseId}.targets.${key}`, 'each evidence ref must have exactly one complete assertion')
        continue
      }
      for (const assertion of frozen.assertions ?? []) {
        const actual = evidenceById.get(assertion.ref)
        const normalized = actual?.kind === 'literal' ? { ref: assertion.ref, kind: 'literal', quote: actual.quote, source_case: actual.source_case ?? caseId } : Array.isArray(actual?.patterns) ? { ref: assertion.ref, kind: 'negative_search', patterns: actual.patterns, scope: actual.scope } : { ref: assertion.ref, kind: actual?.kind }
        if (JSON.stringify(normalized) !== JSON.stringify(assertion)) push(errors, `source_bindings.cases.${caseId}.targets.${key}`, `frozen assertion ${assertion.ref} no longer matches oracle evidence metadata`)
      }
    }
    for (const key of Object.keys(frozenCase?.targets ?? {})) if (!actualKeys.includes(key)) push(errors, `source_bindings.cases.${caseId}.targets.${key}`, 'binding has no current executable target')
  }
  const c01Amount = (cases.C01?.must_not_flag ?? []).find((target) => target?.id === 'amount-in-words-mismatch')
  if (c01Amount?.evidence_ref !== 'c01-total' || c01Amount?.output_rule !== 'forbidden') {
    push(errors, 'normative.cases.C01.must_not_flag.amount-in-words-mismatch', 'must remain a forbidden-output rule grounded in the C01 amount wording; it cannot map to optional arithmetic detection')
  }
  const r01MustNot = new Set((cases.R01?.must_not_flag ?? []).map((entry) => entry?.id))
  for (const id of ['attachment-missing', 'party-name-inconsistency']) if (!r01MustNot.has(id)) push(errors, 'normative.cases.R01.must_not_flag', `must restore source-grounded false-positive prohibition ${id}`)
  if (cases.C08?.scenario?.type !== 'execution_readiness_review' || cases.C08?.expected_gate !== 'blocked') push(errors, 'normative.cases.C08', 'original case must remain blocked execution_readiness_review')
  const draft = normative.scenarios?.C08_negotiation_draft
  if (draft?.base_case !== 'C08' || typeof draft?.user_request_text !== 'string' || !draft.user_request_text.includes('negotiation_draft') || draft?.request?.object_designation !== 'negotiation_draft' || draft?.request?.type !== 'negotiation_draft' || draft?.request?.execution_validation_requested !== false || draft?.expected_gate !== 'passed' || draft?.signature_pending !== true) push(errors, 'normative.scenarios.C08_negotiation_draft', 'must record an explicit user-requested draft, pass when signature is the only pending item, and retain signature pending')
  if (cases.C06a?.comparison?.applicability !== 'not_applicable') push(errors, 'normative.cases.C06a.comparison.applicability', 'single-version review must be not_applicable')
  const c06 = cases.C06b?.comparison
  if (c06?.direction !== 'undetermined' || c06?.attachment_direction !== 'up' || c06?.global_coverage !== 'partial' || c06?.perspective !== 'client' || c06?.request_baseline !== 'C06a' || !Array.isArray(c06?.uncovered_components) || c06.uncovered_components.length !== 2) push(errors, 'normative.cases.C06b.comparison', 'must keep global partial/undetermined, local attachment up, explicit C06a baseline, client perspective, and both uncovered attachments')
  const r7 = normative.targeted_scenarios?.R7_known_manifest_body_absent
  const partyScenarios = normative.targeted_scenarios ?? {}
  const requiredParty = partyScenarios.party_identifier_required_cn_party
  if (requiredParty?.identifier_applicability !== 'required' || requiredParty?.expected_outcome !== 'FLG-PARTY-ID-ABSENT') push(errors, 'normative.targeted_scenarios.party_identifier_required_cn_party', 'a required Chinese main party without an identifier must retain the conditional flag')
  const notApplicableWitness = partyScenarios.party_identifier_not_applicable_witness
  if (notApplicableWitness?.party_role !== 'witness' || notApplicableWitness?.identifier_applicability !== 'not_applicable' || notApplicableWitness?.expected_outcome !== 'no_identifier_gate') push(errors, 'normative.targeted_scenarios.party_identifier_not_applicable_witness', 'an explicitly excluded witness must not receive an identifier gate')
  const unknownRole = partyScenarios.party_identifier_unknown_role
  if (unknownRole?.identifier_applicability !== 'unknown' || unknownRole?.expected_outcome !== 'role_clarification') push(errors, 'normative.targeted_scenarios.party_identifier_unknown_role', 'an unclear role must stay unknown and request clarification without a new hard blocker')
  if (r7?.expected_gate !== 'passed' || r7?.pend_001_allowed !== false) push(errors, 'normative.targeted_scenarios.R7_known_manifest_body_absent', 'R7 must remain passed without PEND-001')
  const r9 = normative.targeted_scenarios?.R9_authoritative_manifest_absent
  if (r9?.expected_gate !== 'conditional' || r9?.required_pending_id !== 'PEND-001') push(errors, 'normative.targeted_scenarios.R9_authoritative_manifest_absent', 'R9 must be conditional and retain PEND-001')
  if (normative.targeted_scenarios?.body_reference_not_in_manifest?.expected_gate !== 'blocked') push(errors, 'normative.targeted_scenarios.body_reference_not_in_manifest', 'an undeclared referenced attachment must remain blocked')
  return errors
}

export function runOracleCheck(path = defaultOraclePath) {
  let document
  try { document = loadOracle(path) } catch (error) { return [`oracle: YAML parse/read failed: ${error.message}`] }
  return validateOracle(document, { baseDir: dirname(path) })
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const path = process.argv[2] ? resolve(process.argv[2]) : defaultOraclePath
  const errors = runOracleCheck(path)
  if (errors.length) {
    console.error('✗ oracle contract check failed:')
    for (const error of errors) console.error(`  - ${error}`)
    process.exitCode = 1
  } else console.log(`✓ oracle contract valid: ${path}`)
}

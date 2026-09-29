#!/usr/bin/env node
/** Developer-only generator. Requires `npm ci` for yaml; runtime checker is Node-core-only. */
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'yaml'

const here = dirname(fileURLToPath(import.meta.url))
function args(argv) {
  const out = { oracle: join(here, 'ground-truth.yaml'), index: join(here, 'evidence-index.json') }
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i], v = argv[++i]
    if (!['--oracle', '--index'].includes(k) || !v || v.startsWith('--')) throw new Error(`invalid/incomplete argument: ${k}`)
    out[k.slice(2)] = resolve(v)
  }
  return out
}
const opt = args(process.argv.slice(2)); const base = dirname(opt.oracle)
const oracleBytes = readFileSync(opt.oracle); const doc = parse(oracleBytes.toString('utf8'))
const cases = doc?.normative?.normative === true && doc.normative.cases
if (!cases || typeof cases !== 'object' || Array.isArray(cases) || Object.keys(cases).length === 0) throw new Error('normative.cases must be a non-empty mapping')
const safe = (file) => typeof file === 'string' && file.length > 0 && !isAbsolute(file) && !file.split(/[\\/]/).includes('..') && relative(base, resolve(base, file)) === file
const sha = (b) => createHash('sha256').update(b).digest('hex')
const sources = {}; const literals = []
for (const [caseId, item] of Object.entries(cases)) {
  const own = item?.source?.file
  if (!safe(own)) throw new Error(`${caseId}: invalid source file`)
  // Every normative input participates, even when the case has only negative
  // searches or no literal evidence. Literal-only indexing silently lost inputs.
  const ownDigest = sha(readFileSync(join(base, own)))
  if (item.source.sha256 !== undefined && item.source.sha256 !== ownDigest) throw new Error(`${caseId}: declared source SHA-256 mismatch`)
  if (sources[own] !== undefined && sources[own] !== ownDigest) throw new Error(`${caseId}: source changed during index generation`)
  sources[own] = ownDigest
  if (item.evidence !== undefined && !Array.isArray(item.evidence)) throw new Error(`${caseId}: evidence must be an array`)
  for (const [i, ev] of (item.evidence ?? []).entries()) {
    if (ev?.kind !== 'literal') continue
    const sourceCase = ev.source_case ?? caseId
    const file = cases[sourceCase]?.source?.file
    if (!file) throw new Error(`${caseId}.evidence[${i}]: unknown source_case ${sourceCase}`)
    if (!safe(file)) throw new Error(`${caseId}.evidence[${i}]: invalid source path`)
    if (typeof ev.quote !== 'string' || ev.quote.trim() === '') throw new Error(`${caseId}.evidence[${i}]: blank literal quote`)
    const bytes = readFileSync(join(base, file)); sources[file] ??= sha(bytes)
    literals.push({ case: caseId, evidenceIndex: i, id: ev.id ?? null, sourceCase, file, quote: ev.quote })
  }
}
if (literals.length === 0) throw new Error('no normative literal evidence')
const index = { format: 'contract-evidence-index/v1', derivedFrom: 'ground-truth.yaml normative.cases only', oracleSha256: sha(oracleBytes), sources, literals }
writeFileSync(opt.index, `${JSON.stringify(index, null, 2)}\n`)
console.log(`generated ${opt.index}: ${literals.length} literals, ${Object.keys(sources).length} source files`)

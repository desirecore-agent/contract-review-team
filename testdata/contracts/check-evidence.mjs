#!/usr/bin/env node
/** Node-core-only runtime check of the reviewed index derived from normative.cases. */
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, isAbsolute, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const here = dirname(fileURLToPath(import.meta.url))
// A reviewed derived-index pin, not a signature or a runtime authority grant.
// Regenerate explicitly during development and independently review the pin update.
const REVIEWED_INDEX_SHA256 = 'b4dbbe6effca260f8bab99b3548865d69c0c309505038eaa729d46081b9900fb'
function args(argv) {
  const out = { oracle: join(here, 'ground-truth.yaml'), index: join(here, 'evidence-index.json') }
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i], v = argv[++i]
    if (!['--oracle', '--index', '--index-sha256'].includes(k) || !v || v.startsWith('--')) throw new Error(`invalid/incomplete argument: ${k}`)
    if (k === '--index-sha256') {
      if (!/^[a-f0-9]{64}$/.test(v)) throw new Error('invalid --index-sha256')
      out.indexSha256 = v
    } else out[k.slice(2)] = resolve(v)
  }
  if (out.index !== join(here, 'evidence-index.json') && !out.indexSha256) throw new Error('custom --index requires its independently expected --index-sha256')
  if (out.index === join(here, 'evidence-index.json') && out.indexSha256 && out.indexSha256 !== REVIEWED_INDEX_SHA256) throw new Error('cannot override the reviewed default index pin')
  out.indexSha256 ??= REVIEWED_INDEX_SHA256
  return out
}
let opt
try { opt = args(process.argv.slice(2)) } catch (e) { console.error(`✗ evidence arguments: ${e.message}`); process.exit(2) }
const base = dirname(opt.oracle), problems = []; let index, oracleBytes, indexBytes
try { oracleBytes = readFileSync(opt.oracle); indexBytes = readFileSync(opt.index); index = JSON.parse(indexBytes.toString('utf8')) } catch (e) { console.error(`✗ evidence check failed: ${e.message}`); process.exit(1) }
const sha = (b) => createHash('sha256').update(b).digest('hex')
const safe = (file) => typeof file === 'string' && file.length > 0 && !isAbsolute(file) && !file.split(/[\\/]/).includes('..') && relative(base, resolve(base, file)) === file
if (sha(indexBytes) !== opt.indexSha256) problems.push('index digest mismatch; regenerate and independently review the explicit pin before reuse')
if (index?.format !== 'contract-evidence-index/v1') problems.push('unknown evidence index format')
if (index?.oracleSha256 !== sha(oracleBytes)) problems.push('oracle/index SHA-256 binding mismatch; explicitly regenerate and review the index')
if (!index?.sources || typeof index.sources !== 'object' || Array.isArray(index.sources) || Object.keys(index.sources).length === 0) problems.push('index has zero source files')
if (!Array.isArray(index?.literals) || index.literals.length === 0) problems.push('index has zero literals')
const cache = new Map()
const sources = index?.sources && typeof index.sources === 'object' && !Array.isArray(index.sources) ? index.sources : {}
const literals = Array.isArray(index?.literals) ? index.literals : []
for (const [file, expected] of Object.entries(sources)) {
  if (!safe(file)) { problems.push(`invalid source path: ${JSON.stringify(file)}`); continue }
  try { const bytes = readFileSync(join(base, file)); cache.set(file, bytes.toString('utf8')); if (sha(bytes) !== expected) problems.push(`${file}: source SHA-256 mismatch`) } catch (e) { problems.push(`${file}: cannot read source (${e.code ?? e.message})`) }
}
let checked = 0
for (const [i, item] of literals.entries()) {
  if (!safe(item?.file) || !Object.hasOwn(sources, item.file)) { problems.push(`literal[${i}]: invalid or unindexed source path`); continue }
  if (typeof item.sourceCase !== 'string' || !item.sourceCase || typeof item.case !== 'string' || !item.case) { problems.push(`literal[${i}]: missing case/sourceCase`); continue }
  if (typeof item.quote !== 'string' || item.quote.trim() === '') { problems.push(`literal[${i}]: blank quote`); continue }
  checked++
  if (!cache.get(item.file)?.includes(item.quote)) problems.push(`literal[${i}] ${item.case}/${item.id ?? '<no-id>'}: quote absent from ${item.file}`)
}
if (problems.length) { console.error(`✗ normative evidence check failed (${checked}/${index?.literals?.length ?? 0} literals; ${Object.keys(index?.sources ?? {}).length} source files):`); for (const p of problems.slice(0, 50)) console.error('  -', p); if (problems.length > 50) console.error(`  - … ${problems.length - 50} more`); process.exit(1) }
console.log(`✓ ${checked} current normative literal evidence values match ${Object.keys(index.sources).length} source files (reviewed index bound to oracle bytes)`)

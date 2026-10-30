import assert from 'node:assert/strict'
import test from 'node:test'
import { assertCandidateLockPreconditions, EXPECTED_MEMBERS, EXPECTED_PLATFORM_COMMIT } from './candidate-lock-preconditions.mjs'
const valid = () => ({ platformHead: EXPECTED_PLATFORM_COMMIT, platformTrackedClean: true, memberIds: [...EXPECTED_MEMBERS] })

test('exact six-member clean pinned platform is accepted', () => assert.doesNotThrow(() => assertCandidateLockPreconditions(valid())))
test('member order is immaterial', () => assert.doesNotThrow(() => assertCandidateLockPreconditions({...valid(), memberIds:[...EXPECTED_MEMBERS].reverse()})))
test('missing member cannot produce a valid candidate', () => assert.throws(() => assertCandidateLockPreconditions({...valid(), memberIds:EXPECTED_MEMBERS.slice(1)})))
test('extra member cannot produce a valid candidate', () => assert.throws(() => assertCandidateLockPreconditions({...valid(), memberIds:[...EXPECTED_MEMBERS, 'extra-member']})))
test('duplicate member cannot substitute for the missing member', () => assert.throws(() => assertCandidateLockPreconditions({...valid(), memberIds:[EXPECTED_MEMBERS[0], ...EXPECTED_MEMBERS.slice(0,5)]})))
test('different platform commit is rejected', () => assert.throws(() => assertCandidateLockPreconditions({...valid(), platformHead:'0'.repeat(40)})))
test('tracked-dirty platform is rejected', () => assert.throws(() => assertCandidateLockPreconditions({...valid(), platformTrackedClean:false})))
test('unknown tracked-clean evidence is rejected', () => assert.throws(() => assertCandidateLockPreconditions({...valid(), platformTrackedClean:undefined})))

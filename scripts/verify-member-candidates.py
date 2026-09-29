#!/usr/bin/env python3
"""Isolated source tests, not autonomous contract-review acceptance.

Usage: python3 scripts/verify-member-candidates.py --members-root /absolute/clones \
  --output /absolute/evidence/member-tests.json
Each selected member must be a git checkout with the baseline lock object available.
Only source/test assets are copied to a newly owned OS temporary directory; runtime
homes, credentials, node_modules and sibling checkouts are never copied.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
from datetime import datetime, timezone

TEAM = Path(__file__).resolve().parents[1]
MEMBERS = ('contract-review-lead', 'contract-intake', 'clause-extractor',
           'risk-scanner', 'jurisdiction-auditor', 'review-reporter')
ASSETS = ('agent.json', 'persona.md', 'principles.md', 'skills', 'resources',
          'lib', 'tests', 'package.json', 'package-lock.json')
PROTECTED = ('llm', 'network_security', 'file_security', 'compute_credentials', 'tools', 'env')


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def llm_bytes(data: bytes) -> bytes:
    text = data.decode('utf-8')
    match = re.search(r'"llm"\s*:\s*', text)
    if not match:
        raise ValueError('missing llm block')
    _, count = json.JSONDecoder().raw_decode(text[match.end():])
    return text[match.end():match.end() + count].encode('utf-8')


def copy_assets(source: Path, target: Path) -> dict[str, str]:
    hashes = {}
    for asset in ASSETS:
        start = source / asset
        if not start.exists():
            continue
        paths = sorted(start.rglob('*')) if start.is_dir() else [start]
        for path in paths:
            if path.is_symlink():
                raise ValueError('source symlinks are not accepted by this test harness')
            if not path.is_file():
                continue
            relative = path.relative_to(source)
            if any(part in {'.git', 'node_modules', 'workspace', '__pycache__'} for part in relative.parts):
                continue
            if not path.resolve().is_relative_to(source.resolve()):
                raise ValueError('asset escaped its source checkout')
            data = path.read_bytes()
            destination = target / relative
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(data)
            hashes[relative.as_posix()] = digest(data)
    return hashes


def command(args: list[str], cwd: Path, env: dict[str, str], timeout: int) -> dict:
    try:
        result = subprocess.run(args, cwd=cwd, env=env, text=True,
                                stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                                timeout=timeout, check=False)
        output = re.sub(r'\x1b\[[0-9;]*m', '', result.stdout).replace(str(cwd), '<isolated-member>')
        return {'command': args, 'exitCode': result.returncode, 'output': output}
    except subprocess.TimeoutExpired:
        return {'command': args, 'exitCode': None, 'error': 'timeout'}


def assess_test_result(result: dict) -> dict:
    """Require a complete, unambiguous Node summary for a mandatory suite.

    A clean process exit and scheduled test count alone do not establish that
    tests ran. Skipped, cancelled and TODO cases remain incomplete evidence.
    This harness accepts one Node test-runner summary per member invocation.
    """
    output = result.get('output', '')
    counts = {}
    for key in ('tests', 'pass', 'fail', 'cancelled', 'skipped', 'todo'):
        matches = re.findall(rf'^(?:#|ℹ)\s+{key}\s+(\d+)\s*$', output, re.MULTILINE)
        counts[key] = int(matches[0]) if len(matches) == 1 else None
    complete = all(value is not None for value in counts.values())
    passed = (result.get('exitCode') == 0 and complete
              and counts['tests'] > 0 and counts['pass'] == counts['tests']
              and all(counts[key] == 0 for key in ('fail', 'cancelled', 'skipped', 'todo')))
    return {
        'scheduledTests': counts['tests'],
        'executedTests': (counts['pass'] + counts['fail']) if complete else 0,
        'testsPassed': counts['pass'], 'testsFailed': counts['fail'],
        'testsSkipped': counts['skipped'], 'testsCancelled': counts['cancelled'],
        'testsTodo': counts['todo'], 'summaryComplete': complete, 'passed': bool(passed),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--members-root', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    if not args.members_root.is_absolute() or not args.output.is_absolute():
        parser.error('both paths must be absolute')
    if args.output.exists():
        parser.error('output already exists; retain prior evidence and choose a fresh filename')
    locks = json.loads((TEAM / 'members.lock.json').read_text())['agents']
    env = dict(os.environ)
    env.pop('NODE_PATH', None)
    env.pop('NODE_OPTIONS', None)
    env['NO_COLOR'] = '1'
    report = {'observedAt': datetime.now(timezone.utc).isoformat(),
              'kind': 'isolated-source-tests-not-runtime-acceptance', 'members': []}
    for name in MEMBERS:
        source = args.members_root / name
        item = {'member': name, 'baselineCommit': locks[name]['commit'], 'passed': False}
        try:
            baseline = subprocess.run(['git', 'show', f"{locks[name]['commit']}:agent.json"],
                                      cwd=source, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                                      check=True, timeout=20).stdout
            current = (source / 'agent.json').read_bytes()
            left, right = json.loads(baseline), json.loads(current)
            item['protectedValuesUnchanged'] = {key: left.get(key) == right.get(key) for key in PROTECTED}
            item['modelBytesUnchanged'] = llm_bytes(baseline) == llm_bytes(current)
            item['modelBlockSha256'] = digest(llm_bytes(current))
            if not all(item['protectedValuesUnchanged'].values()) or not item['modelBytesUnchanged']:
                raise ValueError('protected configuration differs from the exact baseline')
            with tempfile.TemporaryDirectory(prefix='contract-member-test-') as directory:
                isolated = Path(directory)
                item['filesSha256'] = copy_assets(source, isolated)
                item['install'] = command(['npm', 'ci', '--ignore-scripts', '--no-audit', '--no-fund'], isolated, env, 90)
                if item['install']['exitCode'] != 0:
                    raise ValueError('isolated npm ci did not succeed')
                item['test'] = command(['npm', 'test'], isolated, env, 90)
                item.update(assess_test_result(item['test']))
        except Exception as error:
            item['error'] = str(error)
        report['members'].append(item)
    report['passed'] = all(item['passed'] for item in report['members'])
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'passed': report['passed'], 'members': [
        {key: item.get(key) for key in ('member', 'passed', 'executedTests', 'modelBytesUnchanged', 'error')}
        for item in report['members']]}, ensure_ascii=False, indent=2))
    return 0 if report['passed'] else 1


if __name__ == '__main__':
    raise SystemExit(main())

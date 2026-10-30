"""Regression tests for evidence accounting; no npm, model or network calls."""
import importlib.util
from pathlib import Path
import unittest
import shutil
import subprocess
import tempfile

MODULE = Path(__file__).resolve().parents[1] / 'verify-member-candidates.py'
spec = importlib.util.spec_from_file_location('verify_members', MODULE)
verify = importlib.util.module_from_spec(spec)
spec.loader.exec_module(verify)


def node_result(*, tests=3, passed=3, failed=0, skipped=0, cancelled=0, todo=0, exit_code=0, prefix='ℹ'):
    pairs = [('tests', tests), ('pass', passed), ('fail', failed),
             ('cancelled', cancelled), ('skipped', skipped), ('todo', todo)]
    return {'exitCode': exit_code, 'output': '\n'.join(f'{prefix} {key} {value}' for key, value in pairs)}


class EvidenceAccounting(unittest.TestCase):
    def test_complete_pass(self):
        self.assertTrue(verify.assess_test_result(node_result())['passed'])

    def test_tap_summary(self):
        self.assertTrue(verify.assess_test_result(node_result(prefix='#'))['passed'])

    def test_all_skipped_is_not_a_pass(self):
        self.assertFalse(verify.assess_test_result(node_result(passed=0, skipped=3))['passed'])

    def test_partially_skipped_mandatory_suite_is_incomplete(self):
        self.assertFalse(verify.assess_test_result(node_result(passed=2, skipped=1))['passed'])

    def test_cancelled_is_incomplete_even_with_zero_exit(self):
        self.assertFalse(verify.assess_test_result(node_result(passed=2, cancelled=1))['passed'])

    def test_todo_is_incomplete(self):
        self.assertFalse(verify.assess_test_result(node_result(passed=2, todo=1))['passed'])

    def test_failure_counter_cannot_be_overridden_by_exit_zero(self):
        self.assertFalse(verify.assess_test_result(node_result(passed=2, failed=1))['passed'])

    def test_missing_summary_fails_closed(self):
        self.assertFalse(verify.assess_test_result({'exitCode': 0, 'output': 'ℹ tests 3'})['passed'])

    def test_zero_tests_is_not_a_pass(self):
        self.assertFalse(verify.assess_test_result(node_result(tests=0, passed=0))['passed'])

    def test_nonzero_exit_and_timeout_are_not_passes(self):
        for code in [1, None, -15]:
            with self.subTest(code=code):
                self.assertFalse(verify.assess_test_result(node_result(exit_code=code))['passed'])

    def test_inconsistent_totals_fail_closed(self):
        self.assertFalse(verify.assess_test_result(node_result(tests=4, passed=3))['passed'])

    def run_real_node_summary(self, skipped):
        node = shutil.which('node')
        self.assertIsNotNone(node, 'Node is required for the real runner accounting check')
        with tempfile.TemporaryDirectory(prefix='contract-node-summary-') as temporary:
            fixture = Path(temporary) / 'summary.test.mjs'
            fixture.write_text("import test from 'node:test';\n"
                               + f"test('accounting fixture', {{skip: {str(skipped).lower()}}}, () => {{}});\n")
            result = subprocess.run([node, '--test', '--test-reporter=tap', str(fixture)],
                                    capture_output=True, text=True, timeout=20, check=False)
            return verify.assess_test_result({'exitCode': result.returncode,
                                             'output': result.stdout + result.stderr})

    def test_real_node_all_skipped_is_incomplete(self):
        result = self.run_real_node_summary(True)
        self.assertFalse(result['passed'])
        self.assertEqual(result['scheduledTests'], 1)
        self.assertEqual(result['executedTests'], 0)
        self.assertEqual(result['testsSkipped'], 1)

    def test_real_node_success_is_executed(self):
        result = self.run_real_node_summary(False)
        self.assertTrue(result['passed'])
        self.assertEqual(result['executedTests'], 1)
        self.assertEqual(result['testsSkipped'], 0)

    def test_source_helper_is_copied_but_runtime_workspace_is_not(self):
        with tempfile.TemporaryDirectory(prefix='contract-copy-source-') as temporary:
            source = Path(temporary) / 'source'
            target = Path(temporary) / 'target'
            (source / 'lib').mkdir(parents=True)
            (source / 'workspace').mkdir()
            helper = b'export const fixture = true;\n'
            (source / 'lib' / 'fixture.mjs').write_bytes(helper)
            (source / 'workspace' / 'runtime-state.json').write_text('{}')
            hashes = verify.copy_assets(source, target)
            self.assertEqual((target / 'lib' / 'fixture.mjs').read_bytes(), helper)
            self.assertEqual(hashes['lib/fixture.mjs'], verify.digest(helper))
            self.assertFalse((target / 'workspace').exists())

    def test_ambiguous_duplicate_summaries_fail_closed(self):
        result = node_result()
        result['output'] += '\n' + result['output']
        self.assertFalse(verify.assess_test_result(result)['passed'])


if __name__ == '__main__':
    unittest.main()

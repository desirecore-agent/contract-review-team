import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const read = (p) => readFile(path.join(repo, p), 'utf8')
const section32 = (text) => {
  const a = text.indexOf('## 三之二、工具用法：避免空转（跨成员）')
  const b = text.indexOf('## 四、证据链')
  assert.ok(a > 0 && b > a, '找不到三之二节')
  return text.slice(a, b)
}

// 2026-10-30 真机：工具参数整段生成完才发出，生成期间连接静默，超过 90 秒被判断流
test('三之二第 6 条：单次写入上限、同一委派内不整份重写、其他长参数同样精简', async () => {
  const s = section32(await read('shared/rules.md'))
  assert.match(s, /6\. \*\*单次写入不超过约 3000 字。\*\*/)
  assert.match(s, /一次 `Write` 的 `content` 或一次 `Edit` 的 `new_string` 控制在约 3000 字以内/)
  assert.match(s, /同一产物 id 的骨架写成后不再用 `Write` 重写，Lead 点名续写的重新委派也一样/)
  assert.match(s, /其他工具的单次参数\n?\s*（如委派任务正文）同样受影响，尽量精简/)
})

test('三之二第 5 条：不再豁免没有 Edit 的成员，超限机器回执按技能分段写且交付时不留注释', async () => {
  const s = section32(await read('shared/rules.md'))
  assert.doesNotMatch(s, /没有 `Edit` 权限的成员/)
  assert.match(s, /超过上限的按技能分段写/)
  assert.match(s, /交付时不留注释/)
})

test('中英更新日志都记录第 6 条', async () => {
  const [zh, en] = await Promise.all([read('CHANGELOG.zh-CN.md'), read('CHANGELOG.md')])
  assert.match(zh, /共享规则第三之二节新增第 6 条/)
  assert.match(en, /Add rule 6 to shared-rules section 3\.2/)
})

# -*- coding: utf-8 -*-
"""
从 R02 派生 R03：**只改签署日期**（2026 → 2019），条款一个字不动。

这是整套时间效力机制最干净的对照实验：同一份合同、同样引用《中华人民共和国合同法》，
只因签署日不同，预期处理必须体现时间适用差异；具体效力结论待专业法律复核——

  R02  签于 2026-08-18  → 记录文本引用与签署日期，转人工核验
  R03  签于 2019-06-20  → 不得仅凭当前法状态自动判成“签署时已废止”

顺带覆盖第二个判据：若所需历史版本全文未获权威核验，应陈述原文事实与版本缺口，
标记“需人工确认”，不得凭训练记忆给出条号或效力断言。
"""
import re, sys, hashlib

SRC, DST = 'R02-govt-purchase-executed.md', 'R03-govt-purchase-2019.md'
body = open(SRC, encoding='utf-8').read()

# 只动日期与编号年份，一处条款文字都不碰
SUBS = [
    ('任务书编号：AHJZU-2026-HW-0417-1', '任务书编号：AHJZU-2019-HW-0417-1', 1),
    ('项目编号：AHJZU-CG-2026-0417',      '项目编号：AHJZU-CG-2019-0417', 1),
    ('合同编号：AHJZU-HT-2026-0417',      '合同编号：AHJZU-HT-2019-0417', 1),
    ('日    期：2026年8月18日              日    期:2026年8月18日',
     '日    期：2019年6月20日              日    期:2019年6月20日', 1),
    ('日    期：2019年6月20日\n', '日    期：2019年6月20日\n', 0),   # 占位，见下
]
for old, new, want in SUBS:
    if want == 0:
        continue
    got = body.count(old)
    if got != want:
        sys.exit(f'✗ 替换未命中（{got}/{want}）：{old[:46]!r}')
    body = body.replace(old, new)

# 见证方日期单独一处
w_old, w_new = '日    期：2026年8月18日', '日    期：2019年6月20日'
if body.count(w_old) != 1:
    sys.exit(f'✗ 见证方日期命中 {body.count(w_old)} 次，应为 1')
body = body.replace(w_old, w_new)

# 自检一：不能有 2026 残留，否则签署日模糊，整个对照实验作废
if re.search(r'2026年', body):
    sys.exit('✗ 仍有 2026 年残留')

# 自检二：必须原样保留的三处（与 R02 完全一致，否则不是同一份合同的对照）
for k in ['《中华人民共和国合同法》',
          '（五）买方未能按时组织验收，由财政部门责令限期改正，给予警告',
          '工程安装调试后,支付剩余货款']:
    if k not in body:
        sys.exit(f'✗ 应保留的原文被改掉了：{k}')

# 自检三：与 R02 的差异必须**只有日期/编号**，条款正文零差异
src_lines = open(SRC, encoding='utf-8').read().split('\n')
dst_lines = body.split('\n')
if len(src_lines) != len(dst_lines):
    sys.exit('✗ 行数不一致，说明改动超出了日期范围')
diff = [(i + 1, a, b) for i, (a, b) in enumerate(zip(src_lines, dst_lines)) if a != b]
for ln, a, b in diff:
    if not re.search(r'(编号|日\s*期)', a):
        sys.exit(f'✗ 第 {ln} 行的改动不属于日期/编号：{a[:50]!r}')

open(DST, 'w', encoding='utf-8').write(body)
print(f'✓ 已生成 {DST}')
print(f'  与 R02 的差异仅 {len(diff)} 行，全部是编号或日期：')
for ln, a, b in diff:
    print(f'    行{ln}: {a.strip()[:44]} → {b.strip()[:44]}')
print(f'  sha256 {hashlib.sha256(body.encode()).hexdigest()}')
print(f'  保留《合同法》引用 {body.count("《中华人民共和国合同法》")} 处 | 提及民法典 {body.count("民法典")} 处')
